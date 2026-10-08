import { parseBrandedId } from "./parse-branded-id.js";
import type { Result } from "../result/result.js";
import type { DomainError } from "../errors/domain-error.js";

export type AssetId = string & { readonly __brand: "AssetId" };

export function parseAssetId(input: string): Result<AssetId, DomainError> {
  return parseBrandedId<AssetId>(input);
}
