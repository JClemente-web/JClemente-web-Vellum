import { describe, expect, it } from "vitest";
import { parseUserId } from "./user-id.js";

const VALID = "11111111-1111-4111-8111-111111111111";

describe("parseUserId", () => {
  it("accepts a version 4 UUID", () => {
    const parsed = parseUserId(VALID);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value).toBe(VALID);
    }
  });

  it("rejects empty and non-UUID values", () => {
    expect(parseUserId("").ok).toBe(false);
    const bad = parseUserId("not-a-uuid");
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      expect(bad.error.code).toBe("invalid_id");
      expect("value" in bad).toBe(false);
    }
  });
});
