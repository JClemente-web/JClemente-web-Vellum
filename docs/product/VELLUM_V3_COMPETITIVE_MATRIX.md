# VELLUM V3 Competitive Matrix

Date: 2026-10-07. No UI, code, or copy is taken from these products. Code entry is NO unless ADR-011 says otherwise.

## DroneDeploy

- Primary market: site capture and mapping programs. OFFICIAL_SOURCE: SRC-DRONEDEPLOY.
- Core job: fly, process, measure, export.
- Lesson: one path from capture to deliverable, hardware-agnostic processing claims.
- VELLUM equivalent: capture through verification, not a photogrammetry engine in V3.
- Differentiator: custody and executed versus verified.
- Gap: processing engine. Priority: after evidence. CODE_ENTRY: NO.

## FlytBase

- Primary market: multi-site dock operations. OFFICIAL_SOURCE: SRC-FLYBASE.
- Lesson: mixed fleets and data residency are architecture concerns.
- VELLUM: multi-vehicle data model without giving flight authority to AI. Residency: ADR-005.
- Gap: dock autonomy. Priority: FUTURE. CODE_ENTRY: NO.

## PIX4Dcloud

- OFFICIAL_SOURCE: SRC-PIX4D.
- Lesson: timeline and design-versus-reality overlays.
- VELLUM: temporal GIS and composite reality with visible data age.
- Gap: their processing stack. Priority: V3.1 adapter. CODE_ENTRY: NO.

## Skydio

- OFFICIAL_SOURCE: SRC-SKYDIO.
- Lesson: work can be organized around the asset.
- VELLUM: operational twin. Adapter later. Do not couple the domain to the vendor. CODE_ENTRY: NO.

## Aloft

- OFFICIAL_SOURCE: SRC-ALOFT.
- Lesson: authorization is a record, not a boolean. The product is a US LAANC path.
- VELLUM: Brazilian authorization records (ANAC/DECEA). Do not copy LAANC. CODE_ENTRY: NO.

## Propeller

- INFERRED from a third-party comparison (SRC-PROPELLER). Official product page not retrieved.
- Lesson, if the third-party description holds: metric volumes need a projected CRS.
- Priority: V3.1. CODE_ENTRY: NO.

## QGroundControl

- OFFICIAL_SOURCE: SRC-QGC. Dual Apache-2.0 / GPL-3.0, Qt-coupled.
- Lesson: MAVLink mission planning exists. Reference only. CODE_ENTRY: NO.

## MAVLink

- OFFICIAL_SOURCE: SRC-MAVLINK. Generator is LGPL-3.0. Generated-code license must be re-read for the pinned artifact.
- Lesson: canonical telemetry adapter, not a DJI domain model.
- CODE_ENTRY: NO in this baseline.

## ArcGIS Online and Field Maps

- NEEDS_VERIFICATION: product HTML was not retrieved (SRC-ARCGIS).
- License: commercial. CODE_ENTRY: NO.
- Lesson carried as INFERRED industry practice only: offline field forms and web GIS sync. Not used as a verified capability claim.

## GeoNode

- OFFICIAL_SOURCE: SRC-GEONODE. GPL-2.0-or-later.
- Lesson: layers have metadata and permissions.
- CODE_ENTRY: NO.

## MapStore

- OFFICIAL_SOURCE: SRC-MAPSTORE. Simplified BSD per README.
- Lesson: a layer catalog can sit on standard map engines.
- CODE_ENTRY: NO. Not adopted as a dependency.

## Kepler.gl

- NEEDS_VERIFICATION: MIT was seen on a fork, not the canonical LICENSE file (SRC-KEPLER).
- Lesson: large-scale visual exploration is not an evidence system.
- VELLUM uses deck.gl directly. CODE_ENTRY: NO.

## CesiumJS

- OFFICIAL_SOURCE: SRC-CESIUM. Apache-2.0.
- Lesson: globe, terrain, 3D Tiles, lazy loaded.
- CODE_ENTRY: later, pinned, with notices. Not in the initial bundle.

## Potree

- OFFICIAL_SOURCE: viewer LICENSE on `develop` is BSD-2-clause (SRC-POTREE).
- Converter 2.0 is a different, non-OSS draft in the linked issue. CODE_ENTRY: NO for that converter.
- Viewer: lazy, after a pinned notice check.

## OpenDroneMap, NodeODM, QField

- AGPL-3.0 and GPL-2.0-or-later respectively.
- REFERENCE ONLY. CODE_ENTRY: NO (ADR-011).
