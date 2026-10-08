import { vcpManifestV1Schema } from "./vcp-manifest-v1.js";
import { exerciseSchema, sampleIds } from "../schema-cases.js";

exerciseSchema("VcpManifestV1", vcpManifestV1Schema, {
  schemaVersion: 1,
  manifestId: sampleIds.ID,
  tenantId: sampleIds.ID,
  evidenceId: sampleIds.ID,
  contentHash: "a".repeat(64),
  role: "original",
}, "evidenceId");
