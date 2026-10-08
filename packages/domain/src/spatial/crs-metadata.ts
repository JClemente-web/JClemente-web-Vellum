export const CRS_KINDS = ["geographic", "projected", "vertical"] as const;
export type CrsKind = (typeof CRS_KINDS)[number];

export type CrsMetadata = {
  epsg: number;
  kind: CrsKind;
};

export function crsMetadata(epsg: number, kind: CrsKind): CrsMetadata {
  return { epsg, kind };
}
