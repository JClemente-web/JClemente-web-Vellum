import { describe, expect, it } from "vitest";
import { parseUserId } from "../ids/user-id.js";
import type { EntityMetadata } from "./entity-metadata.js";

describe("EntityMetadata", () => {
  it("stores creation fields without transforming them", () => {
    const user = parseUserId("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(user.ok).toBe(true);
    if (!user.ok) return;
    const metadata: EntityMetadata = {
      createdAt: "2026-10-07T00:00:00.000Z",
      updatedAt: "2026-10-07T00:00:00.000Z",
      createdBy: user.value,
    };
    expect(metadata.createdBy).toBe(user.value);
  });
});
