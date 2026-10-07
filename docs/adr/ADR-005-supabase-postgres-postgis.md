# ADR-005 — Supabase, Postgres, and PostGIS

- Status: accepted
- Date: 2026-10-07

## Context

VELLUM needs relational integrity, spatial queries, auth, object storage, and row-level defense in depth. HD-2 prefers Brazil residency. No productive instance is created in the documentation batch.

## Decision

Supabase is the managed Postgres, PostGIS, Auth, Storage, and Realtime platform. A future productive project uses the specific region `sa-east-1` (São Paulo) if that region is still offered and the then-current backup, PITR, and contract terms are acceptable. General region groups are not used, because they do not guarantee a jurisdiction.

Schemas separate `app`, `audit`, `evidence`, `processing`, and `ai`. Auto-expose of new tables stays off. Grants are explicit and minimal. Audit tables are append-only for clients.

PITR for `sa-east-1` is NEEDS_VERIFICATION at project creation. This ADR does not claim a numeric RPO or RTO.

Storage origin follows the project region. The vendor states that the storage CDN cache is global. Restricted and evidence objects are private and are not designed to be served as public CDN content. Confirm private-object caching behavior before production.

## Alternatives

- Self-hosted Postgres only. Rejected for V3 operations load; still the portability target because the schema is Postgres.
- A general "Americas" region. Rejected: residency would be undefined.

## Consequences

Auth and storage APIs are the main lock-in. SQL and PostGIS remain portable. Local and CI databases can exist before any cloud project.

Local and CI Postgres prove the BFF connection in ADR-006. That connection uses `vellum_app` and transaction-local settings. It does not reproduce Supabase Auth, PostgREST, or the Data API roles `anon`, `authenticated`, and `service_role`. Those roles are a different model and stay unused while the browser Data API is deny-by-default. Before any hosted project, re-read the current Supabase docs for RLS, grants, and keys. Do not treat a vanilla role script as if it were the hosted Data API.

## Security impact

See ADR-006. Secret keys never ship to the browser.

## Operational impact

Backup and restore tests are a later gate. Region choice is re-read from current docs immediately before project creation.

## Revisit trigger

`sa-east-1` unavailable, PITR absent on the required plan, or private evidence shown to enter the global CDN.

## Sources

SRC-SUPABASE-RLS, SRC-SUPABASE-KEYS, SRC-SUPABASE-GRANTS, SRC-SUPABASE-REGIONS.
