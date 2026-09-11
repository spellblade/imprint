# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Product roadmap (`docs/roadmap.md`) covering fill workflow and system design.

### Changed

### Fixed

## [1.0.0] - 2026-09-11

### Added

- Landing page with Playground and Extension paths.
- Playground sample sites (careers, checkout, civic, clinic, signup).
- Local identity vault (Maya Ellison demo) and form library.
- Heuristic mapping plus optional Grok AI mapping with timeout fallback.
- Chrome / Edge Manifest V3 extension (scan, fill, ask, save).
- Packed ZIP and CRX3 downloads.
- Never-fill rules for cards, CVC, passwords, and legal checkboxes.
- Repository metadata adapted from universal engineering/audit templates (`docs/`, `VERSION`, GitHub CI).

### Changed

- Header chrome is route-aware: home is wordmark only; playground shows vault nav; extension is sparse.

### Fixed

- AI mapping hang mitigated with client timeout and heuristic-first fill.
