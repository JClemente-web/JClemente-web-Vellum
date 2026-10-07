# VELLUM V3 Architecture Gate Pack

Date: 2026-10-07. Evidence is the canonical docs and `docs/research/SOURCE_REGISTRY.md`. This is not a runtime test.

## Gate table

- PRODUCT — PASS. Final spec states the loop, personas, and cutline.
- DOMAIN — PASS. Invariants and the one-pilot rule from RBAC 100.23(b) are in the spec and ADR-012.
- TENANCY — PASS. Tenant is the isolation boundary. ADR-006.
- DATA — PASS. Schemas and outbox in ADR-005 and ADR-008. PITR numbers are not invented.
- AUTH — PASS. Supabase Auth JWT, BFF authorization. ADR-006.
- API — PASS. REST `/api/v1` and OpenAPI. ADR-007.
- SUPABASE — PASS as a decision. No project created. Region preference is sourced.
- RLS — PASS as a requirement: defense in depth, not the only control.
- STORAGE — PASS. Private evidence, logical immutability, CDN caveat recorded.
- REALTIME — PASS. Allowed only with RLS, channel authz, and a cross-tenant test.
- AUDIT — PASS. Append-only for clients.
- EVENTS — PASS. Transactional outbox and idempotency. ADR-008.
- GIS — PASS. MapLibre + deck.gl primary. 3D engines lazy.
- GEODESY — PASS. EPSG:31978–31985 each have a registry URL. EPSG:4979 is not SIRGAS 2000.
- REGULATORY — PASS for the model. RBAC 100 categories and transition facts are sourced. ICA article bodies are not encoded. SORA_STATUS = NOT_CONFIRMED.
- DRONE — PASS. Canonical telemetry, adapters, no vendor domain.
- TELEMETRY — PASS. Envelope fields and ordering rules are specified.
- VCP — PASS. Versioned manifest is in the spec.
- EVIDENCE — PASS. Logical immutability. WORM is not claimed. ADR-010.
- OFFLINE — PASS as a later design. States are named. Not implemented.
- PROCESSING — PASS. Off the HTTP path. No AGPL engine in-repo. ADR-011.
- AI — PASS. ADR-012.
- SECURITY — PASS as a model. `docs/security/VELLUM_V3_SECURITY_MODEL.md`. Not a live test.
- PRIVACY/LGPD — PASS as a model. Specialized legal review still required before production. `VELLUM_V3_DATA_GOVERNANCE.md`.
- OSS — PASS. Prohibited and conditional libraries are listed. Nothing was installed.
- FRONTEND — PASS. Vite cockpit, separate field app, token rules.
- DESIGN SYSTEM — PASS as Phase 1 scope. Not built.
- PUBLIC SITE — PASS. Astro decision. ADR-013. Launch blocked by HD-4.
- SEO — PASS. Public-only strategy matches ADR-003.
- ACCESSIBILITY — PASS as a Phase 1 acceptance bar (WCAG AA). Not measured.
- PERFORMANCE — PASS as budgets to enforce later. Cesium and Potree excluded from initial JS.
- OBSERVABILITY — PASS. Correlation fields and health are required from Phase 0 onward.
- DR — PASS as a plan. Restore test is Phase 11. RPO/RTO not invented.
- FINOPS — PASS as counters first, quotas in V3.1.
- CI/CD — PASS as a pipeline definition. No workflows were added in this batch.
- TESTING — PASS as a strategy. No product tests exist yet, and none were faked.
- DEPLOYMENT — PASS. Cloud Run for the BFF, Supabase for data, site separated. No deploy was performed.
- CURSOR RULES FILES — PASS. `AGENTS.md` plus `.cursor/rules/00` through `90` are on disk. `docs/architecture/CURSOR_PROJECT_RULES.md` is the narrative index, not a second source of truth.

## Architecture blockers

None. RT-013 was the missing rule files. Those files are now present.

ARCHITECTURE_GATE = PASS.
