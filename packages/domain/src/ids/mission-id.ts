import { parseBrandedId } from "./parse-branded-id.js";
import type { Result } from "../result/result.js";
import type { DomainError } from "../errors/domain-error.js";

export type MissionId = string & { readonly __brand: "MissionId" };

export function parseMissionId(input: string): Result<MissionId, DomainError> {
  return parseBrandedId<MissionId>(input);
}
