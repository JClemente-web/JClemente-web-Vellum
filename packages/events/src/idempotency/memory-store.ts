export class MemoryIdempotencyStore {
  private readonly seen = new Map<string, string>();

  remember(tenantId: string, idempotencyKey: string, eventId: string): string {
    const key = tenantId + "\u0000" + idempotencyKey;
    const existing = this.seen.get(key);
    if (existing !== undefined) return existing;
    this.seen.set(key, eventId);
    return eventId;
  }
}
