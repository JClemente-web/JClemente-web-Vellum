import { parseBrandedId } from "./parse-branded-id.js";
import type { Result } from "../result/result.js";
import type { DomainError } from "../errors/domain-error.js";

export type ActionId = string & { readonly __brand: "ActionId" };

export function parseActionId(input: string): Result<ActionId, DomainError> {
  return parseBrandedId<ActionId>(input);
}
