import { describe, expect, it } from "vitest";
import { DOMAIN_ERROR_CODES, domainError } from "./domain-error.js";

describe("DomainError", () => {
  it("keeps a stable code", () => {
    expect(DOMAIN_ERROR_CODES).toContain("unauthorized_tenant");
    expect(domainError("unauthorized_tenant", "denied").code).toBe("unauthorized_tenant");
  });
});
