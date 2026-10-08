import { existsSync } from "node:fs";
import { resolve } from "node:path";

const FORBIDDEN = ["bun.lock", "bun.lockb", "pnpm-lock.yaml", "yarn.lock"];

export function findForbiddenLockfiles(root) {
  return FORBIDDEN.filter((name) => existsSync(resolve(root, name)));
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve("scripts/check-lockfiles.mjs")
  || process.argv[1]?.endsWith("check-lockfiles.mjs");

if (invokedDirectly) {
  const root = process.argv[2] ?? process.cwd();
  const found = findForbiddenLockfiles(root);
  if (found.length > 0) {
    console.error(`forbidden lockfiles: ${found.join(", ")}`);
    process.exit(1);
  }
}
