# ADR-008 — Transactional outbox

- Status: accepted
- Date: 2026-10-07

## Context

Mission, finding, and evidence changes must emit events exactly once relative to the state change, and consumers must tolerate retries.

## Decision

Events are written to a Postgres outbox in the same transaction as the aggregate change. No separate broker in V3. Envelope V1 fields: schemaVersion, eventId, tenantId, aggregateId, timestamp, sequence, actor, source, correlationId, causationId, idempotencyKey, payload. Uniqueness is (tenant, idempotency key). Consumers are idempotent.

## Alternatives

- Publish to a broker inside the request, then commit. Rejected: dual-write.
- Application memory events. Rejected: not durable.

## Consequences

A dispatcher process is required later. The schema can move to a broker without changing the envelope.

## Security impact

Outbox rows carry tenant id. Dispatch must not cross tenants.

## Operational impact

Ordering for a single aggregate uses sequence plus event time. Global order across aggregates is not promised.

## Revisit trigger

Sustained throughput or fan-out that Postgres polling cannot meet, with measurements.

## Sources

Final spec event model.
