import type { Result } from "../result/result.js";
import { err, ok } from "../result/result.js";
import { domainError } from "../errors/domain-error.js";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseBrandedId<T extends string>(input: string): Result<T, ReturnType<typeof domainError>> {
  if (input.length === 0 || !UUID_V4.test(input)) {
    return err(domainError("invalid_id", "identifier must be a UUID"));
  }
  return ok(input.toLowerCase() as T);
}
