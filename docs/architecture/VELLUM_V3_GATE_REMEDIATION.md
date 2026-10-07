# VELLUM V3 Gate Remediation

Date: 2026-10-07. Red team assumed the first draft of the spec was wrong and checked the documents written in this batch.

## RT-001

- Severity: HIGH
- Finding: Supabase documents a global storage CDN even when the origin region is São Paulo. A residency claim that ignores the CDN is unsafe.
- Root cause: region and cache are different controls.
- Affected docs: ADR-005, data governance, security model, risk register.
- Decision: primary data prefers `sa-east-1`; restricted evidence is private and is not designed as public CDN content.
- Remediation: written into those docs. PITR and private-object cache behavior stay NEEDS_VERIFICATION until project creation.
- Residual risk: the project might still replicate or cache in a way the current page does not detail.
- Status: closed for architecture. Re-open before creating the project.

## RT-002

- Severity: MEDIUM
- Finding: ICA 100-40 and ICA 100-48 article text was not ingested. Encoding flight rules from the publication blurb would present a NEEDS_VERIFICATION claim as a fact. The spec does not encode those articles.
- Root cause: the official pages publish metadata and a short portaria description.
- Affected docs: source registry, final spec, risk register.
- Decision: store version, effective date, and human-entered authorization. Do not hardcode ICA articles.
- Remediation: registry notes and spec non-goals.
- Residual risk: a later author treats the DECEA FAQ as the whole ICA.
- Status: closed.

## RT-003

- Severity: HIGH
- Finding: SORA could be mistaken for a legal requirement of RBAC nº 100.
- Root cause: IS E94-004A names SORA, while the RBAC 100 HTML that was read does not.
- Affected docs: source registry, final spec, ADR-012, domain rule text.
- Decision: SORA_STATUS = NOT_CONFIRMED.
- Remediation: acceptable method is versioned data. The IS is cited as a separate instrument.
- Residual risk: the IS may later be reissued under RBAC 100 and should be re-read then.
- Status: closed.

## RT-004

- Severity: MEDIUM
- Finding: MAVLink COPYING is LGPL-3.0 for the generator. An older README describes generated C headers as MIT. Vendoring the repository would drag the generator license in.
- Affected docs: source registry, ADR-011, competitive matrix.
- Decision: do not vendor. Re-read the pinned artifact before any code dependency.
- Remediation: ADR-011.
- Residual risk: a future adapter copies the generator.
- Status: closed for this batch.

## RT-005

- Severity: MEDIUM
- Finding: Potree viewer and PotreeConverter 2.0 are different licenses.
- Affected docs: ADR-011, competitive matrix.
- Decision: converter 2.0 stays out. Viewer only after a pinned notice check.
- Remediation: written.
- Residual risk: a dependency on the converter.
- Status: closed.

## RT-006

- Severity: LOW
- Finding: Kepler.gl MIT was observed on a fork, and ArcGIS product pages were not retrieved.
- Affected docs: competitive matrix, risk register.
- Decision: neither is a dependency or a requirement.
- Remediation: labels NEEDS_VERIFICATION / INFERRED.
- Residual risk: someone treats those notes as a feature commitment.
- Status: closed.

## RT-007

- Severity: HIGH
- Finding: QGroundControl's GPL option and Qt coupling would contaminate a proprietary core if the code were imported.
- Affected docs: ADR-011.
- Decision: reference only.
- Remediation: ADR-011.
- Residual risk: low if the inventory check from Phase 0 is actually added later.
- Status: closed.

## RT-008

- Severity: MEDIUM
- Finding: "Multi-vehicle must be possible" conflicts with RBAC 100.23(b) if read as one pilot controlling many aircraft by default.
- Affected docs: final spec, build plan, risk register, ADR-012.
- Decision: the data model stores many vehicles. Simultaneous control by one pilot requires an authorization record.
- Remediation: spec and build plan wording.
- Residual risk: UI could still offer the illegal default. Phase 5 tests must cover it.
- Status: closed in documentation.

## RT-009

