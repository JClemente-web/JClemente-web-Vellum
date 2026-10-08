import { z } from "zod";
import { isoTimestampSchema, uuidV4Schema } from "../ids.js";

export const eventEnvelopeV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    eventId: uuidV4Schema,
    tenantId: uuidV4Schema,
    aggregateId: uuidV4Schema,
    timestamp: isoTimestampSchema,
    sequence: z.number().int().nonnegative(),
    actor: z.string().min(1),
    source: z.string().min(1),
    correlationId: z.string().min(1),
    causationId: z.string().min(1),
    idempotencyKey: z.string().min(1),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();

export type EventEnvelopeV1 = z.infer<typeof eventEnvelopeV1Schema>;
