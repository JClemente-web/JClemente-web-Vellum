import { parseBrandedId } from "./parse-branded-id.js";
import type { Result } from "../result/result.js";
import type { DomainError } from "../errors/domain-error.js";

export type ProjectId = string & { readonly __brand: "ProjectId" };

export function parseProjectId(input: string): Result<ProjectId, DomainError> {
  return parseBrandedId<ProjectId>(input);
}
