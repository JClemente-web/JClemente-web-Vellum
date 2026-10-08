export const SORA_STATUS = "NOT_CONFIRMED" as const;
export const ICA_100_40_ARTICLE_RULES = "NOT_INGESTED" as const;
export const ICA_100_48_ARTICLE_RULES = "NOT_INGESTED" as const;

export type RegulatoryVersion = {
  authorityCode: string;
  instrumentId: string;
  sourceRegistryId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
};
