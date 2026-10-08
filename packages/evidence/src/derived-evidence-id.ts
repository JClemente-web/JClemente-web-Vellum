import { parseEvidenceId, type EvidenceId, type DomainError, type Result } from "@vellum/domain";

export function parseDerivedEvidenceId(input: string): Result<EvidenceId, DomainError> {
  return parseEvidenceId(input);
}
