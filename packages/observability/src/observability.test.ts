import { describe, expect, it } from "vitest";
import { buildMetadata } from "./build-metadata.js";
import { correlationId } from "./correlation.js";
import { healthDto } from "./health.js";
import { createLogger } from "./logger.js";
import { readinessDto } from "./readiness.js";

describe("observability", () => {
  it("redacts secret-bearing keys", () => {
    const lines: string[] = [];
    createLogger((line) => lines.push(line)).info({
      authorization: "Bearer secret",
      cookie: "sid",
      service_role: "key",
      database_url: "postgres://local",
      tenantId: "tenant-a",
      traceId: "trace",
      spanId: "span",
    });
    const parsed = JSON.parse(lines[0] ?? "{}") as Record<string, string>;
    expect(parsed.authorization).toBe("[redacted]");
    expect(parsed.cookie).toBe("[redacted]");
    expect(parsed.service_role).toBe("[redacted]");
    expect(parsed.database_url).toBe("[redacted]");
    expect(parsed.tenantId).toBe("tenant-a");
  });

  it("builds health, readiness, correlation, and commit metadata", () => {
    expect(healthDto()).toEqual({ status: "ok" });
    expect(readinessDto([{ name: "database", status: "ready" }]).status).toBe("ready");
    expect(readinessDto([{ name: "database", status: "down" }]).status).toBe("not_ready");
    expect(readinessDto([{ name: "database", status: "not_configured" }]).status).toBe("not_ready");
    expect(correlationId("corr-1")).toBe("corr-1");
    expect(correlationId(undefined)).toMatch(/[0-9a-f-]{36}/);
    expect(correlationId("")).toMatch(/[0-9a-f-]{36}/);
    expect(buildMetadata({}).commitSha).toBe("unknown");
    expect(buildMetadata({ VELLUM_COMMIT_SHA: "" }).commitSha).toBe("unknown");
    expect(buildMetadata({ VELLUM_COMMIT_SHA: "abc" }).commitSha).toBe("abc");
  });
});
