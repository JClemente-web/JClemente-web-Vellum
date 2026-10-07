# VELLUM V3 Release Criteria

Date: 2026-10-07. Nothing in this repository is a release.

## Documentation baseline (this batch)

- Canonical spec, build plan, source registry, ADRs 001–014, security model, data governance, SEO strategy, competitive matrix, and risk register exist and do not contradict each other.
- Geodetic constants EPSG:31978–31985 and the SIRGAS/WGS 84 distinction are tied to registry URLs.
- No regulatory sentence is presented as fact unless the registry labels it OFFICIAL_SOURCE.
- Phase 0 is not started.

## Later phase exit

A phase exits only with PASS, evidence, and no open blocker. Allowed statuses: PASS, FAIL, BLOCKED. A green build alone is not a phase exit. A missing tool is NOT APPLICABLE, not a fake percentage.

## Production readiness (Phase 12, not now)

Requires CI green, security gates green, staging validation, logs and alerts, backup, a performed restore, written RPO and RTO taken from the contracted platform rather than guessed here, runbooks, rollback, a FinOps view, and a production smoke test. PRODUCTION_READINESS stays unset until that evidence exists.

## Release blockers already decided

- High or critical vulnerability left unmitigated.
- Cross-tenant test failing.
- AGPL/GPL code in the proprietary core without legal approval.
- Metric calculation on a geographic CRS.
- AI tool that can command flight.
- Indexable cockpit or an indexable public page before HD-4.
- A WORM or Object Lock claim without a demonstrated storage control.
