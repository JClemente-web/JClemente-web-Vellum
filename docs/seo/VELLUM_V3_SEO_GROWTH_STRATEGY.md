# VELLUM V3 SEO and Growth Strategy

Date: 2026-10-07. Applies only to the public site. HD-4 defers legal name and canonical host. No indexable page is launched before that.

## Funnel

Diagnose the first broken layer. Do not call every failure SEO.

discover → crawl → render → index → canonicalize → rank → impression → click → engage → convert

## Surfaces

Public, later: `apps/site`, Astro HTML (ADR-013).

Excluded: `/app`, projects, assets, missions, findings, actions, copilot, field companion, client portal. Those require authentication, send `noindex` (meta and `X-Robots-Tag` where the response is not HTML), and never enter the sitemap. A login shell that must carry `noindex` is not disallowed in robots.txt, because Google has to read the directive (SRC-GOOGLE-NOINDEX, SRC-GOOGLE-ROBOTS).

robots.txt is crawl control. It is not deindexing and not security.

## Technical SEO

When a public host exists: one canonical host, HTTPS, consistent status codes, HTML that contains the primary content without depending on client render, crawlable `a href` links, staging on a non-canonical host with `noindex`. SPA versus SSR is not, by itself, an indexability verdict. The public app is chosen so the first response can contain the content.

## Sitemaps

Include only canonical, indexable, HTTP 200, public, useful URLs. Exclude private app, redirects, 4xx, 5xx, `noindex`, duplicates, staging, and parameter variants. Submission is a hint (SRC-GOOGLE-SITEMAP).

## Metadata and social

For each important public URL, when it exists: unique title, specific description, canonical, robots directive, H1 aligned with the visible content, favicon, `og:title`, `og:type`, `og:image`, `og:url`, `og:description`. None of these promise ranking or an exact preview.

## Structured data

Only for visible content. Candidates: Organization, WebSite, SoftwareApplication, BreadcrumbList, and Article, Dataset, or VideoObject when that object is actually on the page. Schema.org support is not a rich-result promise. Do not invent ratings, reviews, prices, availability, authors, or dates. Do not add FAQPage to chase a FAQ treatment.

## Internal linking

Home to a solution hub to a use case, plus sibling and breadcrumb links, when those pages exist. No artificial mega-footer. Initial public set after HD-4 is small: home, platform, security, contact. Further URLs need intent evidence. No keyword volume is claimed.

## Programmatic SEO

Off in V3. A template family becomes indexable only with real intent, unique value, page-specific data, a quality gate, canonical rules, internal discovery, measurement, and a stop condition for thin pages.

## AI-search visibility

Prefer original information, crawlable structure, real media, accurate structured data, and a clear entity once the legal name exists. `llms.txt` is not a Google ranking strategy. If a file is published for other consumers, it is labeled as that and not as SEO.

## Measurement

eligible URLs → indexed URLs → impressions → clicks → engaged sessions → activation → lead → conversion → retention.

Future integration points: Search Console, analytics, conversion events. No data is invented. Success is not page count.

## Experiments

Each experiment records hypothesis, cohort, change, primary metric, guardrail, window, and confounders. A rise after a change is not automatically causal.

## Current evidence state

OBSERVED: Google's distinction between robots.txt, noindex, and sitemaps, cited in the source registry.
INFERRED: Astro static HTML will make the render layer easier than a cockpit SPA. That is a design judgment (ADR-013), not a ranking claim.
NEEDS_VERIFICATION: any query demand, index coverage, or conversion rate. There is no site and no Search Console property.
EXPERIMENT: none. There is nothing to test.
