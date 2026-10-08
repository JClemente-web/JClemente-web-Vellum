import { domainError, err, ok, type DomainError, type Result, type TenantId, type UserId } from "@vellum/domain";
import type { DatabaseRequestContext } from "./database-request-context.js";

export type MembershipAuthorizationInput = {
  userId: UserId;
  memberships: readonly TenantId[];
  requestedTenantId: TenantId;
  correlationId: string;
  requestId?: string;
  actorType?: string;
};

export function authorizeMembership(input: MembershipAuthorizationInput): Result<DatabaseRequestContext, DomainError> {
  const allowed = input.memberships.includes(input.requestedTenantId);
  if (input.memberships.length === 0 || !allowed) {
    return err(domainError("unauthorized_tenant", "membership does not authorize the requested tenant"));
  }
  const context: DatabaseRequestContext = {
    userId: input.userId,
    tenantId: input.requestedTenantId,
    correlationId: input.correlationId,
  };
  if (input.requestId !== undefined) context.requestId = input.requestId;
  if (input.actorType !== undefined) context.actorType = input.actorType;
  return ok(context);
}

export function assertSameTenant(left: TenantId, right: TenantId): Result<TenantId, DomainError> {
  if (left !== right) return err(domainError("unauthorized_tenant", "tenant mismatch"));
  return ok(left);
}
