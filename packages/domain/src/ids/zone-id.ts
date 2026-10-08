import { parseBrandedId } from "./parse-branded-id.js";
import type { Result } from "../result/result.js";
import type { DomainError } from "../errors/domain-error.js";

export type ZoneId = string & { readonly __brand: "ZoneId" };

export function parseZoneId(input: string): Result<ZoneId, DomainError> {
  return parseBrandedId<ZoneId>(input);
}
