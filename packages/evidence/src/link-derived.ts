import { domainError, err, ok, type DomainError, type EvidenceId, type Result, type TenantId } from "@vellum/domain";

export type DerivedLink = {
  originalId: EvidenceId;
  derivedId: EvidenceId;
  tenantId: TenantId;
};

export function linkDerived(input: {
  originalId: EvidenceId;
  derivedId: EvidenceId;
  originalTenantId: TenantId;
  derivedTenantId: TenantId;
}): Result<DerivedLink, DomainError> {
  if (input.derivedId === input.originalId) {
    return err(domainError("invariant_violated", "derived evidence cannot replace the original identity"));
  }
  if (input.derivedTenantId !== input.originalTenantId) {
    return err(domainError("unauthorized_tenant", "derived evidence must stay in the original tenant"));
  }
  return ok({ originalId: input.originalId, derivedId: input.derivedId, tenantId: input.originalTenantId });
}
