# VELLUM V3 Final Spec

Status: canonical architecture baseline. Phase 0 is not started.
Date: 2026-10-07.
Decisions: HD-1 BRAZIL_FIRST. HD-2 DATA_RESIDENCY_BRAZIL_PREFERRED. HD-3 NO_AGPL_IN_PROPRIETARY_CORE. HD-4 public legal name and host deferred to Phase 10.

## Vision

VELLUM is Operational Intelligence + Evidence OS for physical environments: assets, sites, inspections, aircraft, GIS, and corrective cycles. It is not only a drone app, a GIS, a CMMS, a photogrammetry engine, or a chatbot.

The loop is CAPTURE → PROCESSING → INTELLIGENCE → FINDING → HUMAN REVIEW → DECISION → ACTION → REINSPECTION → VERIFICATION → RESULT.

Success for V3: one tenant can register an asset, mission, and capture; produce a finding with a custody chain; require an action; reinspect; verify; and answer how that asset stood at a past instant, without cross-tenant access.

## Scope

Brazil-first operations. Models for CRS, regulation, and adapters stay internationally extensible. Personas: Platform Admin, Tenant Owner, Tenant Admin, Operations Manager, Project Manager, Pilot, Field Operator, Technical Reviewer, Analyst, Maintenance Technician, Client Viewer, Auditor, External Partner. Access is least privilege. Client Viewer sees published objects only.

MUST ship: tenancy and tested isolation; operational tree; mission and canonical telemetry; VCP; resumable upload; SHA-256; logically immutable originals; finding lifecycle; action, reinspection, verification; append-only audit; idempotent events; MapLibre + deck.gl; CRS pipeline; versioned regulatory records; governed Copilot; health and CI secret scanning.

SHOULD ship: mission playback, temporal compare, command palette, report approval and PDF, client portal, offline Field Companion, thumbnail and transcode jobs, a minimal public site after HD-4.

V3.1: Cesium, Potree, external photogrammetry adapter, thermal analysis, BIM/CAD overlay, SARPAS/SISANT if a real interface exists, tenant FinOps quotas.

FUTURE: dock autonomy, BVLOS automation, multi-region residency, programmatic SEO.

## System shape

See ADR-002, ADR-003, ADR-006, ADR-007, ADR-013, ADR-014.

Browser authenticates with Supabase Auth and receives a JWT. Business commands go to the BFF (`/api/v1`, REST + OpenAPI). The BFF validates the JWT, builds TenantContext, authorizes the use case, assigns a correlation id, and audits material actions. Domain rules do not live in React or in SQL policies alone.

RLS is defense in depth. Browser Data API is deny-by-default. Realtime from the client is allowed only with RLS, channel authorization, and a cross-tenant test. `service_role` is server-only and justified per module.

Planes: control, data, processing, AI. One modular codebase. Processing does not run inside the user HTTP request. The AI plane cannot command flight.

## Domain

Tenant isolates data. Organization and business unit are administrative scope inside the tenant. Project → Site → Zone → Asset → Subasset. Each node can carry geometry, metadata, documents, and versions.

Mission references project, assets, vehicle, sensor, operator, and the regulatory version effective on the mission date. Capture and VCP belong to the mission. OriginalFile is logically immutable. DerivedAsset points at the original and the job.

Finding references captures. Review, Action, ExecutionEvidence, Reinspection, and Verification are separate records. Closure follows verification, or rejection. Executed is not resolved. Draft report is not an approved report.

Time travel reads versions and events with event time at or before T. It is not a restored backup in the UI.

Multi-vehicle is a data-model capability: many vehicle tracks may exist. RBAC 100.23(b) says one remote pilot operates one UA at a time unless ANAC authorizes otherwise (SRC-ANAC-RBAC100-HTML). The product must not present simultaneous single-pilot multi-aircraft control as the default legal mode. That authorization, when it exists, is a versioned record.

## Evidence

Logical immutability (ADR-010): permanent object id, SHA-256, no content overwrite, no content UPDATE, derivatives are new objects, delete is blocked by retention or legal hold, access/export/delete are audited, periodic hash check when applicable.

This is not a promise of WORM, Object Lock, or retention lock. Those are a future storage capability that must be proven on the chosen infrastructure before any customer claim.

Custody graph: Finding → Capture → Original File → Hash → Sensor → Vehicle → Mission → Operator → Processing Job → Model/Rule version → Reviewer → Decision → Action → Execution Evidence → Reinspection → Verification → Result.

## GIS and geodesy

Primary engines: MapLibre GL JS and deck.gl. CesiumJS (Apache-2.0, lazy) and Potree viewer (BSD-2-Clause on the retrieved LICENSE, lazy) wait until Phase 9 and a pinned-version notice check. PotreeConverter 2.0 is out.

CRS roles: source, canonical, project, display. Persist pipeline, version, epoch, and accuracies. Brazil canonical geographic storage is SIRGAS 2000 (EPSG:4674 or EPSG:4989). Metric work uses a verified projected CRS, EPSG:31978–31985 as applicable, via PostGIS/PROJ. EPSG:4979 is WGS 84 geographic 3D.

Vertical: store ellipsoidal height and, separately, normal height with model, version, and uncertainty. Current conversion baseline is hgeoHNOR2020 toward REALT-2018. MAPGEO2015 is legacy.

Composite layers show source, time, and data age. They do not pretend staggered sources are one simultaneous reality.

## Regulation

Authorities: ANAC (RBAC nº 100, effective baseline), DECEA (ICA 100-40 and ICA 100-48, effective 2026-07-01, article text not yet ingested), ANATEL (radio homologation, not flight rules).

Entities: RegulatoryAuthority, Framework, Rule, Version, OperationalCategory, Scenario, Authorization, Requirement, PilotRequirement, AircraftRequirement, RiskAssessment, ComplianceCheck, ComplianceEvidence, TransitionRule, EffectiveDate, ExpirationDate, SupersededBy.

VELLUM stores, alerts, and preserves. It does not issue the legal decision. Human review remains on critical compliance calls. Historical missions bind the version effective on that date. Transition facts from Resolução nº 805, including the temporary waiver of 100.13(b) through 2026-12-31, are dated records, not permanent code.

SORA_STATUS = NOT_CONFIRMED. See SOURCE_REGISTRY.

Open-category numbers that are in the retrieved RBAC text may be stored as data for the RBAC 100 version: ≤ 25 kg, VLOS or EVLOS, ≤ 120 m AGL, risk-assessment rules in 100.5(a)(1). They are not eternal constants.

## AI

Copilot → policy → tool authorization → domain service → audit. Classes: READ_ONLY, DRAFT, HUMAN_CONFIRMATION_REQUIRED, PROHIBITED_TO_AI. No raw SQL tool. Flight commands are prohibited. Provenance and evals are required before a model change is production.

## Public and private

`apps/site` is the only SEO surface, and it stays non-indexable until legal name and canonical host exist. Cockpit, field, and portal: authentication, `noindex`, excluded from any sitemap. robots.txt is not security.

## Privacy

Classification and rights processes are specified in `docs/security/VELLUM_V3_DATA_GOVERNANCE.md`. The platform does not replace specialized privacy review.

## Non-goals for this baseline

No Phase 0 scaffold. No productive Supabase project. No AGPL engine in the repo. No indexable marketing site. No claim of legal WORM. No hardcoded ICA articles.
