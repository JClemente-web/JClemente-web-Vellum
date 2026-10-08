import { z } from "zod";
import { isoTimestampSchema, uuidV4Schema } from "../ids.js";

export const auditEventV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    tenantId: uuidV4Schema,
    actorId: uuidV4Schema,
    action: z.string().min(1),
    at: isoTimestampSchema,
    correlationId: z.string().min(1),
  })
  .strict();

export type AuditEventV1 = z.infer<typeof auditEventV1Schema>;
