# VELLUM Phase 0 — Foundation implementation plan

Date: 2026-10-07.
Status: PLAN only. Implementation is not authorized by this file.
Method position: SPEC is the accepted architecture. This document is PLAN. The executor uses TDD, then IMPLEMENT, VERIFY, REVIEW, COMMIT.
PHASE_0_IMPLEMENTATION_AUTHORIZED = NO.

## Frozen decisions the executor must not reopen

- Repository: `JClemente-web/JClemente-web-Vellum`. Branch for this work starts from `architecture/greenfield-baseline` after the documentation baseline exists.
- Package manager: npm workspaces only. One `package-lock.json`. No Turborepo, Nx, Bun, pnpm, or Yarn.
- Apps created in Phase 0: `apps/api` (Fastify), `apps/web` (Vite + React cockpit shell), `apps/site` (Astro + React islands technical shell).
- Packages created in Phase 0: `domain`, `contracts`, `config`, `gis`, `events`, `evidence`, `observability`, `testing`, `auth`.
- `packages/auth` is pure. It does not import Supabase, HTTP, or the filesystem. Supabase Auth arrives in Phase 2.
- Not created in Phase 0, because they would be empty: `apps/field`, `packages/ui`, `packages/copilot`, `packages/telemetry`, `packages/adapters`, `workers/processing`. `TelemetryEnvelopeV1` lives in `packages/contracts`. The design system package starts in Phase 1.
- Browser data path: no business Data API. No `service_role` in `apps/web` or `apps/site`. RLS is defense in depth.
- Evidence immutability is logical. Do not claim WORM or Object Lock.
- GIS: no handwritten datum math. Metric guards only. Constants below are the verified set from ADR-009, access date 2026-10-07.
- Regulatory: version, provenance, effective dates, and a generic compliance contract only. No article-level flight-rule engine. No encoded ICA 100-40 or ICA 100-48 article.
- Node.js: Active LTS on 2026-10-07 is 24.x (Krypton), from the Node.js Release schedule (https://github.com/nodejs/Release). 26.x is Current until 2026-10-28. Pin line `24`. First command of P0-W01 re-reads that schedule. If execution starts on or after 2026-10-28, keep 24 unless the then-Active LTS is accepted by the installed engines of Astro, Fastify, Vite, Vitest, Playwright, Storybook, and the Supabase CLI. Record the chosen exact version in `.nvmrc` and use that same version in `package.json` engines, GitHub Actions, and Docker. Do not pin Current while 24 remains Active LTS.
- Database: local and CI Postgres + PostGIS only. Do not create a Supabase project. Do not deploy.
- If the tenant-isolation matrix, including the pooled-connection leak test, cannot run in CI, Phase 0 is BLOCKED, not PASS.
- BFF database identity, transaction-local RLS context, and local/CI role bootstrap are frozen in the next section and in ADR-006. Do not reopen them during Phase 0 implementation.
- Coverage gate for behavioral foundation files: at least 95% lines, 95% branches, and 95% functions. Declarative UI is not forced to that branch number. A coverage drop on a gated package fails CI.
- HD-4 remains closed: `apps/site` is a non-indexable technical build. No public launch, no canonical host, no invented marketing copy.

## BFF database identity and RLS execution context

This section freezes the security remediation from the Phase 0 plan review. ADR-006 holds the same decision. The product architecture is unchanged: modular npm monorepo, Fastify BFF, REST and OpenAPI, Supabase/Postgres/PostGIS, browser Data API deny-by-default, RLS as defense in depth.

### Two role models

VELLUM BFF database connection and the Supabase Data API are not the same model.

- BFF connection: login `vellum_app`. The API process uses this role for ordinary queries after authorization.
- Supabase Data API, only if a future ADR enables it for a named resource: PostgREST roles `anon`, `authenticated`, and `service_role`, with `auth.uid()` and the hosted key model. Phase 0 does not create those roles and does not simulate them.

Before implementing P0-W19, re-read the current Supabase documentation for RLS, grants, and API keys. A local Postgres role script does not become Supabase Auth or PostgREST by itself.

### `vellum_app`

Attributes, all required: `LOGIN`, `NOSUPERUSER`, `NOBYPASSRLS`, `NOCREATEDB`, `NOCREATEROLE`, `NOINHERIT`.

`NOINHERIT` stays. In PostgreSQL it does not remove privileges granted directly `TO vellum_app`. It stops the role from silently using privileges of some other role it is a member of. Phase 0 grants are direct, so application queries still work. The BFF does not `SET ROLE`. Do not grant `vellum_app` membership in a privileged role.

Ordinary traffic does not connect as `postgres`, `service_role`, `superuser`, or any `BYPASSRLS` role.

### Custom `vellum_anon`

DEFERRED. Browser Data API access is deny-by-default, so a homemade anon role does not test the BFF and can be mistaken for Supabase `anon`. No Phase 0 fixture creates it. A future Data API exception uses the real Supabase role names and its own ADR.

### Role bootstrap

Database roles are not created inside versioned business migration SQL. `supabase/migrations/0001_foundation.sql` has no `CREATE ROLE` and no password.

Local and CI bootstrap lives in `scripts/bootstrap-local-db-role.mjs`. It runs before the migration, as admin, and only when `VELLUM_DEPLOYMENT_TIER` is `local` or `ci`. It refuses `staging` and `production`. It reads `VELLUM_LOCAL_DB_PASSWORD` from the environment and refuses an empty value or the sample value `replace-me`. The password is a bound parameter, not a SQL literal in the repository migration.

CI injects `VELLUM_LOCAL_DB_PASSWORD` on the isolation job. Local orchestration reads it from the developer environment. `.env.example` carries `replace-me`. `.env` stays gitignored. `infra/docker-compose.yml` passes the variable through and does not embed a password. The ephemeral CI value may appear only as a job environment entry in `.github/workflows/quality.yml`. That value is not a production secret and is not copied into staging or production.

### Request flow

Client, then Supabase Auth, then JWT, then Fastify. The BFF validates the JWT and takes the authenticated user id. It loads membership and authorizes the requested resource. Only that step resolves the tenant. It then opens a database transaction, applies the transaction-local settings, runs the query, and commits or rolls back.

Phase 0 does not build the login UI or production JWT verification. It does build the pure authorization function, the transaction helper, and the SQL proof of the same context rules. Phase 2 attaches real Supabase JWT verification to that function. It does not replace the settings with `auth.uid()` on the BFF connection.

A tenant id in the body, header, query string, or route is not authority. Editable `user_metadata` is not an input. `app_metadata` is not used in Phase 0. If a later phase adds a tenant claim there, the claim can be stale until refresh, and membership in the database remains the source of truth.

### Transaction-local context

The only allowed mechanism:

```sql
BEGIN;
SELECT set_config('app.user_id', $1, true);
SELECT set_config('app.tenant_id', $2, true);
-- authorized queries
COMMIT;
```

The third argument `true` is required. It makes the setting local to the transaction. Session-level settings are forbidden on pooled connections. `COMMIT` and `ROLLBACK` clear them.

`DatabaseRequestContext` carries `userId`, `tenantId`, and `correlationId`. `requestId` and `actorType` are optional. The only builder is `authorizeMembership`. It returns the context after a membership check. No public handler constructs the context from raw request fields.

### Fail closed

Policies call `app.current_user_id()` and `app.current_tenant_id()`. Those helpers return null when the setting is missing, blank, or not a UUID. A null comparison matches no row. There is no fallback tenant. `FORCE ROW LEVEL SECURITY` is on for the probe tables. The test connects as `vellum_app`, which is not the table owner, and also asserts `rolbypassrls = false`.

### Isolation matrix

Required before `PHASE_0_STATUS = PASS`:

- `A_READ_A` = PASS
- `A_READ_B` = DENY
- `B_READ_B` = PASS
- `B_READ_A` = DENY
- `NO_CONTEXT_READ` = DENY
- `FORGED_TENANT_CONTEXT` = DENY
- `UPDATE_A_TO_B` = DENY
- `INSERT_A_AS_B` = DENY
- `POOL_CONTEXT_LEAK` = DENY
- `BYPASSRLS_NORMAL_APP_ROLE` = FALSE
- `ORIGINAL_EVIDENCE_CROSS_TENANT_ACCESS` = DEFERRED

The evidence row is deferred because Phase 0 has no evidence table. The in-memory evidence package still rejects a derived record whose tenant differs from the original. The SQL proof for evidence arrives with the evidence table, not in this phase.

`FORGED_TENANT_CONTEXT` sets `app.user_id` to user A and `app.tenant_id` to tenant B. The row in tenant B stays invisible because membership does not include B.

`POOL_CONTEXT_LEAK` uses one pooled connection: transaction A sees tenant A and commits; the next transaction on that connection, with no `set_config`, sees nothing; a following transaction for tenant B sees only B. A rolled-back transaction that set tenant A also leaves the next statement with no context.

## Red-team closure carried into this plan

Historical totals: blocker 0, high 4, medium 6, low 3.
Unresolved: blocker 0, high 0, medium 0, low 0.
All thirteen findings are REMEDIATED. None block Phase 0.
RT-001 residual (storage CDN cache is global; PITR for sa-east-1 is NEEDS_VERIFICATION) is a project-creation check. Phase 0 does not create that project.

## Data-governance boundary

`docs/security/VELLUM_V3_DATA_GOVERNANCE.md` is sufficient for foundation architecture: classification, personal and sensitive data, tenant ownership, purpose metadata, retention, deletion, legal hold, export, access, audit, offboarding, backup lifecycle, residency, processor and subprocessor, encryption with key management still NEEDS_VERIFICATION, analytics consent, marketing consent, DSAR architecture, and the deletion versus evidence-retention conflict.
DATA_GOVERNANCE_ARCHITECTURE_GATE = PASS_FOR_FOUNDATION.
This is not a legal opinion. Do not record LEGAL_COMPLIANCE = PASS.

## Competitive research

COMPETITIVE_PRIMARY_SOURCES_STATUS = PARTIAL.
Remaining primary-source gaps are NON_BLOCKING_RESEARCH_BACKLOG.
Reopen an ADR only if a new primary source invalidates an accepted decision.

## Import boundaries

Enforce with `scripts/check-boundaries.mjs`, executed in P0-W03. The script scans source files and fails on forbidden imports.

| Package or app | May import | Must not import |
| --- | --- | --- |
| `packages/domain` | nothing from the repo | `react`, `@supabase/*`, `fastify`, `node:fs`, `node:http`, `zod` |
| `packages/contracts` | `zod` | React, Supabase, Fastify, application services, filesystem |
| `packages/auth` | `domain` | React, Supabase, HTTP clients, filesystem |
| `packages/gis` | `domain` | PROJ bindings, handwritten transform formulas, React |
| `packages/events` | `domain`, `contracts` | a broker client, Kafka, RabbitMQ |
| `packages/evidence` | `domain` | React, storage SDKs, UI |
| `packages/config` | `zod` | React, service-role values in a public schema |
| `packages/observability` | `domain` types for correlation only if needed; prefer zero domain coupling | a vendor SaaS SDK |
| `packages/testing` | `domain` | production secrets |
| `apps/api` | `domain`, `contracts`, `auth`, `config`, `observability`, `events` | browser bundles, `apps/web`, `apps/site` |
| `apps/web` | its own UI code | `service_role`, `packages/evidence` storage, worker code, Supabase service key |
| `apps/site` | its own UI code | cockpit use cases, `service_role`, `apps/web` internals |
| `workers/processing` | not created | browser imports would be forbidden when it exists |

`packages/domain` stays free of Zod so identity and result behavior can be tested without a schema library. Contracts validate at the edge and call domain parsers.

## Node, TypeScript, and quality baseline

`.nvmrc` contains `24`.
Root `package.json` `engines.node` is `>=24.21.0 <25`. Raise the patch floor if P0-W01 finds a newer 24.x security release. Do not exceed 24.

TypeScript compiler options for every package, via `packages/config/tsconfig.base.json`:

- `strict`: true
- `noUncheckedIndexedAccess`: true
- `exactOptionalPropertyTypes`: true
- `noImplicitOverride`: true
- `noFallthroughCasesInSwitch`: true
- `useUnknownInCatchVariables`: true
- `noPropertyAccessFromIndexSignature`: false in Phase 0. It rejects normal indexed config reads and does not add a safety property the other flags miss. Revisit in Phase 1 if a package starts using open index signatures for domain data.

ESLint forbids `@typescript-eslint/no-explicit-any`, `ban-ts-comment` with `ts-ignore` and `ts-nocheck` set to error. An exception needs an inline comment that starts with `vellum-allow:` and states the reason. The boundary script fails if that prefix appears without a reason on the same line.

## Coverage

Vitest with the V8 provider.
Thresholds apply only to:

- `packages/domain`
- `packages/contracts`
- `packages/auth`
- `packages/gis`
- `packages/evidence`
- `packages/config`

Thresholds: lines 95, branches 95, functions 95, statements 95.
`apps/web` and `apps/site` use Playwright plus axe. They are excluded from the 95% branch gate.

## Scanners and why each exists

- Lockfile gate: fails if `bun.lock`, `bun.lockb`, `pnpm-lock.yaml`, or `yarn.lock` exists.
- Gitleaks: fails if a secret is committed.
- `npm audit --audit-level=high`: fails on high or critical advisories in the lockfile.
- `dependency-review-action` on pull requests: fails on a newly introduced high or critical advisory.
- CodeQL `javascript-typescript`: SAST for the code we compile. Semgrep is not added. A second SAST without a distinct rule pack is not justified.
- Trivy: scans the API image for OS and library vulnerabilities. Fail on HIGH and CRITICAL with a fix available.
- `npm sbom --sbom-format cyclonedx`: produces an artifact. The command must succeed. It is not a vulnerability gate.
- Dependabot: npm and GitHub Actions, weekly. Renovate is not added beside it.
- `scripts/check-licenses.mjs`: fails if a direct or transitive production dependency is AGPL, GPL, or LGPL unless the package name is listed in `docs/oss/PHASE0_LICENSE_EXCEPTIONS.md` with a legal-approval id. Phase 0 starts with an empty exception list. No AGPL exception is pre-approved.

## Workstreams

Fields that are identical are stated once here and not repeated as vague text:

- SECURITY_GATE for a package with no I/O: boundary script plus no secret fixture.
- TENANT_ISOLATION_IMPACT `NONE` means the workstream does not touch tenant data. `PRIMITIVE` means it adds a pure tenant type. `PROOF` means it adds the database isolation test.
- ACCESSIBILITY_GATE `N/A` means no UI. UI workstreams name the axe command.
- PERFORMANCE_GATE for Phase 0: typecheck and unit tests under 3 minutes on CI for the unit job, and the API health handler does no remote call. No load test in Phase 0.
- LICENSE_CHECK: `npm run licenses:check` after the lockfile exists.
- ROLLBACK: `git revert` of that workstream commit only, with no history rewrite.

### P0-W01 — Runtime and repository baseline

- PURPOSE: Pin one Node line and ignore secrets and foreign lockfiles.
- PRECONDITIONS: Documentation baseline exists. Implementation has been separately authorized.
- DEPENDENCIES: none.
- FILES_CREATED: `.nvmrc`, `.gitignore`, `.editorconfig`, `README.md` (how to boot the foundation only).
- FILES_MODIFIED: none.
- COMMANDS: re-read https://github.com/nodejs/Release ; install Node 24.x ; `node -v`.
- TEST_FIRST: no. This is declarative.
- EXPECTED_RED_STATE: not applicable.
- IMPLEMENTATION_STEPS: write `.nvmrc` with `24`. `.gitignore` ignores `.env`, `.env.*` except `.env.example`, `node_modules`, `dist`, `coverage`, `playwright-report`, `storybook-static`, `.supabase`.
- EXPECTED_GREEN_STATE: `node -v` prints `v24.*`.
- REFACTOR_CHECK: README states Phase 0 scope and does not claim a product feature.
- SECURITY_GATE: `.gitignore` covers `.env`.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: N/A.
- LICENSE_CHECK: N/A until the lockfile exists.
- VERIFICATION_COMMANDS: `node -v`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `chore: pin Node 24 and ignore local secrets`
- DEFINITION_OF_DONE: version file, ignore file, and editor config exist. Node major is 24.
- BLOCKS: P0-W02.
- BLOCKED_BY: none.

### P0-W02 — npm workspace architecture

- PURPOSE: Create the workspace graph without product behavior.
- PRECONDITIONS: P0-W01.
- DEPENDENCIES: npm 10 or newer shipped with Node 24.
- FILES_CREATED: root `package.json`, empty-of-behavior `package.json` for each Phase 0 package and app listed above, `scripts/check-lockfiles.mjs`.
- FILES_MODIFIED: none.
- COMMANDS: `npm install` once, producing `package-lock.json`. No other package manager.
- TEST_FIRST: `node scripts/check-lockfiles.mjs` fails before the script exists. After it exists and before any foreign lockfile, it passes. A fixture test copies a fake `pnpm-lock.yaml` into a temp dir and expects exit 1. That test lives in `scripts/check-lockfiles.test.mjs` and runs under `node --test`.
- EXPECTED_RED_STATE: missing script, exit fails.
- IMPLEMENTATION_STEPS: `"workspaces": ["apps/*", "packages/*"]`. Private root. Scripts: `lockfiles:check`, `lint`, `typecheck`, `test`, `test:coverage`, `build`. Each package name is `@vellum/<dir>`.
- EXPECTED_GREEN_STATE: `npm ls --workspaces` lists the Phase 0 workspaces. Foreign lockfile test fails the gate.
- REFACTOR_CHECK: no dependency other than the workspace links yet.
- SECURITY_GATE: no dependency added beyond what a child workstream declares.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: N/A.
- LICENSE_CHECK: after install, run the license script once P0-W21 exists. Until then, record the lockfile hash.
- VERIFICATION_COMMANDS: `npm run lockfiles:check`.
- ROLLBACK: revert this commit and delete `node_modules` locally.
- COMMIT_MESSAGE: `chore: initialize npm workspace foundation`
- DEFINITION_OF_DONE: one lockfile, workspaces resolve, foreign lockfile gate fails closed.
- BLOCKS: P0-W03, P0-W04.
- BLOCKED_BY: P0-W01.

### P0-W03 — TypeScript, lint, and formatting

- PURPOSE: One strict compiler baseline and import boundaries.
- PRECONDITIONS: P0-W02.
- DEPENDENCIES: typescript, eslint, `@typescript-eslint/*`, prettier. Pin the current versions at install time. Do not invent versions in this plan.
- FILES_CREATED: `packages/config/tsconfig.base.json`, `packages/config/eslint.base.mjs`, `prettier.config.mjs`, `scripts/check-boundaries.mjs`, `scripts/check-boundaries.test.mjs`.
- FILES_MODIFIED: every Phase 0 `tsconfig.json` extends the base.
- COMMANDS: `npm install` the dev tools at the root.
- TEST_FIRST: boundary fixture. A temp file under a mocked `packages/domain` containing `import "react"` must fail `check-boundaries.mjs`.
- EXPECTED_RED_STATE: the fixture is not detected before the script exists.
- IMPLEMENTATION_STEPS: apply the compiler flags in the baseline section. ESLint rule set as specified. Prettier is formatting only.
- EXPECTED_GREEN_STATE: `npm run typecheck` and `npm run lint` exit 0 on the skeleton. The React-in-domain fixture exits 1.
- REFACTOR_CHECK: no `any`, no `ts-ignore`, no `ts-nocheck`.
- SECURITY_GATE: boundary script covers the table above.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: N/A.
- LICENSE_CHECK: new dev dependencies pass P0-W21 once that script exists. MIT, Apache-2.0, and BSD-2-Clause or BSD-3-Clause are allowed.
- VERIFICATION_COMMANDS: `npm run lint`, `npm run typecheck`, `node --test scripts/check-boundaries.test.mjs`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `chore: configure strict TypeScript and quality gates`
- DEFINITION_OF_DONE: flags match this plan. Boundary fixture fails closed.
- BLOCKS: every following TypeScript workstream.
- BLOCKED_BY: P0-W02.

### P0-W04 — Test infrastructure

- PURPOSE: Vitest, coverage thresholds, and Playwright layout.
- PRECONDITIONS: P0-W03.
- DEPENDENCIES: vitest, `@vitest/coverage-v8`, playwright. Install browsers in CI with `npx playwright install --with-deps chromium` only.
- FILES_CREATED: `vitest.config.ts`, `playwright.config.ts`, `tests/e2e/.gitkeep` is forbidden. Create `tests/e2e/readme-is-not-used.txt` is also forbidden. The first e2e file arrives in P0-W13 and P0-W15. This workstream creates the configs and `tests/unit/.gitkeep` is forbidden too. Create `packages/testing/src/index.ts` exporting `testTenantId` fixture helpers once P0-W05 exists; until then this workstream only adds the runner config.
- FILES_MODIFIED: root scripts `test`, `test:coverage`, `test:e2e`.
- COMMANDS: `npx vitest run`.
- TEST_FIRST: one smoke `packages/testing/src/runner-smoke.test.ts` that asserts `true`. This is the runner proof, not a domain test.
- EXPECTED_RED_STATE: `vitest` is not installed, command fails.
- IMPLEMENTATION_STEPS: coverage include list from the Coverage section. Thresholds start enforced when those packages have tests (P0-W05 onward). Before domain tests exist, set thresholds in config but do not fail an empty include. The moment `packages/domain/src` has a file, thresholds are active. Implement that switch in the config by reading the include globs that exist.
- EXPECTED_GREEN_STATE: smoke test passes. Coverage config lists the six packages.
- REFACTOR_CHECK: no skipped tests.
- SECURITY_GATE: Playwright does not store auth state.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: axe is wired in P0-W15.
- PERFORMANCE_GATE: unit job target under 3 minutes once the suite exists.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: config present.
- LICENSE_CHECK: dev dependencies only.
- VERIFICATION_COMMANDS: `npx vitest run`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `test: establish testing and coverage baseline`
- DEFINITION_OF_DONE: Vitest runs. Coverage config names the gated packages.
- BLOCKS: all behavioral workstreams.
- BLOCKED_BY: P0-W03.

### P0-W05 — Domain primitives

- PURPOSE: Identity, result, errors, metadata, provenance, and regulatory version primitives.
- PRECONDITIONS: P0-W04.
- DEPENDENCIES: none beyond TypeScript.
- FILES_CREATED: see file catalog, domain section.
- FILES_MODIFIED: `packages/domain/package.json` exports.
- COMMANDS: `npx vitest run packages/domain`.
- TEST_FIRST: write the test files in the catalog before the implementation files. Run Vitest. Failures must be missing-module or missing-export, not a rewritten assertion.
- EXPECTED_RED_STATE: cannot resolve `./ids/tenant-id.js` and the other exports.
- IMPLEMENTATION_STEPS: branded UUID parsers. `Result` is `{ ok: true, value } | { ok: false, error }` with `exactOptionalPropertyTypes` respected. `DomainError` has a stable `code` string union. `EntityMetadata`, `VersionMetadata`, `AuditMetadata`, `Provenance`, `SpatialQuality`, `CrsMetadata` are separate modules. Regulatory module exports `RegulatoryVersion` with `authorityCode`, `instrumentId`, `sourceRegistryId`, `effectiveFrom`, `effectiveTo`. It does not export an evaluator.
- EXPECTED_GREEN_STATE: invalid UUID rejected. `Result` does not allow both value and error. Regulatory export surface has no `evaluate` function.
- REFACTOR_CHECK: no `types.ts` barrel of all types. `index.ts` re-exports modules.
- SECURITY_GATE: parsers do not log the input.
- TENANT_ISOLATION_IMPACT: PRIMITIVE (`TenantId`).
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: pure functions.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: 95/95/95 on `packages/domain`.
- LICENSE_CHECK: no new runtime dependency.
- VERIFICATION_COMMANDS: `npx vitest run packages/domain --coverage`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `feat(domain): add VELLUM core primitives`
- DEFINITION_OF_DONE: catalog tests green and coverage gate met.
- BLOCKS: P0-W06, P0-W07, P0-W08, P0-W09, P0-W10, P0-W19.
- BLOCKED_BY: P0-W04.

Domain file catalog. Each implementation file has the test beside it under `packages/domain/src/**/*.test.ts`.

- `packages/domain/src/ids/tenant-id.ts` — parse and brand a UUID. Rejects empty and non-UUID.
- `packages/domain/src/ids/user-id.ts`
- `packages/domain/src/ids/project-id.ts`
- `packages/domain/src/ids/site-id.ts`
- `packages/domain/src/ids/zone-id.ts`
- `packages/domain/src/ids/asset-id.ts`
- `packages/domain/src/ids/mission-id.ts`
- `packages/domain/src/ids/finding-id.ts`
- `packages/domain/src/ids/action-id.ts`
- `packages/domain/src/ids/evidence-id.ts`
- `packages/domain/src/result/result.ts` — `ok` and `err` constructors. `err` has no `value`.
- `packages/domain/src/errors/domain-error.ts` — codes `invalid_id`, `invariant_violated`, `unauthorized_tenant`.
- `packages/domain/src/metadata/entity-metadata.ts` — createdAt, updatedAt, createdBy.
- `packages/domain/src/metadata/version-metadata.ts` — revision integer greater than or equal to 1.
- `packages/domain/src/metadata/audit-metadata.ts` — actor, at, correlationId.
- `packages/domain/src/provenance/provenance.ts` — sourceRegistryId, retrievedAt, method `OFFICIAL_SOURCE` or `NEEDS_VERIFICATION`.
- `packages/domain/src/spatial/spatial-quality.ts` — stores a CRS code and a quality flag. Does not transform.
- `packages/domain/src/spatial/crs-metadata.ts` — epsg code, kind `geographic` or `projected` or `vertical`. Kind is data, not a calculator.
- `packages/domain/src/regulatory/regulatory-version.ts` — version record only.
- `packages/domain/src/regulatory/compliance-contract.ts` — `{ contractId, regulatoryVersionId, status: "unassessed" }`. Status has no flight outcome.
- `packages/domain/src/index.ts` — re-exports only.
- `packages/domain/src/regulatory/regulatory-scope.test.ts` — imports the regulatory barrel and asserts `evaluateFlightRule` is not exported.

### P0-W06 — Runtime contracts

- PURPOSE: Versioned Zod schemas for the envelopes the rest of the system will share.
- PRECONDITIONS: P0-W05.
- DEPENDENCIES: `zod`. Pin current 3.x or the current stable major if the maintainer has moved the stable line. Reject a prerelease.
- FILES_CREATED: catalog below.
- FILES_MODIFIED: `packages/contracts/package.json`.
- COMMANDS: `npx vitest run packages/contracts`.
- TEST_FIRST: for each schema, tests for a valid payload, an invalid payload, an unknown `schemaVersion`, and an extra field. Extra fields are stripped only when the schema calls `.strict()` and the test expects rejection. Decision: all V1 schemas use `.strict()` so unknown fields fail. That is safer than silent strip for webhooks and telemetry.
- EXPECTED_RED_STATE: schema modules missing.
- IMPLEMENTATION_STEPS: implement the six schemas. Round-trip test: `parse(JSON.parse(JSON.stringify(value)))` equals the parsed value.
- EXPECTED_GREEN_STATE: the four cases pass per schema.
- REFACTOR_CHECK: schemas do not import `apps/api`.
- SECURITY_GATE: fixtures contain no realistic secret. Use `example-key`.
- TENANT_ISOLATION_IMPACT: PRIMITIVE (tenantId required on envelopes that carry tenancy).
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: correlationId required on event and audit schemas.
- COVERAGE_GATE: 95/95/95 on `packages/contracts`.
- LICENSE_CHECK: Zod license must be MIT.
- VERIFICATION_COMMANDS: `npx vitest run packages/contracts --coverage`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `feat(contracts): add versioned runtime contracts`
- DEFINITION_OF_DONE: six schemas, strict unknown fields, coverage gate met.
- BLOCKS: P0-W07, P0-W13.
- BLOCKED_BY: P0-W05.

Contract files:

- `packages/contracts/src/event/event-envelope-v1.ts` — fields from ADR-008: schemaVersion literal `1`, eventId, tenantId, aggregateId, timestamp, sequence, actor, source, correlationId, causationId, idempotencyKey, payload object.
- `packages/contracts/src/vcp/vcp-manifest-v1.ts` — schemaVersion, manifestId, tenantId, evidenceId, contentHash, role `original` or `derived`.
- `packages/contracts/src/telemetry/telemetry-envelope-v1.ts` — schemaVersion, tenantId, missionId, observedAt, sourceCrs. No vendor SDK type.
- `packages/contracts/src/audit/audit-event-v1.ts` — schemaVersion, tenantId, actorId, action, at, correlationId.
- `packages/contracts/src/webhook/webhook-envelope-v1.ts` — schemaVersion, deliveryId, tenantId, idempotencyKey, payload.
- `packages/contracts/src/api/api-error-v1.ts` — schemaVersion, code, message, correlationId. Message must not have a `stack` field. The strict schema rejects `stack`, `serviceRole`, and `authorization`.
- `packages/contracts/src/index.ts`
- Tests live next to each schema file.

### P0-W07 — Event foundation

- PURPOSE: In-memory idempotency and envelope construction. Durable outbox SQL is P0-W19.
- PRECONDITIONS: P0-W06.
- DEPENDENCIES: contracts and domain.
- FILES_CREATED: `packages/events/src/ids/event-id.ts`, `packages/events/src/idempotency/memory-store.ts`, `packages/events/src/build-envelope.ts`, `packages/events/src/index.ts`, and matching tests.
- FILES_MODIFIED: none outside the package.
- COMMANDS: `npx vitest run packages/events`.
- TEST_FIRST: duplicate idempotency key for the same tenant returns the original event id. The same key in another tenant does not collide. Missing correlation id fails validation.
- EXPECTED_RED_STATE: modules missing.
- IMPLEMENTATION_STEPS: memory store is a `Map` keyed by `tenantId + idempotencyKey`. No network.
- EXPECTED_GREEN_STATE: the two tenant cases pass.
- REFACTOR_CHECK: no broker client in package.json.
- SECURITY_GATE: store is not a singleton across tenants in tests. Construct one store per fixture and still key by tenant.
- TENANT_ISOLATION_IMPACT: PRIMITIVE.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: envelope requires correlationId.
- COVERAGE_GATE: events are behavioral. Include `packages/events` in the 95% gate as well. Add it to the coverage include list in this workstream.
- LICENSE_CHECK: no new dependency.
- VERIFICATION_COMMANDS: `npx vitest run packages/events --coverage`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `feat(events): add envelope and tenant idempotency primitives`
- DEFINITION_OF_DONE: cross-tenant key isolation proven in memory.
- BLOCKS: P0-W19 outbox columns.
- BLOCKED_BY: P0-W06.

### P0-W08 — GIS and geodesy safety foundation

- PURPOSE: Prove CRS identity and refuse geographic CRS for critical metric work.
- PRECONDITIONS: P0-W05.
- DEPENDENCIES: domain types only.
- FILES_CREATED: catalog below.
- FILES_MODIFIED: coverage include already lists `packages/gis`.
- COMMANDS: `npx vitest run packages/gis`.
- TEST_FIRST: the assertions in the catalog. They fail before the constants exist.
- EXPECTED_RED_STATE: missing exports.
- IMPLEMENTATION_STEPS: constants only for codes whose SOURCE_REGISTRY status is VERIFIED. No transform function is exported. A test imports the package index and asserts `transform` and `stTransform` are undefined.
- EXPECTED_GREEN_STATE: distinctions and the metric guard pass.
- REFACTOR_CHECK: no coefficient table for a geoid.
- SECURITY_GATE: wrong CRS is treated as an integrity error, code `metric_crs_rejected`.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: 95/95/95.
- LICENSE_CHECK: no PROJ native binding in Phase 0.
- VERIFICATION_COMMANDS: `npx vitest run packages/gis --coverage`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `feat(gis): add verified CRS safety foundation`
- DEFINITION_OF_DONE: no transform API. Distinctions match ADR-009.
- BLOCKS: none in Phase 0. Phase 4 consumes it.
- BLOCKED_BY: P0-W05.

GIS files:

- `packages/gis/src/crs/epsg-codes.ts` — exports the verified integers 4674, 4989, 4979, 31978, 31979, 31980, 31981, 31982, 31983, 31984, 31985. Each constant has a comment with the EPSG name and the access date 2026-10-07.
- `packages/gis/src/crs/crs-kind.ts` — 4674 and 4989 and 4979 are `geographic`. 31978 through 31985 are `projected`.
- `packages/gis/src/crs/metric-guard.ts` — `assertMetricCrs(code)` returns a Result. Geographic codes fail. Projected codes in the verified set succeed. Any other code fails with `crs_not_verified`.
- `packages/gis/src/crs/distinctions.test.ts` — `4674 !== 4989`, `4979 !== 4674`, `4979 !== 4989`, and the string `"SIRGAS2000"` is not equal to a numeric 4979 comparison helper `isSirgas2000(4979) === false`.
- `packages/gis/src/index.ts` — does not export a transform.

### P0-W09 — Evidence foundation

- PURPOSE: Original and derived identities, content hash, provenance, logical immutability.
- PRECONDITIONS: P0-W05.
- DEPENDENCIES: `node:crypto` for SHA-256. That is a Node API, not a storage SDK. Allowed here because the package is server-side. Do not import `node:fs`.
- FILES_CREATED: catalog below.
- FILES_MODIFIED: none.
- COMMANDS: `npx vitest run packages/evidence`.
- TEST_FIRST: derived id cannot equal the original id it references. Hash of the same bytes is stable. The module index has no `overwriteOriginal` export.
- EXPECTED_RED_STATE: missing exports.
- IMPLEMENTATION_STEPS: `contentHash(bytes: Uint8Array): string` returns hex SHA-256. `linkDerived` fails if the derived id equals the original id. No mutation method is defined.
- EXPECTED_GREEN_STATE: the three tests pass.
- REFACTOR_CHECK: no storage bucket client.
- SECURITY_GATE: hash input is bytes, not a file path.
- TENANT_ISOLATION_IMPACT: PRIMITIVE. Evidence records include `tenantId` and the link rejects a derived tenant that differs from the original tenant.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: 95/95/95.
- LICENSE_CHECK: no new dependency.
- VERIFICATION_COMMANDS: `npx vitest run packages/evidence --coverage`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `feat(evidence): add evidence provenance primitives`
- DEFINITION_OF_DONE: immutability is logical and tested. No storage implementation.
- BLOCKS: none in Phase 0.
- BLOCKED_BY: P0-W05.

Evidence files:

- `packages/evidence/src/original-evidence-id.ts`
- `packages/evidence/src/derived-evidence-id.ts`
- `packages/evidence/src/content-hash.ts`
- `packages/evidence/src/provenance.ts`
- `packages/evidence/src/link-derived.ts`
- `packages/evidence/src/immutability.test.ts`
- `packages/evidence/src/index.ts`

### P0-W10 — Tenant context and authorization primitives

- PURPOSE: Separate authentication inputs from authorization. Build `DatabaseRequestContext` only after a membership check.
- PRECONDITIONS: P0-W05.
- DEPENDENCIES: domain.
- FILES_CREATED: `packages/auth/src/database-request-context.ts`, `packages/auth/src/authorize-membership.ts`, `packages/auth/src/database-request-context.test.ts`, `packages/auth/src/authorize-membership.test.ts`, `packages/auth/src/index.ts`.
- FILES_MODIFIED: none.
- COMMANDS: `npx vitest run packages/auth`.
- TEST_FIRST: write the tests before the modules. A caller that passes a user id and a requested tenant without a matching membership receives `unauthorized_tenant`. A successful call returns `userId`, `tenantId`, and `correlationId`. The function signature has no `user_metadata` argument. A test imports the package index and asserts there is no `fromRequest` or `createDatabaseRequestContext` export. `assertSameTenant` still fails when the two tenant ids differ.
- EXPECTED_RED_STATE: missing exports.
- IMPLEMENTATION_STEPS: `authorizeMembership({ userId, memberships, requestedTenantId, correlationId, requestId, actorType })` returns a `Result`. `memberships` is the fixture list of tenant ids for that user. Phase 0 does not call Supabase. Phase 2 fills `memberships` from the database after JWT validation and then calls this same function. Missing user, empty membership, or a requested tenant outside the list is deny. Optional `requestId` and `actorType` are copied only on success. `index.ts` exports `authorizeMembership`, `assertSameTenant`, and the context type. It does not export a raw constructor.
- EXPECTED_GREEN_STATE: forged requested tenant fails. Same-tenant membership succeeds. No network import.
- REFACTOR_CHECK: package.json has no `@supabase/supabase-js`.
- SECURITY_GATE: default is deny. The context cannot be built from a request field alone.
- TENANT_ISOLATION_IMPACT: PRIMITIVE. Source of truth in this package is the membership list, not the requested id.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: pure function.
- OBSERVABILITY_GATE: context carries correlationId.
- COVERAGE_GATE: 95/95/95. `packages/auth` is already in the authz gate.
- LICENSE_CHECK: no new dependency.
- VERIFICATION_COMMANDS: `npx vitest run packages/auth --coverage`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `feat(auth): add membership-gated tenant context`
- DEFINITION_OF_DONE: a valid user id without membership is denied. The raw context constructor is not exported.
- BLOCKS: P0-W20 transaction helper. Health routes in P0-W13 do not set tenant context.
- BLOCKED_BY: P0-W05.

### P0-W11 — Environment and secret boundaries

- PURPOSE: Public, server, and secret schemas. Fail the frontend build if a secret name is public.
- PRECONDITIONS: P0-W03.
- DEPENDENCIES: zod, already added in P0-W06. If this workstream is parallel before W06, install zod here and let W06 reuse it.
- FILES_CREATED: `packages/config/src/env/public-env.ts`, `server-env.ts`, `secret-env.ts`, `assert-no-public-secrets.ts`, `.env.example`, tests.
- FILES_MODIFIED: `.gitignore` already ignores `.env`.
- COMMANDS: `npx vitest run packages/config`.
- TEST_FIRST: object `{ VITE_SUPABASE_SERVICE_ROLE_KEY: "x" }` fails `assertNoPublicSecrets`. Missing `DATABASE_URL` in server env fails. `.env.example` contains `replace-me` and the test reads the file and fails if it matches a JWT-shaped value or the text `service_role`. The same test fails if `.env.example` contains `local-dev-only` or any other concrete database password.
- EXPECTED_RED_STATE: modules missing.
- IMPLEMENTATION_STEPS: public keys must start with `VITE_` and their names must not include `SERVICE_ROLE`, `SECRET`, `DATABASE_URL`, or `SERVICE_KEY`. Server env requires `NODE_ENV` and optional `DATABASE_URL`. Secret env is server-only and is not imported by `apps/web` or `apps/site`. The boundary script fails if those apps import `secret-env`.
- EXPECTED_GREEN_STATE: the leak fixture fails closed. Example file passes.
- REFACTOR_CHECK: no real key in the example file.
- SECURITY_GATE: this workstream is the gate.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: 95/95/95 on `packages/config`.
- LICENSE_CHECK: no new dependency if zod is already present.
- VERIFICATION_COMMANDS: `npx vitest run packages/config --coverage`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `feat(config): enforce environment boundaries`
- DEFINITION_OF_DONE: public namespace cannot carry the forbidden names.
- BLOCKS: P0-W13, P0-W14.
- BLOCKED_BY: P0-W03.

`.env.example` keys:

- `DATABASE_URL=replace-me` — runtime URL whose user is `vellum_app`.
- `VELLUM_LOCAL_ADMIN_DATABASE_URL=replace-me` — local and CI admin URL used only by bootstrap and seed. The server env schema rejects this key when `VELLUM_DEPLOYMENT_TIER` is `staging` or `production`.
- `VELLUM_LOCAL_DB_PASSWORD=replace-me` — sample only. The bootstrap script refuses this sample. CI supplies a different ephemeral value through the job environment. That value is not written into `.env.example` and is not a production secret.
- `VELLUM_DEPLOYMENT_TIER=local`
- `PUBLIC_SUPABASE_URL` is not used in Phase 0 because there is no Supabase project. Do not add it.
- `LOG_LEVEL` sample value `info` is allowed because it is not a secret. Use `info`, not `replace-me`, for that one key.

`VELLUM_LOCAL_DB_PASSWORD` is never read by `apps/web` or `apps/site`. The boundary script fails if those apps mention that name.

### P0-W12 — Observability, correlation, and health DTOs

- PURPOSE: Logger interface, correlation, health and readiness DTOs, build metadata.
- PRECONDITIONS: P0-W11.
- DEPENDENCIES: none. Do not install an OpenTelemetry SDK or a vendor exporter. Fields `traceId` and `spanId` are optional strings so a future adapter can map the OpenTelemetry API without a Phase 0 dependency.
- FILES_CREATED: `packages/observability/src/logger.ts`, `correlation.ts`, `health.ts`, `readiness.ts`, `build-metadata.ts`, `index.ts`, tests.
- FILES_MODIFIED: none.
- COMMANDS: `npx vitest run packages/observability`.
- TEST_FIRST: logger redacts keys `authorization`, `cookie`, `service_role`, `database_url`. Health DTO allows only `status: "ok"`. Readiness allows `ready` or `not_ready` plus a `checks` array of `{ name, status }`. Build metadata returns `commitSha` from the env `VELLUM_COMMIT_SHA` or `unknown` when absent. The literal `unknown` is the only allowed fallback and the test asserts it.
- EXPECTED_RED_STATE: modules missing.
- IMPLEMENTATION_STEPS: structured logger writes JSON to stdout through an injected writer. Tests pass a memory writer.
- EXPECTED_GREEN_STATE: redaction and DTO tests pass.
- REFACTOR_CHECK: no network exporter.
- SECURITY_GATE: redaction test.
- TENANT_ISOLATION_IMPACT: NONE. Logs must accept a tenantId field but the logger does not query data.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: health DTO builder does no I/O.
- OBSERVABILITY_GATE: this workstream is the gate.
- COVERAGE_GATE: not in the six-package 95% list. Still require the redaction branches to be tested. Do not lower the other gates.
- LICENSE_CHECK: no new dependency.
- VERIFICATION_COMMANDS: `npx vitest run packages/observability`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `feat(observability): add health and correlation foundation`
- DEFINITION_OF_DONE: secret-bearing keys are redacted in the test.
- BLOCKS: P0-W13.
- BLOCKED_BY: P0-W11.

### P0-W13 — Minimal API scaffold

- PURPOSE: Fastify process with three routes and an OpenAPI document that matches them.
- PRECONDITIONS: P0-W06, P0-W11, P0-W12.
- DEPENDENCIES: `fastify`. Pin the current 5.x stable. If 5.x is not the stable line at install time, stop and record the conflict before choosing another major.
- FILES_CREATED: `apps/api/src/server.ts`, `apps/api/src/routes/health.ts`, `ready.ts`, `version.ts`, `apps/api/src/openapi.ts`, `apps/api/src/correlation.ts`, `apps/api/test/routes.test.ts`, `tests/e2e/api-health.spec.ts`.
- FILES_MODIFIED: root `test:e2e` includes this spec.
- COMMANDS: `npx vitest run apps/api`, `npx playwright test tests/e2e/api-health.spec.ts`.
- TEST_FIRST: inject the Fastify app. `GET /health` returns 200 and body `{ status: "ok" }` with no other keys. `GET /ready` returns 503 when the database probe reports down, and 200 when it reports up. `GET /api/v1/version` returns `{ schemaVersion: 1, name: "vellum-api", commitSha }`. Response has no `stack`, `env`, or key material. Response header `x-correlation-id` echoes a supplied id or sets a UUID.
- EXPECTED_RED_STATE: app module missing.
- IMPLEMENTATION_STEPS: build the app in a function `buildApp(deps)` so tests inject the probe. OpenAPI document lists only those three paths. A test snapshots the path keys.
- EXPECTED_GREEN_STATE: status, schema, secrecy, and correlation tests pass.
- REFACTOR_CHECK: no CRUD route file exists.
- SECURITY_GATE: response key allow-list tested.
- TENANT_ISOLATION_IMPACT: NONE on these routes. They do not read tenant rows.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: health does not call the probe. Ready does one `select 1` when a database URL is configured.
- OBSERVABILITY_GATE: correlation header test.
- COVERAGE_GATE: route tests cover the status branches. API app is outside the 95% package list.
- LICENSE_CHECK: Fastify is MIT.
- VERIFICATION_COMMANDS: vitest and the Playwright spec.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `feat(api): add health readiness and version routes`
- DEFINITION_OF_DONE: three routes, OpenAPI matches, no secrets in the body.
- BLOCKS: P0-W16, P0-W17.
- BLOCKED_BY: P0-W06, P0-W11, P0-W12.

Ready behavior, frozen:

- If `DATABASE_URL` is absent, `/ready` returns 503 and check `database` is `not_configured`.
- If it is present and `select 1` succeeds, 200.
- If it is present and the probe throws, 503 and check `database` is `down`.
- The body never includes the connection string.

### P0-W14 — Minimal web and site scaffolds

- PURPOSE: Prove the two frontends build, stay non-indexable, and contain no invented product data.
- PRECONDITIONS: P0-W03, P0-W11.
- DEPENDENCIES: Vite, React, Astro. Pin current stables at install time. Astro major must match the current stable docs fetched that day.
- FILES_CREATED: `apps/web/index.html`, `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/vite.config.ts`, `apps/site/astro.config.mjs`, `apps/site/src/pages/index.astro`.
- FILES_MODIFIED: none.
- COMMANDS: `npm run build --workspace @vellum/web` and `npm run build --workspace @vellum/site`.
- TEST_FIRST: a Node test reads the built HTML and expects `noindex` and does not expect the words `revenue`, `customers`, or a fake coordinate pair. Write the test against the build output path before polishing the page.
- EXPECTED_RED_STATE: build script missing.
- IMPLEMENTATION_STEPS: web page title `VELLUM`. Body text `Cockpit shell`. Meta robots `noindex, nofollow`. Site page title `VELLUM`. Body text `Public site is not available.` Meta robots `noindex, nofollow`. No sitemap integration. No canonical link.
- EXPECTED_GREEN_STATE: both builds exit 0 and the HTML test passes.
- REFACTOR_CHECK: no dashboard component, no map, no chart.
- SECURITY_GATE: neither app depends on `secret-env` or a service-role name. Boundary script covers it.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: one heading, a skip target is not required on a one-line shell. Contrast of the default foreground and background is checked in P0-W15.
- PERFORMANCE_GATE: production build does not include Cesium, Potree, or MapLibre.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: not the 95% branch gate.
- LICENSE_CHECK: Vite, React, and Astro licenses are MIT.
- VERIFICATION_COMMANDS: the two build commands and the HTML assertion test.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `chore(web): add non-indexable cockpit and site shells`
- DEFINITION_OF_DONE: both apps build. Both send noindex. Neither contains product claims.
- BLOCKS: P0-W15.
- BLOCKED_BY: P0-W03, P0-W11.

### P0-W15 — Storybook and accessibility foundation

- PURPOSE: Storybook builds. One foundation story shows technical tokens, status text, and a focus ring. Axe smoke is mandatory.
- PRECONDITIONS: P0-W14.
- DEPENDENCIES: Storybook for React + Vite, `@axe-core/playwright`. Pin current stables.
- FILES_CREATED: `apps/web/.storybook/main.ts`, `apps/web/.storybook/preview.ts`, `apps/web/src/foundation/FoundationStatus.tsx`, `apps/web/src/foundation/FoundationStatus.stories.tsx`, `tests/e2e/foundation-a11y.spec.ts`.
- FILES_MODIFIED: web package scripts `storybook` and `build-storybook`.
- COMMANDS: `npm run build-storybook --workspace @vellum/web`. Playwright serves `storybook-static` and runs axe.
- TEST_FIRST: the Playwright spec expects zero serious or critical axe violations on the foundation story. It fails before the story exists.
- EXPECTED_RED_STATE: storybook script missing or axe finds a violation.
- IMPLEMENTATION_STEPS: tokens are CSS variables for `--status-ok`, `--status-attention`, `--status-blocked`, and `--focus-ring`. The story renders three text labels and a button that can receive focus. Do not invent a component library.
- EXPECTED_GREEN_STATE: Storybook build exits 0. Axe reports zero serious or critical violations.
- REFACTOR_CHECK: one story only.
- SECURITY_GATE: story has no tenant data.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: this is the gate.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: axe, not branch coverage.
- LICENSE_CHECK: Storybook and axe-core licenses are allowed (MIT).
- VERIFICATION_COMMANDS: build-storybook and the Playwright axe spec.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `test(a11y): add Storybook foundation story and axe smoke`
- DEFINITION_OF_DONE: static Storybook builds and axe smoke passes.
- BLOCKS: P0-W23.
- BLOCKED_BY: P0-W14.

### P0-W16 — Container foundation

- PURPOSE: One non-root API image that serves `/health`.
- PRECONDITIONS: P0-W13.
- DEPENDENCIES: Docker. The image base is `node:24-bookworm-slim`. If that tag is not published, stop. Do not switch to Current.
- FILES_CREATED: `infra/docker/api.Dockerfile`, `infra/docker/api.dockerignore`.
- FILES_MODIFIED: none.
- COMMANDS: `docker build -f infra/docker/api.Dockerfile -t vellum-api:phase0 .`
- TEST_FIRST: a container test is the build plus `docker run` and a curl of `/health`. There is no unit test for a Dockerfile.
- EXPECTED_RED_STATE: Dockerfile missing, build fails.
- IMPLEMENTATION_STEPS: multi-stage build. Production stage user `node`. `NODE_ENV=production`. No secret build args. `.dockerignore` excludes `.env` and `node_modules`.
- EXPECTED_GREEN_STATE: container starts and `/health` returns 200.
- REFACTOR_CHECK: image does not copy the git directory.
- SECURITY_GATE: non-root user. Trivy runs in P0-W18.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: container logs are the JSON logger from P0-W12.
- COVERAGE_GATE: N/A.
- LICENSE_CHECK: base image is Docker Official Node, license of Node is the MIT license of the runtime.
- VERIFICATION_COMMANDS: build and curl `/health`.
- ROLLBACK: revert this commit and delete the local image tag.
- COMMIT_MESSAGE: `chore(docker): add non-root API image`
- DEFINITION_OF_DONE: image builds and health responds.
- BLOCKS: P0-W18 Trivy job.
- BLOCKED_BY: P0-W13.

### P0-W17 — GitHub Actions quality pipeline

- PURPOSE: CI runs the same checks a reviewer will trust.
- PRECONDITIONS: P0-W04 and the scripts from prior workstreams.
- DEPENDENCIES: `actions/checkout`, `actions/setup-node` with `node-version-file: .nvmrc` and npm cache.
- FILES_CREATED: `.github/workflows/quality.yml`.
- FILES_MODIFIED: none.
- COMMANDS: the workflow itself.
- TEST_FIRST: no unit test. A local `act` run is optional and not required. The definition of done is a workflow file whose job list matches the verification matrix, plus a YAML schema check if `actionlint` is available. If `actionlint` is not installed, review the file by reading it. Do not add a new linter package only for one file.
- EXPECTED_RED_STATE: no workflow, so CI cannot pass.
- IMPLEMENTATION_STEPS: jobs `quality` run `npm ci`, `npm run lockfiles:check`, `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build`. One job, fail-fast. No continue-on-error.
- EXPECTED_GREEN_STATE: workflow file exists and names those commands.
- REFACTOR_CHECK: no secret echoed in a run step.
- SECURITY_GATE: `permissions: contents: read`.
- TENANT_ISOLATION_IMPACT: the RLS job is added in P0-W20 to this workflow or a sibling file.
- ACCESSIBILITY_GATE: e2e job added when P0-W15 exists, same workflow, needs Playwright browsers.
- PERFORMANCE_GATE: unit-plus-coverage job target under 10 minutes including install.
- OBSERVABILITY_GATE: upload coverage artifact.
- COVERAGE_GATE: `test:coverage` failure fails the job.
- LICENSE_CHECK: job step added in P0-W21.
- VERIFICATION_COMMANDS: read the workflow and run the same commands locally.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `chore(ci): add quality workflow`
- DEFINITION_OF_DONE: the commands above are required steps.
- BLOCKS: P0-W23.
- BLOCKED_BY: P0-W04. Following workstreams add their own required steps in their own commits.

### P0-W18 — Security and supply-chain pipeline

- PURPOSE: Secret scan, dependency review, CodeQL, image scan, SBOM artifact.
- PRECONDITIONS: P0-W16 for Trivy. The other steps can land with P0-W17.
- DEPENDENCIES: `gitleaks/gitleaks-action`, `github/codeql-action`, `aquasecurity/trivy-action`, `actions/dependency-review-action`. No Semgrep.
- FILES_CREATED: `.github/workflows/security.yml`, `.github/workflows/codeql.yml`, `.github/dependabot.yml`.
- FILES_MODIFIED: none.
- COMMANDS: workflow names only, plus local `npm audit --audit-level=high` and `npm sbom --sbom-format cyclonedx`.
- TEST_FIRST: a fixture test is not committed with a real secret. Instead, `scripts/secret-pattern.test.mjs` scans `apps/web` and `apps/site` source for the string `service_role` and fails if found.
- EXPECTED_RED_STATE: security workflow absent.
- IMPLEMENTATION_STEPS: Gitleaks on push and pull_request. npm audit in the quality workflow. Dependency review on pull_request only. CodeQL on push and pull_request, language `javascript-typescript`. Trivy on the image from P0-W16, exit code 1 on HIGH, CRITICAL. SBOM uploaded as an artifact, command must succeed. Dependabot weekly for npm and github-actions.
- EXPECTED_GREEN_STATE: local audit and the service_role source scan pass. Workflows exist.
- REFACTOR_CHECK: no scanner without a row in the Scanners section.
- SECURITY_GATE: this workstream is the gate.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: N/A.
- LICENSE_CHECK: coordinated with P0-W21.
- VERIFICATION_COMMANDS: `npm audit --audit-level=high`, `node --test scripts/secret-pattern.test.mjs`, `npm sbom --sbom-format cyclonedx`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `chore(ci): add secret, dependency, CodeQL, and image scans`
- DEFINITION_OF_DONE: each scanner in the Scanners section has a workflow step or an explicit exclusion already written there.
- BLOCKS: P0-W23.
- BLOCKED_BY: P0-W16 for Trivy. Other steps blocked by P0-W17.

### P0-W19 — Supabase, Postgres, and PostGIS foundation

- PURPOSE: Migration system, PostGIS, schema boundaries, one tenant probe, explicit grants, and local/CI role bootstrap outside the migration. No full product schema. No hosted project.
- PRECONDITIONS: P0-W05 and P0-W07 for column names. Docker for local Postgres. Re-read current Supabase RLS, grants, and API-key docs before writing SQL, and record the access date in the migration comment. Do not copy a hosted Data API role layout into this local database.
- DEPENDENCIES: Postgres 16 with PostGIS 3. Before writing the workflow, confirm the image tag on Docker Hub. Preferred tag family: `postgis/postgis:16-3.5` if published, otherwise the newest `16-3.4` patch that the executor verified that day. Pin the tag that was verified. Do not use `latest`.
- FILES_CREATED: `supabase/config.toml` with local ports only and no project id, `supabase/migrations/0001_foundation.sql`, `scripts/bootstrap-local-db-role.mjs`, `scripts/bootstrap-local-db-role.test.mjs`, `scripts/apply-migrations.mjs`, `infra/docker-compose.yml`, `tests/integration/postgis.test.ts`. `docs/runbooks/local-postgres.md` is created in P0-W22.
- FILES_MODIFIED: none in the quality workflow. P0-W20 adds the service container.
- COMMANDS: `node scripts/bootstrap-local-db-role.mjs`, then `node scripts/apply-migrations.mjs`. Bootstrap uses `VELLUM_LOCAL_ADMIN_DATABASE_URL` and `VELLUM_LOCAL_DB_PASSWORD`. Migrations use the admin URL. Runtime tests use `DATABASE_URL`.
- TEST_FIRST: `scripts/bootstrap-local-db-role.test.mjs` fails the script if `VELLUM_DEPLOYMENT_TIER` is `staging` or `production`, if the password env is missing, or if it is `replace-me`. A second test reads `supabase/migrations/0001_foundation.sql` and fails if the file matches `CREATE ROLE` or `PASSWORD`, case-insensitive. `tests/integration/postgis.test.ts` expects `postgis_version()` and fails before the extension exists.
- EXPECTED_RED_STATE: script and migration file missing, so those tests fail. PostGIS query fails before the extension exists.
- IMPLEMENTATION_STEPS: bootstrap creates `vellum_app` only, with the attributes in the frozen section, using the env password as a parameter. The migration then creates schemas, tables, helper functions, policies, and grants. The table owner is the admin role used by the migrator. `vellum_app` is not the owner. Compose interpolates `${VELLUM_LOCAL_DB_PASSWORD}` and `${VELLUM_LOCAL_ADMIN_DATABASE_URL}` with no default password.
- EXPECTED_GREEN_STATE: `postgis_version()` returns a value. Schemas `app` and `audit` exist. `public` has no application table. The migration file has no role creation and no password. Bootstrap refuses production tiers.
- REFACTOR_CHECK: no product tables for mission, finding, or asset. No `vellum_anon`. No Supabase `anon` or `authenticated` role.
- SECURITY_GATE: grants are explicit. `REVOKE ALL ON SCHEMA public FROM PUBLIC`. `FORCE ROW LEVEL SECURITY` is on the probe tables. Helper functions are `SECURITY INVOKER`.
- TENANT_ISOLATION_IMPACT: PROOF schema. Behavior is proven in P0-W20.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: migration script prints the applied filename only.
- COVERAGE_GATE: integration, not unit coverage.
- LICENSE_CHECK: PostGIS is GPL-2.0. It runs as an external database extension, not as linked source in the proprietary packages. Record that in the license inventory. Do not copy PostGIS source into the repo.
- VERIFICATION_COMMANDS: bootstrap test, migration-text test, apply migrations, `select postgis_version()`.
- ROLLBACK: revert this commit. Drop the local database volume. Do not keep a password inside the reverted SQL.
- COMMIT_MESSAGE: `feat(db): establish PostGIS schema and tenant probe`
- DEFINITION_OF_DONE: migration applies twice without error. The second run is a no-op because the runner records the filename. Role bootstrap remains a separate command and is idempotent.
- BLOCKS: P0-W20.
- BLOCKED_BY: P0-W05, P0-W07.

SQL the migration must contain. Names are frozen.

```sql
create extension if not exists postgis;
create schema if not exists app;
create schema if not exists audit;
revoke all on schema public from public;

create table app.tenant (
  id uuid primary key
);

create table app.membership (
  user_id uuid not null,
  tenant_id uuid not null references app.tenant (id),
  primary key (user_id, tenant_id)
);

create table app.isolation_probe (
  id uuid primary key,
  tenant_id uuid not null references app.tenant (id),
  label text not null
);

create table app.outbox (
  id uuid primary key,
  tenant_id uuid not null references app.tenant (id),
  idempotency_key text not null,
  envelope jsonb not null,
  unique (tenant_id, idempotency_key)
);

alter table app.isolation_probe enable row level security;
alter table app.isolation_probe force row level security;
alter table app.outbox enable row level security;
alter table app.outbox force row level security;
alter table app.membership enable row level security;
alter table app.membership force row level security;

create function app.current_setting_uuid(setting_name text)
returns uuid
language plpgsql
stable
security invoker
as $$
declare
  raw text;
begin
  raw := nullif(current_setting(setting_name, true), '');
  if raw is null then
    return null;
  end if;
  return raw::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

create function app.current_user_id()
returns uuid
language sql
stable
security invoker
as $$ select app.current_setting_uuid('app.user_id') $$;

create function app.current_tenant_id()
returns uuid
language sql
stable
security invoker
as $$ select app.current_setting_uuid('app.tenant_id') $$;

grant usage on schema app to vellum_app;
grant execute on function app.current_setting_uuid(text) to vellum_app;
grant execute on function app.current_user_id() to vellum_app;
grant execute on function app.current_tenant_id() to vellum_app;
grant select, insert, update on app.isolation_probe to vellum_app;
grant select, insert on app.outbox to vellum_app;
grant select on app.membership to vellum_app;
```

This SQL file does not create roles and does not contain a password. `scripts/bootstrap-local-db-role.mjs` creates `vellum_app` first, outside the migration history. There is no `vellum_anon`.

Policies, also frozen. Probe and outbox rows must match both the transaction tenant and the user's membership. `UPDATE` and `INSERT` use `WITH CHECK` so a row cannot move to, or be created in, another tenant.

```sql
create policy isolation_probe_select on app.isolation_probe
  for select to vellum_app
  using (
    tenant_id = app.current_tenant_id()
    and tenant_id in (
      select m.tenant_id from app.membership m
      where m.user_id = app.current_user_id()
    )
  );

create policy isolation_probe_insert on app.isolation_probe
  for insert to vellum_app
  with check (
    tenant_id = app.current_tenant_id()
    and tenant_id in (
      select m.tenant_id from app.membership m
      where m.user_id = app.current_user_id()
    )
  );

create policy isolation_probe_update on app.isolation_probe
  for update to vellum_app
  using (
    tenant_id = app.current_tenant_id()
    and tenant_id in (
      select m.tenant_id from app.membership m
      where m.user_id = app.current_user_id()
    )
  )
  with check (
    tenant_id = app.current_tenant_id()
    and tenant_id in (
      select m.tenant_id from app.membership m
      where m.user_id = app.current_user_id()
    )
  );

create policy outbox_select on app.outbox
  for select to vellum_app
  using (
    tenant_id = app.current_tenant_id()
    and tenant_id in (
      select m.tenant_id from app.membership m
      where m.user_id = app.current_user_id()
    )
  );

create policy outbox_insert on app.outbox
  for insert to vellum_app
  with check (
    tenant_id = app.current_tenant_id()
    and tenant_id in (
      select m.tenant_id from app.membership m
      where m.user_id = app.current_user_id()
    )
  );

create policy membership_select on app.membership
  for select to vellum_app
  using (user_id = app.current_user_id());
```

Membership select uses only `app.user_id`, so the BFF can read the caller's memberships before it sets `app.tenant_id`. It still returns nothing when the user setting is missing. User A cannot list user B's memberships.

Missing or invalid settings become null. The comparison matches no row. There is no default tenant. Phase 2 does not replace these settings with `auth.uid()` on the BFF connection. `auth.uid()` belongs to a Supabase Data API role, which this database does not create.

### P0-W20 — RLS and tenant isolation proof

- PURPOSE: Automate the isolation matrix, including pooled-connection reuse. If CI cannot run it, Phase 0 is BLOCKED.
- PRECONDITIONS: P0-W10 and P0-W19.
- DEPENDENCIES: `pg` or the `postgres` npm package. Choose `postgres` (postgres.js) if its license is MIT at install time. Otherwise use `pg`, which is MIT. Pool `max` is at least 1 so the leak test can reuse one connection.
- FILES_CREATED: `apps/api/src/db/request-transaction.ts`, `apps/api/src/db/request-transaction.test.ts`, `tests/integration/tenant-isolation.test.ts`.
- FILES_MODIFIED: `.github/workflows/quality.yml` adds job `isolation` with the PostGIS service, `DATABASE_URL` whose user is `vellum_app`, `VELLUM_LOCAL_ADMIN_DATABASE_URL`, `VELLUM_DEPLOYMENT_TIER=ci`, and `VELLUM_LOCAL_DB_PASSWORD` injected as a job environment value. The job runs bootstrap, migrations, and `npm run test:integration`. It is required. It has no `continue-on-error`.
- COMMANDS: `npm run test:integration`.
- TEST_FIRST: the unit test of `request-transaction.ts` expects two `set_config` calls whose third argument is `true`, inside `BEGIN` and before `COMMIT`. It fails while the module is missing. The integration file is written before the database is migrated and fails on connection refused or missing relations. Then bootstrap, migrate, and reach green.
- EXPECTED_RED_STATE: missing transaction module, or database absent.
- IMPLEMENTATION_STEPS: `withRequestTransaction(pool, context, fn)` begins a transaction, calls `set_config('app.user_id', context.userId, true)` and `set_config('app.tenant_id', context.tenantId, true)`, runs `fn`, and commits. On failure it rolls back. It accepts only `DatabaseRequestContext` from `authorizeMembership`. Seed tenants and memberships with the admin URL. Assertions use the `vellum_app` pool.
- EXPECTED_GREEN_STATE: every required matrix row below passes in CI. The deferred evidence row is recorded as deferred in the test output and is not a failure.
- REFACTOR_CHECK: assertion queries do not use the admin URL. The admin URL is seed-only.
- SECURITY_GATE: the test reads `current_user` and `pg_roles.rolbypassrls` for `vellum_app`.
- TENANT_ISOLATION_IMPACT: PROOF.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: test prints tenant ids only.
- COVERAGE_GATE: integration gate, required in CI. The transaction helper's commit, rollback, and `set_config` branches are unit-tested.
- LICENSE_CHECK: driver license MIT.
- VERIFICATION_COMMANDS: `npx vitest run apps/api/src/db/request-transaction.test.ts` and `npm run test:integration`, plus CI job `isolation`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `test(db): prove tenant isolation and pooled context reset`
- DEFINITION_OF_DONE: CI job `isolation` is required and the required matrix rows pass. A skipped pool test is not PASS.
- BLOCKS: P0-W23, and any PASS claim.
- BLOCKED_BY: P0-W10, P0-W19.

Required matrix. Names are frozen.

- `A_READ_A`: user A and tenant A read the probe row of tenant A.
- `A_READ_B`: user A and tenant A read zero probe rows of tenant B.
- `B_READ_B`: user B and tenant B read the probe row of tenant B.
- `B_READ_A`: user B and tenant B read zero probe rows of tenant A.
- `NO_CONTEXT_READ`: a transaction with no `set_config` reads zero probe rows.
- `FORGED_TENANT_CONTEXT`: `app.user_id` is user A and `app.tenant_id` is tenant B. The probe row of tenant B is invisible. `authorizeMembership` also rejects that pair before a context exists.
- `UPDATE_A_TO_B`: user A updates a tenant A row to tenant B. Zero rows change, or the statement errors. An admin re-read still shows tenant A.
- `INSERT_A_AS_B`: user A, with tenant context A, inserts a probe row whose `tenant_id` is B. The insert is rejected. An admin re-read does not show that row.
- `POOL_CONTEXT_LEAK`: one connection from the pool runs tenant A and commits; the next transaction on that same connection, without `set_config`, sees zero probe rows; the next transaction for tenant B sees only B. A rolled-back transaction that set tenant A also leaves the following no-context statement empty.
- `BYPASSRLS_NORMAL_APP_ROLE`: `pg_roles.rolbypassrls` and `rolsuper` are false for `vellum_app`, and `current_user` during assertions is `vellum_app`.
- `ORIGINAL_EVIDENCE_CROSS_TENANT_ACCESS`: DEFERRED. No evidence table exists in Phase 0. The test file contains this name and an explicit deferred assertion that does not query an evidence table. The in-memory evidence package still covers the cross-tenant derived-link reject.

Outbox: user A cannot select user B's outbox row. The same idempotency key may exist on both tenants. That check sits inside `A_READ_B` coverage for the outbox policy.

Seed ids are fixed UUIDs in the test file so failures are readable:

- Tenant A: `11111111-1111-4111-8111-111111111111`
- Tenant B: `22222222-2222-4222-8222-222222222222`
- User A: `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`
- User B: `bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb`

### P0-W21 — OSS and license guardrails

- PURPOSE: Fail the build on a copyleft license in the dependency tree unless an exception file names it.
- PRECONDITIONS: lockfile from P0-W02 and the dependencies added by the workstreams that precede the license commit. Re-run the check in the same commit that adds a dependency if the new package would fail the gate.
- DEPENDENCIES: a license reader. Prefer `license-checker-rseidelsohn` if its own license is MIT. If the executor cannot confirm that, use Node to read each package's `license` field from `node_modules` without a new dependency. The no-dependency reader is the default. Do not add a license tool whose own license is ambiguous.
- FILES_CREATED: `scripts/check-licenses.mjs`, `docs/oss/PHASE0_LICENSE_INVENTORY.md`, `docs/oss/PHASE0_LICENSE_EXCEPTIONS.md`.
- FILES_MODIFIED: quality workflow step `npm run licenses:check`.
- COMMANDS: `npm run licenses:check`.
- TEST_FIRST: a fixture package.json with `license: AGPL-3.0` in a temp directory fails the checker.
- EXPECTED_RED_STATE: checker missing.
- IMPLEMENTATION_STEPS: deny list prefixes `AGPL`, `GPL`, `LGPL`. Exception file starts with a heading and the sentence `No exceptions are approved.` PostGIS is documented as an external service in the inventory, not as an npm exception.
- EXPECTED_GREEN_STATE: the repo tree passes and the AGPL fixture fails.
- REFACTOR_CHECK: ODM, NodeODM, QField, and GeoNode are absent from package.json files.
- SECURITY_GATE: N/A beyond copyleft isolation.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: N/A.
- LICENSE_CHECK: this is the gate.
- VERIFICATION_COMMANDS: `npm run licenses:check` and `node --test scripts/check-licenses.test.mjs`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `chore(oss): fail the build on unapproved copyleft licenses`
- DEFINITION_OF_DONE: deny list active, exception list empty of approvals, inventory generated from the lockfile.
- BLOCKS: P0-W23.
- BLOCKED_BY: P0-W02, and it is re-run after every dependency-adding workstream.

### P0-W22 — Runbooks

- PURPOSE: An engineer can boot, test, and reset the foundation without asking the author.
- PRECONDITIONS: the commands exist.
- DEPENDENCIES: none.
- FILES_CREATED: `docs/runbooks/phase-0-local.md`, `docs/runbooks/phase-0-ci.md`, `docs/runbooks/phase-0-postgres.md`.
- FILES_MODIFIED: root README links to those files.
- COMMANDS: none beyond a link check by reading them.
- TEST_FIRST: no. Documentation. A reviewer executes the local runbook in P0-W23.
- EXPECTED_RED_STATE: not applicable.
- IMPLEMENTATION_STEPS: local runbook lists Node 24, `npm ci`, lint, typecheck, unit, coverage, integration, e2e, builds. Postgres runbook lists the Docker image tag that was actually pinned, the migration command, and the reset command `docker compose down -v` if compose is used. CI runbook names the required jobs. Include `infra/docker-compose.yml` in P0-W19 if the runbook needs it: one service `postgres` with the pinned PostGIS image and a named volume. That compose file is part of P0-W19, and this runbook documents it.
- EXPECTED_GREEN_STATE: a second engineer can follow the local runbook.
- REFACTOR_CHECK: runbooks do not tell the reader to create a Supabase project.
- SECURITY_GATE: runbooks say `.env` stays untracked, the local database password comes from the environment, and the versioned migration has no password and no `CREATE ROLE`.
- TENANT_ISOLATION_IMPACT: describes the proof without weakening it.
- ACCESSIBILITY_GATE: N/A.
- PERFORMANCE_GATE: N/A.
- OBSERVABILITY_GATE: N/A.
- COVERAGE_GATE: N/A.
- LICENSE_CHECK: N/A.
- VERIFICATION_COMMANDS: reviewer follows `docs/runbooks/phase-0-local.md`.
- ROLLBACK: revert this commit.
- COMMIT_MESSAGE: `docs: add Phase 0 runbooks`
- DEFINITION_OF_DONE: three runbooks exist and match the pinned commands.
- BLOCKS: P0-W23.
- BLOCKED_BY: P0-W16, P0-W19, P0-W20.

### P0-W23 — Full Phase 0 verification

- PURPOSE: One recorded matrix. No invented PASS.
- PRECONDITIONS: W01 through W22 committed.
- DEPENDENCIES: clean git worktree.
- FILES_CREATED: `docs/runbooks/phase-0-verification-record.md` written only after the commands run, with the command, the exit code, and the date. The executor fills it from real output.
- FILES_MODIFIED: none other than that record.
- COMMANDS: the matrix below, in order.
- TEST_FIRST: not applicable. This workstream is the test run.
- EXPECTED_RED_STATE: any non-zero exit. Fix in the owning workstream. Do not mark PASS.
- IMPLEMENTATION_STEPS: from a clean checkout run the matrix. Paste exit codes into the record.
- EXPECTED_GREEN_STATE: every required row exits 0.
- REFACTOR_CHECK: the record does not say PASS if a row was skipped.
- SECURITY_GATE: secret scan and audit rows included.
- TENANT_ISOLATION_IMPACT: isolation row required.
- ACCESSIBILITY_GATE: axe row required.
- PERFORMANCE_GATE: record the unit job duration. A duration over 10 minutes does not fail Phase 0. It is written in the record for Phase 1.
- OBSERVABILITY_GATE: health row asserts the correlation header.
- COVERAGE_GATE: coverage row exits 0, which means the thresholds passed.
- LICENSE_CHECK: license row exits 0.
- VERIFICATION_COMMANDS: the matrix.
- ROLLBACK: do not tag. Fix forward with a new commit.
- COMMIT_MESSAGE: `docs: record Phase 0 verification results`
- DEFINITION_OF_DONE: the record exists and every required exit code is 0. PHASE_0_STATUS = PASS only then. If the isolation job cannot run, or the pool-leak row is skipped, PHASE_0_STATUS = BLOCKED.
- BLOCKS: P0-W24.
- BLOCKED_BY: P0-W01 through P0-W22.

Verification matrix, required:

1. Clean checkout of the branch.
2. `npm ci`
3. `npm run lockfiles:check`
4. `npm run lint`
5. `npm run typecheck`
6. `npm run test:coverage`
7. `npm run test:integration`
8. `npm run test:e2e`
9. `npm run build`
10. `npm run build-storybook --workspace @vellum/web`
11. Axe Playwright spec
12. `node --test scripts/secret-pattern.test.mjs`
13. `npm audit --audit-level=high`
14. `docker build -f infra/docker/api.Dockerfile -t vellum-api:phase0 .`
15. `npm run licenses:check`
16. `npm sbom --sbom-format cyclonedx`

Gitleaks, CodeQL, dependency review, and Trivy are CI jobs. The local record notes their workflow names. A local PASS without those CI jobs is not a Phase 0 PASS. PHASE_0_STATUS = PASS only when the local matrix and the required CI jobs have completed with success on this branch.

### P0-W24 — Phase 0 commit and versioning

- PURPOSE: Tag only after PASS.
- PRECONDITIONS: P0-W23 record shows all required results succeeded.
- DEPENDENCIES: git identity already configured by a human. This plan does not set git config.
- FILES_CREATED: annotated tag `v3-phase-0-complete`.
- FILES_MODIFIED: verification record gains `PHASE_0_STATUS = PASS` and `NEW_GREENFIELD_PHASE0 = YES`.
- COMMANDS: `git tag -a v3-phase-0-complete -m "VELLUM Phase 0 foundation complete"`.
- TEST_FIRST: not applicable.
- EXPECTED_RED_STATE: if any gate failed, do not tag.
- IMPLEMENTATION_STEPS: the tag points at the verification commit. The message states this history is the greenfield Phase 0 and is not the old AI Studio SHA.
- EXPECTED_GREEN_STATE: `git show v3-phase-0-complete` shows the verification commit.
- REFACTOR_CHECK: no force-push, no tag move.
- SECURITY_GATE: tag is local until a human asks to push.
- TENANT_ISOLATION_IMPACT: NONE.
- ACCESSIBILITY_GATE: already passed.
- PERFORMANCE_GATE: already recorded.
- OBSERVABILITY_GATE: already passed.
- COVERAGE_GATE: already passed.
- LICENSE_CHECK: already passed.
- VERIFICATION_COMMANDS: `git status`, `git log --oneline -5`, `git show v3-phase-0-complete --stat`.
- ROLLBACK: `git tag -d v3-phase-0-complete` only if the tag was not pushed and a human asks for the deletion.
- COMMIT_MESSAGE: the verification record commit is P0-W23. This workstream is the tag, not an extra empty commit.
- DEFINITION_OF_DONE: tag exists on the PASS commit. Push remains a separate human request.
- BLOCKS: Phase 1.
- BLOCKED_BY: P0-W23.

## Execution batches

Each batch is implemented, tested, reviewed, and committed before the next batch starts. Do not combine batches into one change.

- B01 — P0-W01 then P0-W02. Sequential.
- B02 — P0-W03 then P0-W04. Sequential.
- B03 — P0-W05 then P0-W06. Sequential.
- B04 — P0-W07, P0-W08, P0-W09, P0-W10. Parallel after B03. Four commits.
- B05 — P0-W11 then P0-W12. Sequential. Can run beside B04 after B02, because it does not need domain types except the correlation id which is a string. Start B05 after B02.
- B06 — P0-W13. After B03, B05.
- B07 — P0-W14 then P0-W15. P0-W14 can start after B02 and P0-W11, in parallel with B04 and B06.
- B08 — P0-W16 after B06. P0-W17 can start after B02 and grows as scripts appear. P0-W18 after B08 docker and B07 only for the e2e job. P0-W21 starts after B01 and is re-run whenever dependencies change.
- B09 — P0-W19 then P0-W20. The SQL in P0-W19 can be drafted beside B06 and B07 after B03. P0-W20 waits for P0-W10 as well as P0-W19. The CI job lands in B09.
- B10 — P0-W22 after B08 and B09.
- B11 — P0-W23 then P0-W24. Sequential and last.

Parallel without file conflicts: B04's four packages; B07 with B04; B09 SQL with B06 until both edit `.github/workflows/quality.yml`. The batch that touches that file second rebases onto the first. Only one batch owns the workflow file at a time. Frozen ownership: P0-W17 creates it, P0-W18 adds security workflows as separate files, P0-W20 is the only following editor of `quality.yml`, and that same commit adds the P0-W21 license step. If the license script is not ready in that commit, B09 adds a dedicated commit `chore(ci): add license check step`.

## Phase 0 non-goals, restated

No authentication UI, no production auth flow, no project or asset CRUD, no map, no mission UI, no live telemetry, no DJI integration, no finding or action product flow, no Copilot, no model call, no Cesium, no Potree, no photogrammetry, no customer portal, no indexable marketing site, no production infrastructure, no hosted Supabase project, no ICA article engine.

## Self-review

This plan does not leave an open product decision. Node 24 is the Active LTS on the date of this plan, with an explicit re-read rule. Scanner exclusions are justified. Deferred directories are named so they are not created empty. The BFF connects as `vellum_app`. Roles and passwords stay out of versioned migrations. RLS context is transaction-local and fails closed. The isolation matrix, including the pool-leak row, is required for PASS. The evidence SQL row is explicitly deferred. Data governance is an architecture gate, not a legal opinion.

PHASE_0_TEST_STRATEGY_STATUS = SPECIFIED
PHASE_0_TDD_STATUS = REQUIRED_FOR_BEHAVIOR
PHASE_0_RLS_PROOF_PLANNED = YES
PHASE_0_COVERAGE_GATE = 95_LINES_95_BRANCHES_95_FUNCTIONS_ON_DOMAIN_CONTRACTS_AUTH_GIS_EVIDENCE_CONFIG
PHASE_0_SECURITY_GATE = SPECIFIED
PHASE_0_IMPLEMENTATION_AUTHORIZED = NO
