import { describe, expect, it } from "vitest";
import type { ZodType } from "zod";

const ID = "11111111-1111-4111-8111-111111111111";
const WHEN = "2026-10-07T00:00:00.000Z";

export function exerciseSchema(name: string, schema: ZodType, valid: Record<string, unknown>, wrongIdField: string, invalidIdentifier: unknown = "not-a-uuid"): void {
  describe(name, () => {
    it("accepts a valid payload and round-trips", () => {
      const parsed = schema.parse(valid);
      expect(schema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
    });
    it("rejects an invalid payload", () => {
      expect(schema.safeParse({}).success).toBe(false);
    });
    it("rejects an unknown schema version", () => {
      expect(schema.safeParse({ ...valid, schemaVersion: 2 }).success).toBe(false);
    });
    it("rejects an extra field", () => {
      expect(schema.safeParse({ ...valid, extra: "no" }).success).toBe(false);
    });
    it("rejects a wrong identifier", () => {
      expect(schema.safeParse({ ...valid, [wrongIdField]: invalidIdentifier }).success).toBe(false);
    });
  });
}

export const sampleIds = { ID, WHEN };
