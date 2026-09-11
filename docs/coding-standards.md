# Coding standards

Adapted from the TypeScript / frontend SPA sections of the engineering standards. Python-only and OS-diagnostic rules are out of scope.

## TypeScript / React

- Prefer existing tokens in `src/styles.css` `@theme`. No ad-hoc hex in JSX.
- Use shadcn/ui primitives already in `src/components/ui`.
- Strict equality (`===`).
- Do not use `innerHTML` with unsanitized field labels in the extension popup — keep `escapeHtml`.
- No `any` at API boundaries; Zod or explicit types.
- Await server functions; do not leave floating promises on fill/scan.

## Extension

- Manifest V3 only.
- Content script must remain defensive: skip `hidden` / `password` / never-fill regex before write.
- Dispatch `input` and `change` after setting `.value`.
- Do not load remote scripts into the page.

## Persistence

- Web vault: Zustand `persist` → `localStorage`.
- Extension vault: `chrome.storage.local`.
- No Neon / auth for identity (ADR-0001).

## AI

- Calls only from server functions (`createServerFn`), user-initiated, timeout capped.
- Never mock a successful mapping when the key is missing — return `{ ok: false }` and keep heuristics.

## Comments

- Public server functions: short intent comment only if the contract is non-obvious.
- No commented-out dead code.
- Linter suppressions need a same-line why.
