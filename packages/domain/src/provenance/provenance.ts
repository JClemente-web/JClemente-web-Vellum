export const PROVENANCE_METHODS = ["OFFICIAL_SOURCE", "NEEDS_VERIFICATION"] as const;
export type ProvenanceMethod = (typeof PROVENANCE_METHODS)[number];

export type Provenance = {
  sourceRegistryId: string;
  retrievedAt: string;
  method: ProvenanceMethod;
};

export function provenance(input: Provenance): Provenance {
  return { ...input };
}
