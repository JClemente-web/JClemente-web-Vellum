# VELLUM V3 Build Plan

Date: 2026-10-07. Architecture matches `VELLUM_V3_FINAL_SPEC.md` and ADRs 001–014. Phase 0 implementation is not authorized by this document.

## Locked decisions

- Modular npm-workspace monorepo. No Turborepo or Nx until measured.
- Astro + React islands for `apps/site`. Fastify + TypeScript for the BFF. REST `/api/v1` + OpenAPI.
- Supabase Auth for the session. BFF for use cases. Data API deny-by-default. RLS is defense in depth. Secret key is not the normal path.
- Brazil-first SIRGAS 2000. Logical evidence immutability, not claimed WORM. No AGPL in the core. AI is not flight control.
- Public host deferred. São Paulo region preferred and not created here.

## Phases

Each phase needs objective, scope, out of scope, deliverables, tests, security, accessibility, performance, observability, docs, rollback, and a PASS/FAIL/BLOCKED gate. SEO work is cross-cutting and only on `apps/site`.

### Phase -3 to remediation

Done as documents in this batch: safety was already PASS; discovery, research, ADRs, and gates are the files in `docs/`.

### Phase 0 — Foundation (not started)

The executable plan is `docs/superpowers/plans/2026-10-07-vellum-phase-0-foundation.md`. This section does not authorize implementation.

Repository skeleton, npm workspaces, strict TypeScript, lint, Vitest, Playwright smoke, Storybook token page, env schema, domain primitives, Zod contracts, GIS constants limited to verified EPSG codes, evidence types, outbox types, health endpoint, Docker file, CI including secret scan, first PostGIS migration with a tenant-isolation probe, OSS inventory policy. No product screens. Exit only with recorded command results. Tag `v3-phase-0-complete` only after that, on this history.

### Phase 1 — Design system and shell

Tokens, primitives, desktop shell, command-palette structure, Storybook, keyboard and contrast checks. No live tenant data.

### Phase 2 — Auth and tenancy

Supabase Auth, BFF JWT validation, membership, RBAC, RLS, storage and realtime isolation tests. Cross-tenant failure blocks exit.

### Phase 3 — Operational twin

Project, site, zone, asset, subasset, versions, timeline. Time travel for at least one attribute.

### Phase 4 — GIS

MapLibre, deck.gl, layer manager, selection, CRS pipeline. No Cesium or Potree. Measurement refuses geographic CRS.

### Phase 5 — Missions and telemetry

Mission, vehicle, sensor, canonical envelope, one non-vendored adapter approach, idempotent ingest, playback. Many vehicles may be stored. One pilot controls one UA unless an authorization record says otherwise.

### Phase 6 — Evidence and findings

VCP, hash, original versus derived, review. A critical finding without evidence is rejected. Originals are not overwritten.

### Phase 7 — Actions

Assignment, execution evidence, reinspection, verification, closure. Executed does not become closed by itself.

### Phase 8 — Copilot

Policy, tools, provenance, eval harness. No universal database tool. No flight tools.

### Phase 9 — Processing and 3D

Queues, resumable upload, workers off the request path. External photogrammetry adapter only. Cesium and Potree viewer only after the pinned license notice. No ODM source in the repo.

### Phase 10 — Reports, portal, public site

Draft versus approved report, portal of published objects, Astro site only after legal name and canonical host. SEO checklist from the growth strategy.

### Phase 11 — Hardening

Tenant and AI review, load and failure tests, restore test, license audit.

### Phase 12 — Production readiness

Criteria in `VELLUM_V3_RELEASE_CRITERIA.md`. RPO and RTO are written from the contracted service, not from this plan.

## Critical path

Docs and gates, then Phase 0, then shell, then tenancy. Twin and missions both need tenancy. Evidence needs twin and missions. Actions, Copilot value, and processing outputs need evidence. The public site does not block the cockpit. It blocks a marketing launch.

## First implementation batch, still waiting

Phase 0, and only after a separate human authorization. This build plan does not start it.
