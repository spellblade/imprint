# Security boundaries

Companion to root `SECURITY.md`. Adapted from universal secrets + frontend SPA checklists.

## Vault data

| Surface | Store | Shared? |
| :--- | :--- | :--- |
| Playground | `localStorage` key `imprint-vault` (Zustand) | No |
| Extension | `chrome.storage.local` | No |

Treat as sensitive PII on a shared computer. There is no server-side vault.

## Secrets

- `XAI_API_KEY` is server-only. Never `VITE_`.
- `.env` is gitignored. `.env.example` lists names only.
- CRX signing key: `scripts/imprint-pack.pem`. Gitignored. **Must not** live under `public/`.
- Packer skips `*.pem` inside the extension zip.

## Trust boundaries

- Untrusted: page DOM labels, names, placeholders (extension).
- Sanitize before popup HTML (`escapeHtml`).
- Never-fill regex is a security control, not a UX preference.
- Host permissions are `<all_urls>` because the product fills arbitrary sites. Review before Chrome Web Store submission.

## Auth / database

Auth and Postgres helpers exist in the App Builder scaffold and stay **unused** for Imprint identity. Do not import `authMiddleware` into fill paths.
