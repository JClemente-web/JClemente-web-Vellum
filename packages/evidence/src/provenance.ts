import type { TenantId } from "@vellum/domain";

export type EvidenceProvenance = {
  tenantId: TenantId;
  contentHash: string;
  role: "original" | "derived";
};
