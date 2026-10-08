import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./check-boundaries.mjs", import.meta.url));

test("react import in domain fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "vellum-boundary-"));
  const src = join(dir, "packages", "domain", "src");
  mkdirSync(src, { recursive: true });
  writeFileSync(join(src, "bad.ts"), 'import "react";\n');
  const result = spawnSync(process.execPath, [script, dir], { encoding: "utf8" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /forbidden import react/);
});

test("allow comment without a reason fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "vellum-boundary-"));
  const src = join(dir, "packages", "domain", "src");
  mkdirSync(src, { recursive: true });
  writeFileSync(join(src, "note.ts"), "export const n = 1; // vellum-allow:\n");
  const result = spawnSync(process.execPath, [script, dir], { encoding: "utf8" });
  assert.equal(result.status, 1, result.stderr);
});