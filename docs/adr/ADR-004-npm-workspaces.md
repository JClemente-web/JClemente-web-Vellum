# ADR-004 — npm workspaces

- Status: accepted
- Date: 2026-10-07

## Context

The repo will hold several apps and packages. A second package manager or a task orchestrator adds supply chain and configuration before there is code.

## Decision

npm workspaces and a single root `package-lock.json`. Phase 0 does not add Turborepo or Nx. CI fails if `bun.lock`, `bun.lockb`, `pnpm-lock.yaml`, or `yarn.lock` appears.

Reconsider a task graph only when CI time, package count, or cache need is measured.

## Alternatives

- Turborepo. Deferred: useful cache and pipeline, unnecessary until the workspace is large.
- Nx. Deferred: stronger graph and generators, heavier default.
- pnpm. Rejected for this baseline: the project standard is npm.

## Consequences

Install and script surface stay small. Task orchestration is manual at first.

## Security impact

Fewer generated plugins and remote cache credentials.

## Operational impact

`npm ci` is the reproducible install once a lockfile exists. This ADR does not run that install.

## Revisit trigger

CI duration or workspace count makes plain scripts the bottleneck, with measurements attached.

## Sources

https://docs.npmjs.com/cli/using-npm/workspaces
https://turbo.build/repo
https://nx.dev/
