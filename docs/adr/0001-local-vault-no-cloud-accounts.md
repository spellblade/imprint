# ADR-0001: Local vault, no cloud accounts

## Status

Accepted

## Context

Imprint fills personal identity fields. A shared database with auth-off would make vault rows world-writable. Auth-on would add accounts for a product whose extension already has a local store.

## Decision

Keep identity on-device. Playground uses `localStorage`. Extension uses `chrome.storage.local`. No `user_id`, no Neon for vault or saved forms.

## Consequences

- Positive: no cross-user leakage; extension works offline for heuristic fill.
- Negative: two vaults never sync; clearing site data wipes the demo vault.
