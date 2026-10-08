export const DOMAIN_ERROR_CODES = [
  "invalid_id",
  "invariant_violated",
  "unauthorized_tenant",
  "metric_crs_rejected",
  "crs_not_verified",
] as const;

export type DomainErrorCode = (typeof DOMAIN_ERROR_CODES)[number];

export type DomainError = {
  readonly code: DomainErrorCode;
  readonly message: string;
};

export function domainError(code: DomainErrorCode, message: string): DomainError {
  return { code, message };
}
