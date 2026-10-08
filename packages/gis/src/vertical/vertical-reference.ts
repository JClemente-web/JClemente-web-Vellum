export const VERTICAL_REFERENCES = {
  hgeoHNOR2020: { role: "baseline" },
  "REALT-2018": { role: "baseline" },
  MAPGEO2015: { role: "legacy" },
} as const;

export type VerticalReferenceName = keyof typeof VERTICAL_REFERENCES;