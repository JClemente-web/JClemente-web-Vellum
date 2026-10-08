import { describe, expect, it } from "vitest";
import { buildEnvelope } from "../build-envelope.js";
import { parseEventId } from "../ids/event-id.js";
import { MemoryIdempotencyStore } from "./memory-store.js";

const base = {
  schemaVersion: 1,
  eventId: "11111111-1111-4111-8111-111111111111",
  tenantId: "11111111-1111-4111-8111-111111111111",
  aggregateId: "11111111-1111-4111-8111-111111111111",
  timestamp: "2026-10-07T00:00:00.000Z",
  sequence: 1,
  actor: "user",
  source: "bff",
  correlationId: "corr-1",
  causationId: "cause-1",
  idempotencyKey: "example-key",
  payload: {},
};

describe("idempotency", () => {
  it("returns the original event id for a duplicate key in the same tenant", () => {
    const store = new MemoryIdempotencyStore();
    const first = store.remember(base.tenantId, "example-key", base.eventId);
    const second = store.remember(base.tenantId, "example-key", "22222222-2222-4222-8222-222222222222");
    expect(second).toBe(first);
  });

  it("does not collide when another tenant reuses the key", () => {
    const store = new MemoryIdempotencyStore();
    store.remember(base.tenantId, "example-key", base.eventId);
    const other = store.remember("22222222-2222-4222-8222-222222222222", "example-key", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(other).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  });

  it("rejects an envelope without a correlation id", () => {
    const { correlationId, ...rest } = base;
    expect(correlationId).toBe("corr-1");
    expect(buildEnvelope(rest).ok).toBe(false);
    expect(buildEnvelope(base).ok).toBe(true);
    expect(parseEventId("not-a-uuid").ok).toBe(false);
    expect(parseEventId(base.eventId).ok).toBe(true);
  });
});
