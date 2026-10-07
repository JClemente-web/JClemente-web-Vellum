# ADR-007 — REST and OpenAPI for the BFF

- Status: accepted
- Date: 2026-10-07

## Context

Enterprise clients, webhooks, security review, and future SDKs need a transport contract that is not the domain model and not a private function call.

## Decision

The BFF speaks REST, described by OpenAPI. The public prefix is `/api/v1`. Internal module URLs are not versioned beyond that prefix. Domain types and runtime schemas (Zod contracts such as EventEnvelopeV1 and VCPManifestV1) stay separate from transport DTOs. OpenAPI is not the domain.

Breaking transport changes increment the prefix. Additive fields do not.

## Alternatives

- GraphQL as the primary contract. Rejected for V3: authorization and caching are harder to audit, and the operational API is resource-shaped.
- tRPC only. Rejected as the external contract: it couples clients to the TypeScript monorepo. It may exist later as an internal convenience, not as the published API.
- Unversioned JSON. Rejected: external clients and webhooks need a stable document.

## Consequences

DTO mapping is explicit. Generated SDKs are possible later. They are not part of this batch.

## Security impact

Route inventory is reviewable. Authz is still enforced in use cases, not by the OpenAPI file.

## Operational impact

Contract tests can diff the OpenAPI document once the BFF exists.

## Revisit trigger

A client integration needs a query language the resource API cannot express without a new version.

## Sources

Final spec. ADR-006. ADR-014.
