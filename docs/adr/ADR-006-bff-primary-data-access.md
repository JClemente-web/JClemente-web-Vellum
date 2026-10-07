# ADR-006 — BFF as the primary data-access path

- Status: accepted
- Date: 2026-10-07

## Context

Supabase can expose Postgres directly to the browser. That path is easy to misuse: broad grants, missing tenant predicates, and secret keys in clients.

## Decision

Authentication:

Browser → Supabase Auth → JWT session.

Business use cases:

Browser → BFF → domain/application service → data access → Postgres.

The BFF validates the JWT, reconstructs TenantContext, authorizes the use case, propagates a correlation id, and audits material operations.

RLS remains defense in depth. It does not replace BFF authorization.

Queries that run for an authorized request keep a transaction-local database context in which RLS still applies.

`service_role` / secret key is server-only and limited to internal jobs, provisioning, controlled administration, and other explicitly privileged tasks. It is not the shortcut for ordinary application traffic. A privileged module has its own boundary, tests, audit events, and a note in this ADR or a follow-up ADR.

## Database connection and RLS execution context

Amended 2026-10-07. This amendment specifies the execution mechanism. It does not change the decision that the BFF is the business-data boundary and that RLS is defense in depth.

The normal BFF connection role is `vellum_app`: `LOGIN`, `NOSUPERUSER`, `NOBYPASSRLS`, `NOCREATEDB`, `NOCREATEROLE`, `NOINHERIT`. Direct grants on `vellum_app` remain usable with `NOINHERIT`. That attribute only withholds privileges of other roles this role might later join. Phase 0 grants are direct. The BFF does not `SET ROLE` and does not connect as `postgres`, `service_role`, a superuser, or any `BYPASSRLS` role for ordinary traffic.

`vellum_app` is not the Supabase Data API role model. PostgREST roles `anon`, `authenticated`, and `service_role` belong to that Data API. Phase 0 does not create them and does not create a custom `vellum_anon`. Browser Data API access stays deny-by-default. A future exception ADR names the real Supabase role for that resource.

Versioned business migrations do not contain `CREATE ROLE` or passwords. Local and CI role bootstrap is a separate script. It reads `VELLUM_LOCAL_DB_PASSWORD` from the environment and refuses `staging` and `production`.

Authenticated request flow:

1. The client presents a Supabase Auth JWT to the BFF.
2. The BFF validates the JWT and reads the authenticated user id.
3. The BFF loads membership for that user and authorizes the requested resource.
4. Only then does it resolve the tenant.
5. Inside one database transaction it sets `app.user_id` and `app.tenant_id` with `set_config(..., true)`, so the values are transaction-local.
6. Queries run. RLS sees that context. `COMMIT` or `ROLLBACK` clears it before the pooled connection is reused.

A tenant id that arrives only in a body, header, query string, or route parameter is not authority. Editable `user_metadata` is not authority. Phase 0 does not authorize from `app_metadata`. If a future phase puts a tenant claim in `app_metadata`, that claim can be stale for the life of the token, and the BFF must still authorize against current membership.

Missing or invalid `app.user_id` or `app.tenant_id` denies rows. There is no default tenant. Helper functions return null on a missing or malformed setting. Policies compare the row tenant with the transaction tenant and, on the isolation probe, with the user's membership. `UPDATE` uses both `USING` and `WITH CHECK`. Tenant tables use `ENABLE` and `FORCE ROW LEVEL SECURITY`. The isolation test connects as `vellum_app`, not as the table owner.

`DatabaseRequestContext` (`userId`, `tenantId`, `correlationId`, and optionally `requestId` and `actorType`) is built only by the membership authorization function. Public handlers do not construct it from raw input.

Browser Data API reads and writes are deny-by-default. A future exception requires an ADR for that resource and automated cross-tenant tests.

Client Realtime is allowed only when RLS covers the underlying rows, channel authorization is defined, and a cross-tenant subscribe test exists.

## Alternatives

- Browser talks to PostgREST for all CRUD, with RLS as the only authorization. Rejected: grant mistakes become tenant escapes, and use-case rules such as "executed is not resolved" do not belong only in policies.
- BFF uses `service_role` for every request and reimplements all filtering. Rejected: one missing `tenant_id` predicate bypasses RLS.

## Consequences

More server code. Clearer audit and authorization. Direct table browsing is not a product API.

## Security impact

Closes the default tenant-escape path through the Data API. Residual risk is a later exception ADR that forgets tests.

## Operational impact

The API process on Cloud Run holds the secret key. The browser holds only the publishable key and the user JWT.

## Revisit trigger

A read-heavy map query cannot meet latency through the BFF, and a scoped Data API exception is proposed with tests.

## Sources

SRC-SUPABASE-RLS, SRC-SUPABASE-KEYS, SRC-SUPABASE-GRANTS.
