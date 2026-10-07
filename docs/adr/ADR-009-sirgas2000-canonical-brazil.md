# ADR-009 — SIRGAS 2000 as the Brazil canonical CRS

- Status: accepted
- Date: 2026-10-07

## Context

HD-1 is Brazil-first. Mixing WGS 84 geographic 3D with SIRGAS 2000, or measuring in degrees, corrupts engineering distances and heights.

## Decision

Store Brazil geographic coordinates as SIRGAS 2000: EPSG:4674 when 2D, EPSG:4989 when ellipsoidal height is present. Record source CRS separately. Transform into a project CRS for metric work. Verified project candidates:

- EPSG:31978 UTM 18S, 78°W–72°W
- EPSG:31979 UTM 19S, 72°W–66°W
- EPSG:31980 UTM 20S, 66°W–60°W
- EPSG:31981 UTM 21S, 60°W–54°W
- EPSG:31982 UTM 22S, 54°W–48°W
- EPSG:31983 UTM 23S, Brazil 48°W–42°W
- EPSG:31984 UTM 24S, Brazil 42°W–36°W
- EPSG:31985 UTM 25S, Brazil 36°W–30°W

Each code was read from its own EPSG registry page on 2026-10-07. Critical metric operations are rejected on EPSG:4674, EPSG:4989, and EPSG:4979.

Vertical conversion baseline is hgeoHNOR2020 toward REALT-2018 normal heights. MAPGEO2015 is legacy. Model version and uncertainty are stored. Transformation uses PROJ/PostGIS, not handwritten geodesy.

EPSG:4979 remains the label for WGS 84 geographic 3D inputs. A null TOWGS84 in a WKT file is not treated as engineering identity.

## Alternatives

- Canonical WGS 84 for everything. Rejected for Brazilian engineering and IBGE vertical models.
- Infer UTM codes by adding one to 31978. Rejected; each code is now verified anyway.

## Consequences

Imported GPS tracks need an explicit source-to-canonical transformation record.

## Security impact

Wrong CRS is an integrity failure, tracked as a P0 risk.

## Operational impact

PROJ grid files for hgeoHNOR2020 are versioned artifacts with a hash. They are not embedded as guessed coefficients.

## Revisit trigger

IBGE publishes a successor conversion model, or a non-Brazil project needs another canonical CRS. The four-role model stays.

## Sources

SRC-EPSG-4674 through SRC-EPSG-31985, SRC-IBGE-HGEO.
