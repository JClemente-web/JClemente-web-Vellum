import { describe, expect, it } from "vitest";
import { parseZoneId } from "./zone-id.js";

const VALID = "11111111-1111-4111-8111-111111111111";

describe("parseZoneId", () => {
  it("accepts a version 4 UUID", () => {
    const parsed = parseZoneId(VALID);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value).toBe(VALID);
    }
  });

  it("rejects empty and non-UUID values", () => {
    expect(parseZoneId("").ok).toBe(false);
    const bad = parseZoneId("not-a-uuid");
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      expect(bad.error.code).toBe("invalid_id");
      expect("value" in bad).toBe(false);
    }
  });
});
