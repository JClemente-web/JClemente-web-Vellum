# ADR-010 — Logical evidence immutability

- Status: accepted
- Date: 2026-10-07

## Context

Original evidence must not be silently replaced by a derivative. Calling that property "WORM" overclaims what Supabase Storage has been shown to provide.

## Decision

V3 original evidence has logical immutability:

- permanent object id
- SHA-256 recorded at ingest
- no overwrite and no content UPDATE
- a derivative is a new object that references the original
- deletion is allowed only when retention and legal hold permit it, and the delete is audited
- access and export are audited
- a periodic hash verification job is part of the design, not a promise that it already runs

Legal WORM, Object Lock, and retention lock are a separate future infrastructure capability. They are documented only after the storage system demonstrates them. Customer language must not say WORM until that demonstration exists.

## Alternatives

- Assume bucket versioning equals legal immutability. Rejected: versioning still allows privileged delete.
- Defer all immutability. Rejected: the domain invariant is required now.

## Consequences

Application policies and database constraints enforce the logical rule. Storage configuration is necessary and not sufficient for a legal hold claim.

## Security impact

Prevents silent replacement. Does not, by itself, stop a privileged cloud operator.

## Operational impact

Retention, legal hold, and offboarding procedures live in the data-governance document.

## Revisit trigger

A regulated customer requires Object Lock. That work is a storage capability project with a restore and lock test.

## Sources

Final spec. ADR-005. Data governance document.
