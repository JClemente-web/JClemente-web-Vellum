import { parseBrandedId } from "./parse-branded-id.js";
import type { Result } from "../result/result.js";
import type { DomainError } from "../errors/domain-error.js";

export type EvidenceId = string & { readonly __brand: "EvidenceId" };

export function parseEvidenceId(input: string): Result<EvidenceId, DomainError> {
  return parseBrandedId<EvidenceId>(input);
}
