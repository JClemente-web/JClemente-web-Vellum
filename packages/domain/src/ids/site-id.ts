import { parseBrandedId } from "./parse-branded-id.js";
import type { Result } from "../result/result.js";
import type { DomainError } from "../errors/domain-error.js";

export type SiteId = string & { readonly __brand: "SiteId" };

export function parseSiteId(input: string): Result<SiteId, DomainError> {
  return parseBrandedId<SiteId>(input);
}
