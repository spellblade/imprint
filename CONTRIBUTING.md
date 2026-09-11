# Contributing

## Small-project branching

Imprint uses the two-branch model from the universal template (staging omitted):

- `main` — production. No direct commits.
- `develop` — integration.
- `feature/*` and `fix/*` — cut from `develop`, squash-merge back.
- `hotfix/*` — cut from `main`, merge to both `main` and `develop`.

Promotions `develop` → `main` use a **merge commit**, not squash.

## Commits

Conventional Commits: `feat(playground): …`, `fix(extension): …`, `docs: …`.

## Pull requests

Use `.github/PULL_REQUEST_TEMPLATE.md`. Put `Fixes #N` in the PR body that lands on `main`.

## Local checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Pack the extension after changing `public/extension/`:

```bash
python3 scripts/pack-extension.py
```

The signing key is `scripts/imprint-pack.pem` (gitignored). Do not copy it into `public/`.

## Do not

- Enable auth or a shared database for vault data (see [ADR-0001](docs/adr/0001-local-vault-no-cloud-accounts.md)).
- Prefix `XAI_API_KEY` with `VITE_`.
- Fill passwords, card numbers, or legal checkboxes.
- Rewrite TanStack Start / Vite platform files under `server/`, `scripts/grok-pwa-*`, or `public/__grok/`.
