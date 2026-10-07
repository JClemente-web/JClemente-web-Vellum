# ADR-001 — Greenfield rebuild

- Status: accepted
- Date: 2026-10-07

## Context

The previous takeover of an AI Studio Phase 0 was abandoned. This repository has no commits and no application tree. STRIX is a different product.

## Decision

VELLUM OS starts as a new history in `JClemente-web/JClemente-web-Vellum`. Prior material may inform requirements and risks. It is not implementation evidence. No historical SHA is restored.

## Alternatives

- Replay the old Phase 0 tag. Rejected: that history is not this repository's implementation.
- Import STRIX. Rejected: permanent isolation.

## Consequences

Documentation and, later, code are written here from the spec. A future `v3-phase-0-complete` tag, if created after a real Phase 0, belongs to this history only.

## Security impact

No inherited secrets, migrations, or RLS policies.

## Operational impact

Empty remote stays empty until a human asks to push.

## Revisit trigger

Discovery of a signed archive the owner explicitly designates as source. Even then, it is reviewed, not replayed blindly.

## Sources

Observed git state on 2026-10-07: `main`, no HEAD, remote `https://github.com/JClemente-web/JClemente-web-Vellum.git`.
