import { describe, expect, it } from "vitest";
import { parseTenantId, parseUserId } from "@vellum/domain";
import { assertSameTenant, authorizeMembership } from "./authorize-membership.js";
import * as auth from "./index.js";

const user = parseUserId("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
const tenantA = parseTenantId("11111111-1111-4111-8111-111111111111");
const tenantB = parseTenantId("22222222-2222-4222-8222-222222222222");

function ids() {
  if (!user.ok || !tenantA.ok || !tenantB.ok) throw new Error("fixtures");
  return { userId: user.value, tenantA: tenantA.value, tenantB: tenantB.value };
}

describe("authorizeMembership", () => {
  it("denies a requested tenant without membership", () => {
    const { userId, tenantA, tenantB } = ids();
    const denied = authorizeMembership({
      userId,
      memberships: [tenantA],
      requestedTenantId: tenantB,
      correlationId: "corr-1",
    });
    expect(denied.ok).toBe(false);
    const empty = authorizeMembership({ userId, memberships: [], requestedTenantId: tenantA, correlationId: "corr-1" });
    expect(empty.ok).toBe(false);
  });

  it("returns context only after membership matches", () => {
    const { userId, tenantA } = ids();
    const allowed = authorizeMembership({
      userId,
      memberships: [tenantA],
      requestedTenantId: tenantA,
      correlationId: "corr-1",
      requestId: "req-1",
      actorType: "user",
    });
    expect(allowed.ok).toBe(true);
    const plain = authorizeMembership({ userId, memberships: [tenantA], requestedTenantId: tenantA, correlationId: "corr-1" });
    expect(plain.ok).toBe(true);
    if (plain.ok) expect(plain.value.requestId).toBeUndefined();
    if (allowed.ok) {
      expect(allowed.value.tenantId).toBe(tenantA);
      expect(allowed.value.requestId).toBe("req-1");
      expect(allowed.value.actorType).toBe("user");
    }
  });

  it("does not export a raw context constructor", () => {
    expect("fromRequest" in auth).toBe(false);
    expect("createDatabaseRequestContext" in auth).toBe(false);
    const { tenantA, tenantB } = ids();
    expect(assertSameTenant(tenantA, tenantB).ok).toBe(false);
    expect(assertSameTenant(tenantA, tenantA).ok).toBe(true);
  });
});
