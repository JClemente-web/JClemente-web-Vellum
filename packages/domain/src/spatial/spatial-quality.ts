export type SpatialQualityFlag = "unchecked";

export type SpatialQuality = {
  crsCode: number;
  quality: SpatialQualityFlag;
};

export function spatialQuality(crsCode: number): SpatialQuality {
  return { crsCode, quality: "unchecked" };
}
