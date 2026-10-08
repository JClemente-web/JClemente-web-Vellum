import { parseBrandedId } from "./parse-branded-id.js";
import type { Result } from "../result/result.js";
import type { DomainError } from "../errors/domain-error.js";

export type TenantId = string & { readonly __brand: "TenantId" };

export function parseTenantId(input: string): Result<TenantId, DomainError> {
  return parseBrandedId<TenantId>(input);
}
