import { describe, expect, it } from "vitest";
import { versionMetadata } from "./version-metadata.js";

describe("VersionMetadata", () => {
  it("accepts revision 1 and rejects zero", () => {
    const okRevision = versionMetadata(1);
    expect(okRevision.ok && okRevision.value.revision).toBe(1);
    expect(versionMetadata(0).ok).toBe(false);
    expect(versionMetadata(1.5).ok).toBe(false);
  });
});
