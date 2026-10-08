import { describe, expect, it } from "vitest";
import * as regulatory from "./regulatory-version.js";
import * as domain from "../index.js";

describe("regulatory scope", () => {
  it("does not export a flight-rule evaluator", () => {
    expect("evaluateFlightRule" in regulatory).toBe(false);
    expect("evaluate" in regulatory).toBe(false);
    expect("evaluateFlightRule" in domain).toBe(false);
    expect(regulatory.SORA_STATUS).toBe("NOT_CONFIRMED");
    expect(regulatory.ICA_100_40_ARTICLE_RULES).toBe("NOT_INGESTED");
    expect(regulatory.ICA_100_48_ARTICLE_RULES).toBe("NOT_INGESTED");
  });
});
