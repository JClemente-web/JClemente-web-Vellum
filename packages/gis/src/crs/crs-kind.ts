import { VERIFIED_GEOGRAPHIC, VERIFIED_PROJECTED } from "./epsg-codes.js";

export type CrsKindName = "geographic" | "projected" | "unverified";

export function crsKind(code: number): CrsKindName {
  if ((VERIFIED_GEOGRAPHIC as readonly number[]).includes(code)) return "geographic";
  if ((VERIFIED_PROJECTED as readonly number[]).includes(code)) return "projected";
  return "unverified";
}
