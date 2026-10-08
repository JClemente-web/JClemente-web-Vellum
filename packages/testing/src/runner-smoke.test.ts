import { describe, expect, it } from "vitest";
import { TENANT_A } from "./index.js";

describe("runner", () => {
  it("loads the tenant fixture", () => {
    expect(TENANT_A.startsWith("11111111")).toBe(true);
  });
});