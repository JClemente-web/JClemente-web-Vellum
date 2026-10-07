# ADR-002 — Modular monorepo

- Status: accepted
- Date: 2026-10-07

## Context

VELLUM needs a public site, an authenticated cockpit, a field companion, a BFF, domain packages, and processing workers. Those boundaries must exist before the first feature.

## Decision

One repository. Apps: `web`, `site`, `field`, `api`. Packages: `ui`, `domain`, `auth`, `gis`, `telemetry`, `events`, `evidence`, `copilot`, `adapters`, `contracts`, `config`, `observability`, `testing`. Workers live under `workers/processing`. Domain does not import React or Supabase. Browser bundles do not import workers.

## Alternatives

- Option B, one Next.js app for marketing and cockpit. Rejected: couples secrets, SEO, and WebGL.
- Option C, separate repositories or microservices now. Rejected: contract drift is more expensive than a workspace boundary at this size.

## Consequences

Shared contracts, one lockfile, independent deployables later. `apps/field` is not scaffolded until the offline phase.

## Security impact

Secret-bearing code stays in `apps/api` and workers.

## Operational impact

CI builds only affected workspaces once task filtering exists. Until then, plain npm scripts.

## Revisit trigger

A plane needs its own release cadence or scaling profile (processing first).

## Sources

Final spec. ADR-003, ADR-004, ADR-006.
