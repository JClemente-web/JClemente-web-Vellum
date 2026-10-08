import { domainError, type DomainError } from "@vellum/domain";
import { err, ok, type Result } from "@vellum/domain";
import { crsKind } from "./crs-kind.js";

export function assertMetricCrs(code: number): Result<number, DomainError> {
  const kind = crsKind(code);
  if (kind === "geographic") {
    return err(domainError("metric_crs_rejected", "critical metric operation denied on a geographic CRS"));
  }
  if (kind === "projected") return ok(code);
  return err(domainError("crs_not_verified", "CRS is not in the verified projected set"));
}
