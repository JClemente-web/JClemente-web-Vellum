import { z } from "zod";
import { uuidV4Schema } from "../ids.js";

export const vcpManifestV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    manifestId: uuidV4Schema,
    tenantId: uuidV4Schema,
    evidenceId: uuidV4Schema,
    contentHash: z.string().regex(/^[0-9a-f]{64}$/),
    role: z.enum(["original", "derived"]),
  })
  .strict();

export type VcpManifestV1 = z.infer<typeof vcpManifestV1Schema>;
