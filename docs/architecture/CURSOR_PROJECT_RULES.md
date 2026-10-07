# Cursor project rules — canonical bodies

Date: 2026-10-07.

These bodies are the intended `.cursor/rules/*.mdc` files. Placement into `.mdc` was blocked because the session could only write Markdown. `AGENTS.md` already carries the invariants. Do not treat this file as loaded Cursor rules until the `.mdc` files exist.

## 00-vellum-core.mdc

alwaysApply: true

This repository is VELLUM OS only. Never open, copy, or depend on STRIX. Build mode is greenfield. Judge work against the canonical operational loop. Follow the ADRs and the final spec. Never fabricate PASS. Do not start Phase 0 without a separate human authorization.

## 10-security.mdc

alwaysApply: true

No service role, secret key, or AI key in frontend or PUBLIC env. Browser Data API is deny-by-default. service_role is server-only for named privileged work. The BFF connects as vellum_app, not as a superuser or bypass role. Authorize membership in the BFF before trusting a tenant. RLS context is transaction-local and fails closed when missing. Tenant isolation covers query, API, Realtime, storage, signed URL, search, export, cache, offline sync, and Copilot. Do not authorize from editable user_metadata. Original evidence is logically immutable, not automatically WORM.

## 20-frontend-design.mdc

globs: apps/web, apps/field, packages/ui

Desktop-first dense cockpit. Deep black, graphite, warm ivory, off-white, beige. No gratuitous glass, decorative gradients, or generic AI-SaaS cards. Zero-pill static metadata. Tabular numerals. Semantic tokens. Full UX states, and a skeleton is not an error. Field Companion is a separate surface.

## 30-domain.mdc

globs: packages/domain, packages/evidence, packages/contracts

No monolithic types.ts. Executed is not resolved. Draft report is not approved. Derived evidence does not replace the original. Critical findings need evidence ids. UTC persistence with distinct event, device, GNSS, and ingest times. Do not hardcode RBAC-E nº 94 as current law or SORA as a legal requirement.

## 40-gis.mdc

globs: packages/gis, apps/web

Four CRS roles. Brazil canonical geographic CRS is SIRGAS 2000, EPSG:4674 or EPSG:4989. EPSG:4979 is WGS 84. Metric work uses verified UTM codes EPSG:31978 through EPSG:31985. Ellipsoidal height is not normal height. hgeoHNOR2020 targets REALT-2018. MAPGEO2015 is legacy. Cesium and Potree are lazy and license-checked.

## 50-supabase.mdc

globs: supabase, apps/api

Grants are not RLS. Explicit grants, tenant USING and WITH CHECK, FORCE RLS on tenant tables, no SECURITY DEFINER as a shortcut. Versioned migrations do not create roles or embed passwords. vellum_app is the BFF login. Supabase anon, authenticated, and service_role are the Data API model and are not copied into Phase 0. Publishable key in the browser. Prefer sa-east-1 and re-check PITR before creating a project. Private evidence is not designed for the global storage CDN.

## 60-testing.mdc

globs: tests and test files

Failing invariant tests come first for domain-critical behavior. No coverage theater. Tenant A must fail to read Tenant B. Coverage figures come from the tool or are NOT APPLICABLE.

## 70-ai-safety.mdc

alwaysApply: true

No flight-control tools. Tool classes are READ_ONLY, DRAFT, HUMAN_CONFIRMATION_REQUIRED, PROHIBITED_TO_AI. No raw SQL tool. Persist provenance. Model changes need evals.

## 80-seo-public-site.mdc

globs: apps/site, docs/seo

SEO is public-only. noindex and sitemap exclusion for the product. robots.txt is not security or deindexing. No invented volumes or rankings. No indexable page before the legal name and canonical host. llms.txt is not a Google ranking strategy.

## 90-git-delivery.mdc

alwaysApply: true

main is protected. No force-push. npm and package-lock.json only. No secrets in commits. Do not open implementation issues from documentation work.
