import { eventEnvelopeV1Schema } from "./event-envelope-v1.js";
import { exerciseSchema, sampleIds } from "../schema-cases.js";

exerciseSchema("EventEnvelopeV1", eventEnvelopeV1Schema, {
  schemaVersion: 1,
  eventId: sampleIds.ID,
  tenantId: sampleIds.ID,
  aggregateId: sampleIds.ID,
  timestamp: sampleIds.WHEN,
  sequence: 1,
  actor: "user",
  source: "bff",
  correlationId: "corr-1",
  causationId: "cause-1",
  idempotencyKey: "example-key",
  payload: { kind: "probe" },
}, "eventId");
