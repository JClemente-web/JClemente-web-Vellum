import { telemetryEnvelopeV1Schema } from "./telemetry-envelope-v1.js";
import { exerciseSchema, sampleIds } from "../schema-cases.js";

exerciseSchema("TelemetryEnvelopeV1", telemetryEnvelopeV1Schema, {
  schemaVersion: 1,
  tenantId: sampleIds.ID,
  missionId: sampleIds.ID,
  observedAt: sampleIds.WHEN,
  sourceCrs: 4674,
}, "missionId");
