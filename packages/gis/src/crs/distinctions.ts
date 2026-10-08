import { EPSG_4674, EPSG_4989 } from "./epsg-codes.js";

export function isSirgas2000(code: number): boolean {
  return code === EPSG_4674 || code === EPSG_4989;
}