import { describe, expect, it } from "vitest";
import { spatialQuality } from "./spatial-quality.js";

describe("SpatialQuality", () => {
  it("stores a CRS code and does not transform it", () => {
    expect(spatialQuality(4674)).toEqual({ crsCode: 4674, quality: "unchecked" });
  });
});
