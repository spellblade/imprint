## Summary

<!-- One sentence: what changed and why -->

## Related Issues

Closes #

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring

## Changes

| File Path | Description |
| :--- | :--- |
| | |

## Verification

1. `npm run lint && npm run typecheck && npm test`
2. Playground: fill a sample site; cards/passwords stay empty
3. If `public/extension/` changed: `python3 scripts/pack-extension.py` and Load unpacked

## Checklist

- [ ] No `VITE_` on `XAI_API_KEY`
- [ ] Never-fill rules preserved
- [ ] Vault still local-only (no auth/db for identity)
- [ ] `CHANGELOG.md` `[Unreleased]` updated
- [ ] Branch is based on `develop`
