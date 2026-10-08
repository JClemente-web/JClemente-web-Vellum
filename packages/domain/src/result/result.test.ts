import { describe, expect, it } from "vitest";
import { domainError } from "../errors/domain-error.js";
import { err, ok } from "./result.js";

describe("Result", () => {
  it("carries a value only on success", () => {
    const success = ok(1);
    expect(success.ok).toBe(true);
    expect(success.value).toBe(1);
  });

  it("carries an error and no value on failure", () => {
    const failure = err(domainError("invariant_violated", "broken"));
    expect(failure.ok).toBe(false);
    expect(failure.error.code).toBe("invariant_violated");
    expect("value" in failure).toBe(false);
  });
});
