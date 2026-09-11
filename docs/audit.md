# Imprint — Software Audit & Implementation Roadmap

Scaled to this codebase (generic audit standard §1.2.7). Trigger: milestone after landing + packed extension. Depth: full, but findings capped to empirical issues.

Auth-off, no identity database. Model 4 (OS diagnostic remediation) is **not applicable**.

## 1. Executive Summary

Imprint is a local-first form filler. Core never-fill and split-vault decisions are sound. Highest remaining risks are the extension’s broad host permissions, popup HTML interpolation, and missing automated tests around mapping. No P0 credential leak in the web vault path: AI keys stay server-side.

## 2. Project Understanding

- **Architecture:** See [architecture.md](architecture.md).
- **Components:** Landing, playground host + panel, vault, library, MV3 extension, packer.
- **Data flow:** DOM/sample fields → heuristic → optional AI → ask → local store.
- **Config:** `XAI_API_KEY` server-only.
- **Testing:** Node tests on App Builder scripts; no dedicated heuristic/extension suite.
- **CI:** Added `.github/workflows/ci.yml` (lint, typecheck, test, build).

## 3. Findings Summary

| ID | Priority | Category | Title | Confidence | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F-001 | P1 | Security | Extension host permissions are unbounded | Confirmed | None |
| F-002 | P1 | Security | Popup list rendering uses HTML strings | Confirmed | None |
| F-003 | P2 | Testing | Mapping and never-fill have no unit tests | Confirmed | None |
| F-004 | P2 | Operational | CRX signing key must stay off the web root | Confirmed | None |
| F-005 | P3 | Maintainability | Scaffold auth/db unused by product paths | Confirmed | None |

## 4. Detailed Findings

### F-001 — Extension host permissions are unbounded

Priority: P1  
Category: Security  
Confidence: Confirmed  
Location: `public/extension/manifest.json`  
Blast Radius: Large  

**Problem** — `host_permissions` is `http://*/*` and `https://*/*`, so the content script injects on every site.

**Evidence** — `manifest.json` `host_permissions` and `content_scripts.matches`.

**Why It Matters** — A bug in `content.js` can read or write fields on banking and mail origins, even though never-fill tries to skip secrets.

**Recommended Fix** — For store submission, switch to `activeTab` + user-gesture inject only (already used as a popup fallback). Keep `<all_urls>` only if product requires idle scan without a click.

**Risks of Fixing** — Scan-on-open without clicking the icon would stop working.

**Dependencies** — None.

**Validation** — Load unpacked; Fill still works on a sample HTTPS form after clicking the icon.

### F-002 — Popup list rendering uses HTML strings

Priority: P1  
Category: Security  
Confidence: Confirmed  
Location: `public/extension/popup.js` (`renderFields`, `renderVault`)  

**Problem** — Field labels from the page are interpolated into `innerHTML`. `escapeHtml` must remain complete (`&`, `<`, `>`, quotes).

**Why It Matters** — A malicious page can put markup in `aria-label` / placeholder; a broken escaper becomes XSS in the extension popup (privileged UI).

**Recommended Fix** — Prefer `textContent` / `createElement` for labels. Keep a test that `escapeHtml('<img src=x onerror=alert(1)>')` does not survive.

**Risks of Fixing** — Low if DOM construction replaces strings.

**Dependencies** — None.

**Validation** — Page with `placeholder="<script>"` must show escaped text in the popup.

### F-003 — Mapping and never-fill have no unit tests

Priority: P2  
Category: Testing  
Confidence: Confirmed  
Location: `src/lib/heuristic.ts`, `public/extension/content.js`  

**Problem** — Never-fill and alias order are safety-critical and only checked manually.

**Recommended Fix** — Pure tests for card/password/legal skip and LinkedIn vs website alias order.

**Dependencies** — None.

### F-004 — CRX signing key must stay off the web root

Priority: P2  
Category: Operational  
Confidence: Confirmed  
Location: `scripts/pack-extension.py`, `scripts/imprint-pack.pem`  

**Problem** — An earlier pack path wrote the PEM under `public/extension/`, which would be downloadable.

**Recommended Fix** — Keep key under `scripts/`, gitignore `*.pem`, skip pem in the zip (already implemented).

**Dependencies** — None.

### F-005 — Scaffold auth/db unused by product paths

Priority: P3  
Category: Maintainability  
Confidence: Confirmed  
Location: `src/lib/auth/*`, `src/lib/db.ts`  

**Problem** — App Builder auth/db remain in tree. Importing them into fill paths would break deploy (auth-off) or expose world-writable rows.

**Recommended Fix** — Do not import. Document in ADR-0001. Do not delete platform files.

**Dependencies** — None.

## 5. Severity Ranking

F-001, F-002, F-003, F-004, F-005.

## 6. Dependency Graph

All independent except F-003 strongly recommended before changing heuristic aliases.

## 7. Safe Implementation Order

1. F-004 (already landed)  
2. F-002 textContent  
3. F-003 tests  
4. F-001 activeTab-only if store-bound  
5. F-005 leave scaffold in place  

## 8. Phases

- Phase 1: tests for never-fill (F-003).  
- Phase 2: popup DOM construction (F-002); review host permissions (F-001).  
- Phase 3: none required.  
- Phase 4: docs already added this pass.

## 9–10. Execution & testing

See [CONTRIBUTING.md](../CONTRIBUTING.md). Destructive OS tests from generic Model C do not apply.

## 11. Quick Wins

- Keep packing via `scripts/pack-extension.py` after every extension edit.
- Landing / chrome split already reduces accidental vault edits on the marketing page.

## 12. Technical Debt

- Unused Better Auth / PGlite helpers (platform, do not delete).
- Duplicate mapping logic between `src/lib/heuristic.ts` and `public/extension/content.js`.
- No Chrome Web Store listing pipeline.

## 13. Things That Should NOT Be Changed

- Local-only vault (ADR-0001).
- Heuristic-first, AI optional (ADR-0002).
- Never-fill for cards, passwords, legal boxes.
- Split playground vs extension storage.
- TanStack Start / `startup.sh` / `public/__grok` platform contracts.

## 14. Roadmap

Ship as a local-first demo + sideload extension. Before a public store listing: F-002, F-003, tighten F-001, privacy policy for `storage` + `scripting`.
