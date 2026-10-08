import { describe, expect, it } from "vitest";
import { provenance } from "./provenance.js";

describe("Provenance", () => {
  it("records an official source without evaluating it", () => {
    const record = provenance({
      sourceRegistryId: "epsg-4674",
      retrievedAt: "2026-10-07",
      method: "OFFICIAL_SOURCE",
    });
    expect(record.method).toBe("OFFICIAL_SOURCE");
  });
});
