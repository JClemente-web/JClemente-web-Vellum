import { describe, expect, it } from "vitest";
import { EPSG_4674, EPSG_4979, EPSG_4989, EPSG_31984 } from "./epsg-codes.js";
import { crsKind } from "./crs-kind.js";
import { assertMetricCrs } from "./metric-guard.js";
import { isSirgas2000 } from "./distinctions.js";
import * as gis from "../index.js";

describe("CRS distinctions", () => {
  it("keeps SIRGAS 2000 distinct from WGS 84 geographic 3D", () => {
    expect(EPSG_4674).not.toBe(EPSG_4989);
    expect(EPSG_4979).not.toBe(EPSG_4674);
    expect(EPSG_4979).not.toBe(EPSG_4989);
    expect(isSirgas2000(4979)).toBe(false);
    expect(isSirgas2000(4674)).toBe(true);
    expect(isSirgas2000(4989)).toBe(true);
    expect("SIRGAS2000" === String(EPSG_4979)).toBe(false);
  });

  it("denies geographic CRS for critical metrics and accepts verified projected CRS", () => {
    expect(crsKind(4674)).toBe("geographic");
    expect(crsKind(31984)).toBe("projected");
    expect(crsKind(4326)).toBe("unverified");
    const denied = assertMetricCrs(4979);
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error.code).toBe("metric_crs_rejected");
    const allowed = assertMetricCrs(31984);
    expect(allowed.ok).toBe(true);
    const unknown = assertMetricCrs(4326);
    expect(unknown.ok).toBe(false);
    if (!unknown.ok) expect(unknown.error.code).toBe("crs_not_verified");
  });

  it("does not export a transform", () => {
    expect("transform" in gis).toBe(false);
    expect("stTransform" in gis).toBe(false);
    expect("convertHeight" in gis).toBe(false);
    expect(gis.VERTICAL_REFERENCES.MAPGEO2015.role).toBe("legacy");
    expect(gis.VERTICAL_REFERENCES.hgeoHNOR2020.role).toBe("baseline");
  });
});
