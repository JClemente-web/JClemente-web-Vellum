import type { Result } from "../result/result.js";
import type { DomainError } from "../errors/domain-error.js";
import { domainError } from "../errors/domain-error.js";
import { err, ok } from "../result/result.js";

export type VersionMetadata = { revision: number };

export function versionMetadata(revision: number): Result<VersionMetadata, DomainError> {
  if (!Number.isInteger(revision) || revision < 1) {
    return err(domainError("invariant_violated", "revision must be an integer greater than or equal to 1"));
  }
  return ok({ revision });
}
