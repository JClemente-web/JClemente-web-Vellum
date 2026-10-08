const REDACTED = new Set(["authorization", "cookie", "service_role", "database_url"]);

export type LogFields = Record<string, unknown> & {
  traceId?: string;
  spanId?: string;
  tenantId?: string;
};

export type LogWriter = (line: string) => void;

export function createLogger(writer: LogWriter) {
  return {
    info(fields: LogFields): void {
      const safe: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(fields)) {
        safe[key] = REDACTED.has(key.toLowerCase()) ? "[redacted]" : value;
      }
      writer(JSON.stringify({ level: "info", ...safe }));
    },
  };
}
