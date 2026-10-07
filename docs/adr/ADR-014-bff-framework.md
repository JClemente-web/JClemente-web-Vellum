# ADR-014 — BFF framework

- Status: accepted
- Date: 2026-10-07

## Context

The BFF needs validation, OpenAPI, structured logs, tests, and a long-running Node process on Cloud Run. Nothing is installed in this batch.

## Decision

Fastify with TypeScript.

Reasons: JSON schema validation on routes, first-party OpenAPI integration through the Fastify plugin ecosystem, structured logging, a mature plugin model, straightforward testing, and a process model that fits Cloud Run. Performance headroom is real relative to a minimal router, and it is not the deciding factor.

## Alternatives

- Express. Capable and widely known. Weaker defaults for schema validation, OpenAPI, and structured logging. Those would be assembled by convention. Rejected as the baseline.
- Hono. Excellent size and edge portability. The BFF is a Cloud Run service with plugins, streaming uploads, and long-lived database pools, not an edge function. Hono remains acceptable for a future edge adjunct. Rejected as the primary BFF.
- NestJS. More structure, more framework surface. Rejected under YAGNI.

## Consequences

Route schemas feed OpenAPI. Domain validation still uses the contract package. Transport DTOs are not domain entities.

## Security impact

Schema validation is input hygiene, not authorization. Authz stays in the use case (ADR-006).

## Operational impact

Fastify is not installed until Phase 0 is separately authorized. The health endpoint and logger binding are part of that later phase.

## Revisit trigger

Cloud Run constraints or a measured need to split a latency-sensitive edge route onto Hono.

## Sources

https://fastify.dev/
https://expressjs.com/
https://hono.dev/
ADR-006, ADR-007.
