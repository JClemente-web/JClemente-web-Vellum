import { parseBrandedId } from "./parse-branded-id.js";
import type { Result } from "../result/result.js";
import type { DomainError } from "../errors/domain-error.js";

export type UserId = string & { readonly __brand: "UserId" };

export function parseUserId(input: string): Result<UserId, DomainError> {
  return parseBrandedId<UserId>(input);
}
