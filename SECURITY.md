# Security Policy

## Supported versions

| Version | Supported |
| :--- | :--- |
| 1.x | Yes |

## Reporting a vulnerability

Do **not** open a public GitHub issue for security reports.

Email the maintainer privately, or use GitHub Security Advisories if this repository is on GitHub.

**SLA:** initial response within 48 hours.

## Scope

Imprint stores identity data **locally** (web `localStorage` or `chrome.storage.local`). It does not run user accounts. Do not report “missing cloud encryption” as a defect unless a server is actually receiving vault payloads.

In-scope:

- Vault or form data leaving the device unexpectedly
- `XAI_API_KEY` exposure to the browser bundle
- Filling of passwords, payment PAN/CVC, or legal consent boxes
- Path or script injection in the extension content script
- XSS via field labels rendered in the popup

Out of scope:

- User-chosen data stored in localStorage on a shared computer
- Chrome blocking sideloaded CRX files (platform policy)