- Severity: MEDIUM
- Finding: Logical immutability could be marketed as WORM.
- Affected docs: ADR-010, security model, data governance, release criteria.
- Decision: V3 claims logical immutability only.
- Remediation: ADR-010.
- Residual risk: a sales surface that ignores the ADR. Phase 10 copy review.
- Status: closed.

## RT-010

- Severity: MEDIUM
- Finding: service_role as a universal data path bypasses RLS.
- Affected docs: ADR-006, security model.
- Decision: deny-by-default Data API; privileged role is exceptional, audited, and tested.
- Remediation: ADR-006.
- Residual risk: the first implementation takes the shortcut. Phase 2 gate.
- Status: closed in documentation.

## RT-011

- Severity: LOW
- Finding: Fastify, Astro, npm workspaces, Turborepo, and Nx were compared from their public sites and not installed. A later release could drift.
- Affected docs: ADR-004, ADR-013, ADR-014.
- Decision: decisions stand until a revisit trigger fires.
- Remediation: revisit triggers are written.
- Residual risk: ecosystem change.
- Status: closed.

## RT-012

- Severity: LOW
- Finding: Open-category numeric limits are easy to treat as eternal. They are text of RBAC 100 Emenda 00.
- Affected docs: source registry, final spec.
- Decision: store them on that regulatory version.
- Remediation: spec says they are not eternal constants.
- Residual risk: a hardcoded check with no version id.
- Status: closed.

## RT-013

- Severity: HIGH
- Finding: `.cursor/rules/*.mdc` files were initially blocked because the editor accepted only Markdown.
- Root cause: file-type restriction, not a design dispute.
- Affected docs: `AGENTS.md`, `.cursor/rules/*.mdc`, `docs/architecture/CURSOR_PROJECT_RULES.md`.
- Decision: the ten rule files are the loaded Cursor context. The narrative index does not override them.
- Remediation: `00-vellum-core.mdc` through `90-git-delivery.mdc` were written beside `AGENTS.md`.
- Residual risk: a rule can drift from an ADR if only one side is edited. ADRs remain the decision record.
- Status: closed.

## Closure audit

Historical totals are not open counts.

- RED_TEAM_TOTAL_BLOCKER = 0
- RED_TEAM_TOTAL_HIGH = 4 (RT-001, RT-003, RT-007, RT-013)
- RED_TEAM_TOTAL_MEDIUM = 6 (RT-002, RT-004, RT-005, RT-008, RT-009, RT-010)
- RED_TEAM_TOTAL_LOW = 3 (RT-006, RT-011, RT-012)
- RED_TEAM_UNRESOLVED_BLOCKER = 0
- RED_TEAM_UNRESOLVED_HIGH = 0
- RED_TEAM_UNRESOLVED_MEDIUM = 0
- RED_TEAM_UNRESOLVED_LOW = 0

Every finding above is REMEDIATED. None is OPEN. Residual checks that wait for a future Supabase project or a Phase 5 adapter do not block Phase 0, and they are not unresolved HIGH findings.

RT-001 blocks Phase 0: NO. RT-003: NO. RT-007: NO. RT-013: NO. Medium and low findings: NO.

## Final architecture gate

Design documents are consistent: spec, build plan, ADRs, security, privacy, SEO, and registry agree on BFF access, REST, logical immutability, Brazil CRS, SORA_STATUS, and no AGPL in the core.

FINAL_ARCHITECTURE_GATE = PASS. ARCHITECTURE_BLOCKERS = 0. RT-013 is closed.

Phase 0 implementation stays forbidden until a separate human authorization.

UNRESOLVED_P0_SECURITY = 0 in the design. The P0 items have documented mitigations and are not implemented systems.

UNVERIFIED_REGULATORY_RULE_USED_AS_FACT = 0. ICA articles are not used as facts. SORA is not used as a requirement.

UNVERIFIED_GEODETIC_CONSTANT_USED_AS_FACT = 0. EPSG:31979 through EPSG:31985 were each checked.

AGPL_CORE_RISK = 0 in the repository. No third-party code was added.

STRIX_TOUCHED = NO.
