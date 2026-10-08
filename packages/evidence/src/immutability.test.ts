import { describe, expect, it } from "vitest";
import { parseEvidenceId, parseTenantId } from "@vellum/domain";
import { contentHash } from "./content-hash.js";
import { linkDerived } from "./link-derived.js";
import { parseDerivedEvidenceId } from "./derived-evidence-id.js";
import { parseOriginalEvidenceId } from "./original-evidence-id.js";
import * as evidence from "./index.js";

const ORIGINAL = "11111111-1111-4111-8111-111111111111";
const DERIVED = "22222222-2222-4222-8222-222222222222";
const TENANT_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const TENANT_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

describe("evidence immutability", () => {
  it("hashes the same bytes to the same SHA-256", () => {
    const bytes = new TextEncoder().encode("vellum");
    expect(contentHash(bytes)).toBe(contentHash(bytes));
    expect(contentHash(bytes)).toHaveLength(64);
  });

  it("rejects a derived id that replaces the original", () => {
    const original = parseEvidenceId(ORIGINAL);
    const tenant = parseTenantId(TENANT_A);
    expect(original.ok && tenant.ok).toBe(true);
    if (!original.ok || !tenant.ok) return;
    const replaced = linkDerived({
      originalId: original.value,
      derivedId: original.value,
      originalTenantId: tenant.value,
      derivedTenantId: tenant.value,
    });
    expect(replaced.ok).toBe(false);
  });

  it("rejects a cross-tenant derived link and points a valid link at the original", () => {
    const original = parseOriginalEvidenceId(ORIGINAL);
    const derived = parseDerivedEvidenceId(DERIVED);
    const tenantA = parseTenantId(TENANT_A);
    const tenantB = parseTenantId(TENANT_B);
    if (!original.ok || !derived.ok || !tenantA.ok || !tenantB.ok) throw new Error("fixtures");
    const crossed = linkDerived({
      originalId: original.value,
      derivedId: derived.value,
      originalTenantId: tenantA.value,
      derivedTenantId: tenantB.value,
    });
    expect(crossed.ok).toBe(false);
    const linked = linkDerived({
      originalId: original.value,
      derivedId: derived.value,
      originalTenantId: tenantA.value,
      derivedTenantId: tenantA.value,
    });
    expect(linked.ok).toBe(true);
    if (linked.ok) expect(linked.value.originalId).toBe(original.value);
    expect("overwriteOriginal" in evidence).toBe(false);
  });
});
