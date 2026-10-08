import { describe, expect, it } from "vitest";
import type { AuditMetadata } from "./audit-metadata.js";

describe("AuditMetadata", () => {
  it("keeps the correlation id", () => {
    const audit: AuditMetadata = { actor: "user", at: "2026-10-07T00:00:00.000Z", correlationId: "corr-1" };
    expect(audit.correlationId).toBe("corr-1");
  });
});
