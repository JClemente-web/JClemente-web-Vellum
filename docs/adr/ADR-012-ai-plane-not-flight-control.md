# ADR-012 — AI plane is not the flight-control plane

- Status: accepted
- Date: 2026-10-07

## Context

Copilot will see missions, maps, and evidence. Flight control is safety-critical. RBAC 100.19(c) requires that remote-pilot intervention remain possible during normal operation, and 100.23(b) limits one pilot to one UA unless ANAC authorizes otherwise. Those clauses are operational rules, not an AI statute. They still argue against an automated actuator.

## Decision

The AI plane has no direct authority over arm, takeoff, land, return-to-launch, setpoints, or geofence writes. Those tools are PROHIBITED_TO_AI. Other tools are READ_ONLY, DRAFT, or HUMAN_CONFIRMATION_REQUIRED. There is no raw SQL tool and no universal database tool. Operational conclusions store model, version, prompt version, tool calls, evidence ids, time, and human review when the output affects a decision.

Model changes require an evaluation record: golden data, regression, tool use, retrieval, and cross-tenant leakage. Appearance is not a promotion criterion.

## Alternatives

- Let the model call the same BFF routes as a pilot. Rejected: excessive agency.
- Ban Copilot. Rejected: draft summaries and navigation are in scope if policy-gated.

## Consequences

Flight software, if it ever exists, is a separate control-plane integration with a human. V3 does not build that actuator.

## Security impact

Prompt injection cannot become a flight command through a VELLUM tool. It can still bias a draft; drafts are labeled.

## Operational impact

Compliance answers from the model are not the compliance decision.

## Revisit trigger

A human-confirmed ground-planning aid is proposed. Even then, uplink to the aircraft stays outside the AI plane.

## Sources

SRC-ANAC-RBAC100-HTML sections 100.19(c) and 100.23(b). Final spec.
