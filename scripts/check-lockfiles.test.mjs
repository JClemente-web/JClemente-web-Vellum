import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./check-lockfiles.mjs", import.meta.url));

test("foreign lockfile fails the gate", () => {
  const dir = mkdtempSync(join(tmpdir(), "vellum-lock-"));
  writeFileSync(join(dir, "pnpm-lock.yaml"), "lockfileVersion: 9\n");
  const result = spawnSync(process.execPath, [script, dir], { encoding: "utf8" });
  assert.equal(result.status, 1, result.stderr);
});

test("clean directory passes", () => {
  const dir = mkdtempSync(join(tmpdir(), "vellum-lock-"));
  const result = spawnSync(process.execPath, [script, dir], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});
