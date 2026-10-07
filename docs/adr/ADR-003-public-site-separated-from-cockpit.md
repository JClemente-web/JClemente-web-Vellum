# ADR-003 — Public site separated from the cockpit

- Status: accepted
- Date: 2026-10-07

## Context

Search documents and an authenticated operational product have different rendering, security, and performance needs.

## Decision

`apps/site` is the public experience. `apps/web` is the cockpit. `apps/field` is the field companion. The client portal is an authenticated published-data surface, not a reduced cockpit. Design tokens may be shared. JavaScript bundles are not. Cockpit, field, and portal responses are `noindex` and are omitted from sitemaps. Authentication is the access control. robots.txt is not.

No indexable public page ships before the legal name and canonical host (HD-4).

## Alternatives

- One host and one SPA for everything. Rejected: private routes leak into indexes more easily, and the map bundle taxes public pages.
- Separate git repositories. Rejected in ADR-002.

## Consequences

Two render pipelines. Staging uses a non-canonical host and `noindex`.

## Security impact

Private URLs are not treated as SEO assets.

## Operational impact

Site releases can move without redeploying the cockpit.

## Revisit trigger

A legal name and canonical host exist, at Phase 10.

## Sources

SRC-GOOGLE-NOINDEX, SRC-GOOGLE-ROBOTS, SRC-GOOGLE-SITEMAP. HD-4.
