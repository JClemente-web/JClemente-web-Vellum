# VELLUM V3 Risk Register

Date: 2026-10-07. Scores are priority classes, not fabricated probabilities.

## P0

- Tenant leak. Owner: platform. Mitigation: ADR-006, RLS, isolation tests. Trigger: first business table. Fallback: disable Data API and serve only through the BFF.
- Wrong CRS or datum. Owner: GIS. Mitigation: ADR-009, verified EPSG list, reject metric ops on geographic CRS. Trigger: first measurement. Fallback: disable measurement.
- Regulatory fact treated as code without a source. Owner: domain. Mitigation: source registry; SORA_STATUS = NOT_CONFIRMED; ICA articles not encoded. Trigger: any compliance checker. Fallback: checker stays documentary until the source is ingested.
- Secret in the client. Owner: API. Mitigation: env split and future secret scan. Trigger: first integrate. Fallback: rotate and stop the deploy.
- Evidence overwrite sold as WORM. Owner: evidence. Mitigation: ADR-010. Trigger: any customer claim. Fallback: say logical immutability only.

## P1

- AGPL in the core. Owner: architecture. Mitigation: ADR-011. Trigger: Phase 9. Fallback: external adapter only.
- AI closes a finding or commands flight. Owner: Copilot. Mitigation: ADR-012. Trigger: Phase 8. Fallback: disable write tools.
- Global CDN and a Brazil-residency claim. Owner: data governance. Mitigation: private evidence, re-verify PITR and CDN before project creation. Trigger: Supabase project. Fallback: do not create the project.
- ICA article invented from the publication blurb. Owner: compliance. Mitigation: metadata only until the PDF is read. Trigger: mission-rule engine. Fallback: human-entered authorization records.
- Offline client pretends to be synced. Owner: field. Mitigation: explicit sync states and idempotency. Trigger: field phase. Fallback: online-only.
- Backup without a restore test. Owner: operations. Mitigation: Phase 11 restore evidence. Trigger: first customer data. Fallback: do not declare production readiness.
- QGroundControl or MAVLink generator copied in. Owner: telemetry. Mitigation: ADR-011. Trigger: Phase 5. Fallback: protocol notes only.

## P2

- GPU, map, or model cost. Owner: FinOps. Mitigation: counters, then quotas. Trigger: Phase 9. Fallback: pause the queue.
- Public and private hosts sharing an index. Owner: site. Mitigation: ADR-003. Trigger: Phase 10. Fallback: authentication in front of the wrong host.
- Single-pilot multi-aircraft UI that ignores RBAC 100.23(b). Owner: missions. Mitigation: data model allows many vehicles; simultaneous control requires an authorization record. Trigger: Phase 5. Fallback: one active controlled vehicle per pilot session.

## P3

- Coverage theater. Owner: quality. Mitigation: testing rule; no invented percentages. Trigger: Phase 0. Fallback: report NOT APPLICABLE.
- Kepler or ArcGIS capability claims used as requirements. Owner: product. Mitigation: matrix labels NEEDS_VERIFICATION. Trigger: scope change. Fallback: ignore those claims.
