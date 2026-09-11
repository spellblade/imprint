# Imprint

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](VERSION)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> Fill any form from a local identity vault. Ask once for unknown fields. Remember the page.

Imprint is a form-fill product with two surfaces that **do not share data**: a web playground for sample sites, and a Chrome / Edge Manifest V3 extension for real pages. Cards, passwords, and legal checkboxes are never filled.

## Features

- **Heuristic fill** maps labels, names, and autocomplete attributes to vault keys.
- **Optional AI mapping** (Grok, server-only) for unfamiliar fields, with a timeout fallback.
- **Ask once** for custom fields; answers can be saved to the vault.
- **Form library** stores a page schema for the next visit.
- **Packed extension** — ZIP for Load unpacked, CRX3 for archive / store upload.

## Quick Start

### Prerequisites

- Node.js 22+

### Web app

```bash
npm install
npm run dev
```

Open the printed local URL. Landing offers Playground or Extension.

### Extension

1. Download `public/imprint-extension.zip` (or the CRX).
2. Chrome / Edge → Extensions → Developer mode → Load unpacked → the unzipped `imprint` folder.
3. Edit the vault in the popup, then Scan / Fill on a real form.

Chrome will not install a random CRX by double-click. Use Load unpacked.

## Documentation Map

- [Setup](docs/setup.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Usage](docs/usage.md)
- [Coding standards](docs/coding-standards.md)
- [Security](docs/security.md)
- [Audit notes](docs/audit.md)
- [ADRs](docs/adr/)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). This is a **small project**: `develop` → `main` (no staging branch).

## License

MIT — see [LICENSE](LICENSE).
