# Architecture

## Two surfaces

```text
  Browser (this origin)                    Browser (any origin)
  ┌─────────────────────┐                  ┌─────────────────────┐
  │  Landing            │                  │  Extension popup    │
  │  Playground + panel │                  │  content.js         │
  │  Vault / Library    │                  │  background.js      │
  └──────────┬──────────┘                  └──────────┬──────────┘
             │                                        │
             ▼                                        ▼
     localStorage                              chrome.storage.local
     (Zustand persist)                         (vault + savedForms)
             │                                        │
             └──────── no shared backend ─────────────┘
```

They never sync. Maya in the playground is not the extension vault.

## Web app

- Routes: `/` landing, `/playground`, `/vault`, `/library`, `/extension`
- Shell chrome is route-aware (`AppShell`)
- Scan + heuristic map run in the playground host; AI map is a server function (`src/lib/ai.ts`) with a 10s abort
- Sample sites are React forms, not live third-party pages

## Extension

- MV3: popup, content script, service worker
- Content script discovers inputs/selects/textareas, applies never-fill, writes values, highlights
- Popup owns Scan / Fill / Save / ask queue / vault editor

## Mapping pipeline

1. Scan DOM (or sample-site field list)
2. Heuristic aliases + autocomplete
3. Optional AI for leftovers (timeout → keep heuristic)
4. Ask queue for `needsInput`
5. Optional save of form schema

## What we are not

Model 4 in the generic audit standards (layered OS diagnostic / remediation CLI) does **not** apply. Imprint does not inventory the host OS, delete packages, or run a 9-stage remediation pipeline.
