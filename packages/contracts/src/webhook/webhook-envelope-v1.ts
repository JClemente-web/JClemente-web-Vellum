import { z } from "zod";
import { uuidV4Schema } from "../ids.js";

export const webhookEnvelopeV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    deliveryId: uuidV4Schema,
    tenantId: uuidV4Schema,
    idempotencyKey: z.string().min(1),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();

export type WebhookEnvelopeV1 = z.infer<typeof webhookEnvelopeV1Schema>;
