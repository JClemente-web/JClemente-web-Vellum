import { webhookEnvelopeV1Schema } from "./webhook-envelope-v1.js";
import { exerciseSchema, sampleIds } from "../schema-cases.js";

exerciseSchema("WebhookEnvelopeV1", webhookEnvelopeV1Schema, {
  schemaVersion: 1,
  deliveryId: sampleIds.ID,
  tenantId: sampleIds.ID,
  idempotencyKey: "example-key",
  payload: {},
}, "deliveryId");
