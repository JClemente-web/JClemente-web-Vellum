# VELLUM V3 Data Governance

Date: 2026-10-07. HD-2 prefers Brazil residency. This document is not a legal opinion. Critical privacy decisions need specialized human review.

## Classification

- Public: marketing content on `apps/site` after HD-4. Not evidence.
- Internal: operational metadata without direct identifiers, still tenant-scoped.
- Confidential: projects, missions, findings, telemetry, commercial records.
- Restricted: access-control data, secrets, audit internals, legal-hold material.
- Evidence: original and derived capture objects. Originals are logically immutable (ADR-010).
- PersonalData: names, emails, pilot identifiers, signatures, device identifiers, account data.
- SensitivePersonalData: only if a workflow actually collects it (for example health data tied to pilot fitness). V3 does not require that collection. If it appears, it is marked and access-narrowed. Do not infer that RBAC medical details are stored.

Evidence can also be PersonalData when a person is identifiable in media. Classification is the stricter label.

## Roles

- Data owner: Tenant Owner for tenant content; Platform Admin for platform operations data.
- Data steward: Tenant Admin for identity and retention settings inside the owner's policy.
- Processor: the operating company, once named (HD-4). Sub-processors include Supabase and any future model or map provider, recorded before production.
- Region: preferred `sa-east-1` for primary Postgres, Auth, and storage origin (SRC-SUPABASE-REGIONS). CDN cache is global; restricted evidence is not designed for that cache.
- Encryption: in transit via TLS; at rest as provided by the platform. Key management details are NEEDS_VERIFICATION at project creation.

Each dataset records purpose, legal-basis metadata when the workflow needs it, retention, and sharing scope. The software stores the metadata. It does not choose the legal basis.

Access for tenant data goes through the BFF. The tenant is the one authorized from membership, not the one merely sent by the client. The database session for that work is `vellum_app`, and the user and tenant settings last only for the transaction. A missing setting denies the row. This is an architecture rule, not a finding that a live control has been tested.

## DSAR architecture

These are required designs, not running workflows. Together they are the data-subject request architecture. The platform stores the request and the conflict. It does not decide the legal basis.

- Data subject access and export of that subject's personal data, scoped to the tenant.
- Correction of account and profile data. Evidence content is not silently corrected; a correction is a new record that references the original.
- Deletion where legally possible. Legal hold and retention block deletion. The conflict is visible, not ignored.
- Restriction when deletion is not possible.
- Tenant offboarding: export, then delete or hold according to the contract, including backup expiry.
- Account deletion distinct from tenant offboarding.
- Backup expiry aligned to retention. A backup is not a second live database.
- Analytics consent and marketing consent separated.
- Public-site cookie and analytics governance. No analytics tag on the site until the host exists and a consent decision is recorded. Cockpit analytics, if any, are authenticated-product telemetry, not marketing cookies.

## Sharing

External Partner and Client Viewer receive explicit grants. Exports are audited. Cross-tenant sharing does not exist as a default.

## Evidence retention

Retention and legal hold are attributes. Delete of an original checks both. Hash verification is a planned job. None of this is Object Lock.

## Residency caveat

Choosing São Paulo is a location control, not a LGPD compliance certificate (SRC-SUPABASE-REGIONS). Contractual DPA, sub-processor list, backup region, and PITR are NEEDS_VERIFICATION before a productive project is created. This batch creates no instance.
