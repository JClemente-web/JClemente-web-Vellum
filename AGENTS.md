# AGENTS.md — VELLUM OS

PROJECT = VELLUM OS
BUILD_MODE = GREENFIELD
VELLUM_REPOSITORY_ONLY = YES

VELLUM is Operational Intelligence + Evidence OS. VELLUM is not STRIX. Do not read, copy, import, or depend on STRIX code, git, database, Supabase, secrets, CI, or infrastructure. Conceptual visual kinship is the only allowed relationship.

## Canonical loop

CAPTURE → PROCESSING → INTELLIGENCE → FINDING → HUMAN REVIEW → DECISION → ACTION → REINSPECTION → VERIFICATION → RESULT

## Architecture

Modular npm-workspace monorepo. Public site (`apps/site`, Astro + React islands) is separate from the authenticated cockpit (`apps/web`, Vite + React). Business use cases go Browser → BFF → domain service → data access. Supabase Auth may issue the session JWT. The BFF authorizes membership before it resolves a tenant. Normal database traffic uses `vellum_app` with transaction-local RLS context. Direct Data API access from the browser is deny-by-default. `service_role` / secret keys stay on the server and are not a general application shortcut. RLS is defense in depth.

## Invariants

- EXECUTED != RESOLVED
- ORIGINAL != DERIVED (logical immutability; do not claim WORM / Object Lock unless the storage capability is proven)
- DRAFT REPORT != APPROVED REPORT
- AI PLANE != FLIGHT CONTROL PLANE
- Metric calculations do not run directly on a geographic CRS
- EPSG:4979 (WGS 84 geographic 3D) is not SIRGAS 2000 (EPSG:4989 / EPSG:4674)
- Regulatory text is versioned data. A historical mission uses the rule version effective on the mission date
- SORA is not a confirmed requirement of RBAC nº 100. Do not hardcode it as law
- No AGPL or GPL code in the proprietary core without explicit legal approval
- Public SEO does not apply to the private cockpit. `robots.txt` is not a security or deindex mechanism
- Do not invent PASS, Search Console data, keyword volume, RPO/RTO, or rankings

## Source precedence

1. `docs/research/SOURCE_REGISTRY.md` for external claims
2. ADRs in `docs/adr/`
3. `docs/product/VELLUM_V3_FINAL_SPEC.md`
4. This file

Evidence labels: OBSERVED, OFFICIAL_SOURCE, INFERRED, NEEDS_VERIFICATION, EXPERIMENT. Do not present inference as fact.

## Gates

No phase advances on appearance. Status is only PASS, FAIL, or BLOCKED, with evidence. Phase 0 implementation is forbidden until a human authorizes it after FINAL_ARCHITECTURE_GATE = PASS.

## Package manager

npm only. One `package-lock.json`. Do not add `bun.lock`, `bun.lockb`, `pnpm-lock.yaml`, or `yarn.lock`.
