# ADR-011 — No AGPL or GPL code in the proprietary core

- Status: accepted
- Date: 2026-10-07

## Context

HD-3 forbids copying or incorporating AGPL/GPL code into the proprietary core without explicit legal approval.

## Decision

OpenDroneMap, NodeODM, ClusterODM, and QField are research and external-adapter references only. QGroundControl is reference only (dual Apache-2.0 / GPL-3.0, Qt-coupled). GeoNode is GPL and is not imported. The MAVLink generator repository is LGPL-3.0 and is not vendored; an adapter may speak the protocol after the generated artifact's license is reviewed. PotreeConverter 2.0 is not vendored. CesiumJS (Apache-2.0) and the Potree viewer file retrieved as BSD-2-Clause may be considered later as pinned lazy dependencies, with notices recorded first.

Photogrammetry is a processing-plane adapter to an external engine. The proprietary repo does not contain those codebases.

## Alternatives

- Vendor ODM for convenience. Rejected under HD-3.
- Ignore licenses until Phase 9. Rejected: the boundary is cheaper to set now.

## Consequences

Orthomosaics and point-cloud conversion depend on a legally permitted external service or a permissive library reviewed at that phase.

## Security impact

Supply-chain scope stays inside declared dependencies.

## Operational impact

An OSS inventory check fails the build if an AGPL/GPL package is added without a legal-approval record. That check arrives with Phase 0, not in this batch.

## Revisit trigger

Written legal approval for a specific component, naming version and distribution model.

## Sources

SRC-ODM, SRC-QFIELD, SRC-QGC, SRC-MAVLINK, SRC-GEONODE, SRC-CESIUM, SRC-POTREE. HD-3.
