import { describe, expect, it } from "vitest";
import { parseFindingId } from "./finding-id.js";

const VALID = "11111111-1111-4111-8111-111111111111";

describe("parseFindingId", () => {
  it("accepts a version 4 UUID", () => {
    const parsed = parseFindingId(VALID);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value).toBe(VALID);
    }
  });

  it("rejects empty and non-UUID values", () => {
    expect(parseFindingId("").ok).toBe(false);
    const bad = parseFindingId("not-a-uuid");
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      expect(bad.error.code).toBe("invalid_id");
      expect("value" in bad).toBe(false);
    }
  });
});
