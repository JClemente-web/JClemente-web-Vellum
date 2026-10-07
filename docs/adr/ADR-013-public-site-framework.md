# ADR-013 — Public site framework

- Status: accepted
- Date: 2026-10-07

## Context

`apps/site` must emit HTML for public pages, share a few React islands with the design system, and stay isolated from the cockpit bundle. Nothing is installed in this batch. HD-4 still blocks indexable launch.

## Decision

Astro with React islands for `apps/site`.

Reasons: the site is content-first; static HTML is the default; JavaScript ships only for islands; that supports crawlable content and Core Web Vitals; React components can be shared where an island is actually needed; the cockpit remains a separate Vite application; a global React runtime is not required for every page.

## Alternatives

- Next.js static/SSR for the site. Rejected: a second full React framework runtime, easier accidental coupling to server secrets and to cockpit patterns, more JavaScript by default. Next.js would be justified if the public site needed per-request personalization. It does not.
- Eleventy or another non-React SSG. Rejected: no clear gain once React islands are a requirement for shared UI.
- The cockpit's Vite SPA, prerendered. Rejected: the map application would dominate the public bundle.

## Consequences

Public pages are HTML documents plus optional islands. SEO work happens in this app only, and only after HD-4.

## Security impact

The site project does not receive server secrets. Forms post to the BFF or to a dedicated public endpoint with its own abuse controls.

## Operational impact

Astro is not installed until Phase 10 authorization. This ADR is the decision, not the scaffold.

## Revisit trigger

The public site needs authenticated personalization or a server runtime Astro cannot host cleanly.

## Sources

https://astro.build/
https://nextjs.org/
ADR-003.
