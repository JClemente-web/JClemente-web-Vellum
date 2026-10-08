import { describe, expect, it } from "vitest";
import { apiErrorV1Schema } from "./api-error-v1.js";
import { exerciseSchema } from "../schema-cases.js";

const valid = { schemaVersion: 1, code: "not_found", message: "missing", correlationId: "corr-1" };
exerciseSchema("ApiErrorV1", apiErrorV1Schema, valid, "code", "");

describe("ApiErrorV1 secrets", () => {
  it("rejects stack, service role, and authorization fields", () => {
    expect(apiErrorV1Schema.safeParse({ ...valid, stack: "trace" }).success).toBe(false);
    expect(apiErrorV1Schema.safeParse({ ...valid, serviceRole: "no" }).success).toBe(false);
    expect(apiErrorV1Schema.safeParse({ ...valid, authorization: "no" }).success).toBe(false);
  });
});
