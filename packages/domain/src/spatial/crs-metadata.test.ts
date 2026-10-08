import { describe, expect, it } from "vitest";
import { crsMetadata } from "./crs-metadata.js";

describe("CrsMetadata", () => {
  it("stores kind as data", () => {
    expect(crsMetadata(4674, "geographic").kind).toBe("geographic");
    expect(crsMetadata(31978, "projected").kind).toBe("projected");
    expect(crsMetadata(1, "vertical").kind).toBe("vertical");
  });
});
