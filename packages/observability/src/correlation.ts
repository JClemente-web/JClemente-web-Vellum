export function correlationId(header: string | undefined): string {
  if (header !== undefined && header.length > 0) return header;
  return crypto.randomUUID();
}
