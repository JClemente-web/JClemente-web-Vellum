import type { TenantId, UserId } from "@vellum/domain";

export type DatabaseRequestContext = {
  userId: UserId;
  tenantId: TenantId;
  correlationId: string;
  requestId?: string;
  actorType?: string;
};
