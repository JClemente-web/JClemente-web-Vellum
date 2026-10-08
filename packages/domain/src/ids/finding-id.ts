import { parseBrandedId } from "./parse-branded-id.js";
import type { Result } from "../result/result.js";
import type { DomainError } from "../errors/domain-error.js";

export type FindingId = string & { readonly __brand: "FindingId" };

export function parseFindingId(input: string): Result<FindingId, DomainError> {
  return parseBrandedId<FindingId>(input);
}
