# Setup

## Prerequisites

- Node.js 22
- npm (lockfile is `package-lock.json`)
- Python 3 + OpenSSL only if you rebuild the CRX

## Install

```bash
npm install
cp .env.example .env   # add XAI_API_KEY only if you want AI fill
npm run dev
```

The app listens on `0.0.0.0:8080` in this workspace. Do not bind another port.

## Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Dev server (required wrapper, not raw `vite`) |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Node test runner on scripts + selected lib tests |
| `python3 scripts/pack-extension.py` | ZIP + CRX3 into `public/` |

## Environment

| Variable | Where | Notes |
| :--- | :--- | :--- |
| `XAI_API_KEY` | Server only | Optional. Heuristic fill works without it. Never `VITE_`. |

Do not commit `.env`. Platform injects `DATABASE_URL` on deploy; this product does not use it for vault data.
