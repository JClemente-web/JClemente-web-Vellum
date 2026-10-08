import { auditEventV1Schema } from "./audit-event-v1.js";
import { exerciseSchema, sampleIds } from "../schema-cases.js";

exerciseSchema("AuditEventV1", auditEventV1Schema, {
  schemaVersion: 1,
  tenantId: sampleIds.ID,
  actorId: sampleIds.ID,
  action: "read",
  at: sampleIds.WHEN,
  correlationId: "corr-1",
}, "actorId");
