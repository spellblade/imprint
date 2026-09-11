# ADR-0002: Heuristic first, AI second

## Status

Accepted

## Context

Grok mapping can exceed interactive latency. Fill must still work without `XAI_API_KEY`.

## Decision

Always compute heuristic mappings first and apply them. AI may refine leftover fields with a hard timeout. On failure or missing key, keep heuristics and queue asks.

## Consequences

- Positive: playground and extension remain usable offline / without quota.
- Negative: odd labels may ask the user instead of auto-mapping.
