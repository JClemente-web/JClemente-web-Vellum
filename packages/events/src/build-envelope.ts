import { eventEnvelopeV1Schema, type EventEnvelopeV1 } from "@vellum/contracts";
import { domainError, err, ok, type DomainError, type Result } from "@vellum/domain";

export function buildEnvelope(input: unknown): Result<EventEnvelopeV1, DomainError> {
  const parsed = eventEnvelopeV1Schema.safeParse(input);
  if (!parsed.success) return err(domainError("invariant_violated", "event envelope is invalid"));
  return ok(parsed.data);
}
