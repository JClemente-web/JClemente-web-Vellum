import { z } from "zod";
import { isoTimestampSchema, uuidV4Schema } from "../ids.js";

export const telemetryEnvelopeV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    tenantId: uuidV4Schema,
    missionId: uuidV4Schema,
    observedAt: isoTimestampSchema,
    sourceCrs: z.number().int(),
  })
  .strict();

export type TelemetryEnvelopeV1 = z.infer<typeof telemetryEnvelopeV1Schema>;
