import { describe, expect, it } from "vitest";
import { parseTenantId, parseUserId } from "@vellum/domain";
import type { DatabaseRequestContext } from "./database-request-context.js";

describe("DatabaseRequestContext", () => {
  it("can be named only as a type consumed by authorizeMembership", () => {
    const user = parseUserId("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    const tenant = parseTenantId("11111111-1111-4111-8111-111111111111");
    expect(user.ok && tenant.ok).toBe(true);
    if (!user.ok || !tenant.ok) return;
    const context: DatabaseRequestContext = { userId: user.value, tenantId: tenant.value, correlationId: "corr-1" };
    expect(context.correlationId).toBe("corr-1");
  });
});
