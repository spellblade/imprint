#!/usr/bin/env python3
"""Pack public/extension into a Load-unpacked zip and a CRX3 file."""
from __future__ import annotations

import hashlib
import struct
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "extension"
OUT_ZIP = ROOT / "public" / "imprint-extension.zip"
OUT_CRX = ROOT / "public" / "imprint-extension.crx"
KEY = ROOT / "scripts" / "imprint-pack.pem"


def encode_varint(n: int) -> bytes:
    out = bytearray()
    while n > 0x7F:
        out.append((n & 0x7F) | 0x80)
        n >>= 7
    out.append(n)
    return bytes(out)


def encode_bytes(field: int, data: bytes) -> bytes:
    tag = encode_varint((field << 3) | 2)
    return tag + encode_varint(len(data)) + data


def zip_bytes(prefix: str | None) -> bytes:
    from io import BytesIO

    buf = BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(SRC.rglob("*")):
            if not path.is_file():
                continue
            if path.name in {"imprint-pack.pem", "imprint-pack.pub"}:
                continue
            rel = path.relative_to(SRC).as_posix()
            arc = f"{prefix}/{rel}" if prefix else rel
            zf.write(path, arc)
    return buf.getvalue()


def ensure_key() -> None:
    if KEY.exists():
        return
    subprocess.check_call(
        [
            "openssl",
            "ecparam",
            "-name",
            "prime256v1",
            "-genkey",
            "-noout",
            "-out",
            str(KEY),
        ]
    )


def public_der() -> bytes:
    return subprocess.check_output(
        ["openssl", "ec", "-in", str(KEY), "-pubout", "-outform", "DER"],
        stderr=subprocess.DEVNULL,
    )


def sign(data: bytes) -> bytes:
    proc = subprocess.run(
        ["openssl", "dgst", "-sha256", "-sign", str(KEY)],
        input=data,
        check=True,
        capture_output=True,
    )
    return proc.stdout


def pack_crx(payload: bytes) -> bytes:
    ensure_key()
    pub = public_der()
    crx_id = hashlib.sha256(pub).digest()[:16]
    signed_header = encode_bytes(1, crx_id)
    signed_prefix = b"CRX3 SignedData\x00" + struct.pack("<I", len(signed_header))
    signature = sign(signed_prefix + signed_header + payload)
    proof = encode_bytes(1, pub) + encode_bytes(2, signature)
    header = encode_bytes(3, proof) + encode_bytes(10000, signed_header)
    return b"Cr24" + struct.pack("<I", 3) + struct.pack("<I", len(header)) + header + payload


def main() -> None:
    unpacked = zip_bytes("imprint")
    OUT_ZIP.write_bytes(unpacked)
    crx_payload = zip_bytes(None)
    OUT_CRX.write_bytes(pack_crx(crx_payload))
    print(f"zip {OUT_ZIP.stat().st_size} bytes")
    print(f"crx {OUT_CRX.stat().st_size} bytes")


if __name__ == "__main__":
    main()
