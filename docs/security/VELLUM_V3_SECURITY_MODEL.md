# VELLUM V3 Security Model

Date: 2026-10-07. This is an architecture model, not a penetration test.

## Trust boundaries

- Browser: publishable key and user JWT only.
- BFF: JWT validation, membership authorization, transaction-local tenant context, correlation id, audit. The normal database login is `vellum_app` (`NOBYPASSRLS`). It is not `postgres`, `service_role`, or a superuser.
- Postgres: explicit grants plus RLS as defense in depth. Missing `app.user_id` or `app.tenant_id` denies rows. Settings are transaction-local so a pooled connection does not keep the previous tenant.
- Privileged worker: secret key, named jobs only, own audit trail.
- Public site: no server secrets.
- AI tools: closed set, no flight control, no raw SQL.

Direct browser Data API access is deny-by-default (ADR-006).

## Assets

Tenant data, original evidence, derived products, audit log, regulatory records, AI prompts and outputs, signed URLs, realtime channels, secrets.

## Threats

### P0

- Tenant escape via query, grant, RLS gap, Realtime, storage, signed URL, export, cache, offline store, or Copilot retrieval. Mitigation: BFF authz, RLS predicates, deny-by-default Data API, cross-tenant tests before any business table is exposed. Detection: `security.denied` events and CI isolation tests. Residual: a new table without the test.
- IDOR on object ids. Mitigation: a valid JWT is authentication only. The BFF authorizes membership, then opens a transaction. A tenant id in the body, header, query, or route is not accepted as truth. Residual: a handler that builds database context without that authorization step.
- Secret in the frontend. Mitigation: env classes PUBLIC, SERVER, SECRET; secret scan when CI exists. Residual: a future log line.
- Original evidence replaced by a derivative. Mitigation: logical immutability (ADR-010). This does not claim storage WORM.
- AI flight command or unrestricted SQL. Mitigation: ADR-012.

### P1

- Long-lived signed URL. Mitigation: short TTL, method and prefix bound to the tenant.
- SSRF from a layer URL or processing fetch. Mitigation: allowlist. No free URL tool for the model in V3.
- Prompt injection and poisoned documents. Mitigation: tools cannot approve, delete, or fly; drafts are labeled; evidence ids are attached.
- Cross-tenant retrieval. Mitigation: tenant filter before any retriever, plus an eval.
- AGPL contamination. Mitigation: ADR-011.
- Staging host indexed. Mitigation: non-canonical host, auth or `noindex`, no sitemap.
- Global storage CDN (SRC-SUPABASE-REGIONS). Mitigation: evidence buckets stay private; do not design restricted objects as public CDN content; confirm behavior before production.

### P2

- Denial of wallet on maps, GPU, or model calls. Mitigation: quotas in the FinOps design.
- Audit log edited by a client. Mitigation: no client UPDATE/DELETE on `audit`.
- Clock skew forging replay. Mitigation: separate event, device, GNSS, and ingest times.

### P3

- User enumeration. Mitigation: generic auth errors.
- Portal clickjacking. Mitigation: `frame-ancestors` when the portal exists.

## Upload

Type and size checks happen on the server. Objects are private. The application does not execute uploaded content. Malware scanning is a SHOULD, not a claim that a scanner is deployed.

## Privileged modules

Any `service_role` use has a boundary, tests, audit, and a written justification. Ordinary requests do not take that role.

## What this model does not prove

No productive system exists yet. These controls are acceptance criteria for later phases, not a current PASS of a live environment.
