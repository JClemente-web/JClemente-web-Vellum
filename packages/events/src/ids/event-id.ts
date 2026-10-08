import { domainError, err, ok, type DomainError, type Result } from "@vellum/domain";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type EventId = string & { readonly __brand: "EventId" };

export function parseEventId(input: string): Result<EventId, DomainError> {
  if (!UUID_V4.test(input)) return err(domainError("invalid_id", "event id must be a UUID"));
  return ok(input.toLowerCase() as EventId);
}
