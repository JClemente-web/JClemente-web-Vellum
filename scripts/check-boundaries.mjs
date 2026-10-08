import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SOURCE = [".ts", ".tsx", ".mjs", ".astro"];

const BANNED = [
  { prefix: "packages/domain", tokens: ["react", "@supabase/", "fastify", "node:fs", "node:http", "zod"] },
  { prefix: "packages/contracts", tokens: ["react", "@supabase/", "fastify", "node:fs", "node:http"] },
  { prefix: "packages/auth", tokens: ["react", "@supabase/", "fastify", "node:fs", "node:http"] },
  { prefix: "packages/gis", tokens: ["react", "proj4", "@proj4js"] },
  { prefix: "packages/events", tokens: ["kafkajs", "amqplib", "nats", "@aws-sdk/client-sqs"] },
  { prefix: "packages/evidence", tokens: ["react", "@supabase/", "@aws-sdk/client-s3"] },
  { prefix: "packages/config", tokens: ["react"] },
  { prefix: "packages/observability", tokens: ["@opentelemetry/sdk-node", "@sentry/"] },
  { prefix: "apps/api", tokens: ["apps/web", "apps/site"] },
  { prefix: "apps/web", tokens: ["secret-env", "service_role", "VELLUM_LOCAL_DB_PASSWORD", "@vellum/evidence"] },
  { prefix: "apps/site", tokens: ["secret-env", "service_role", "VELLUM_LOCAL_DB_PASSWORD", "apps/web"] },
];

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === "coverage") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (SOURCE.some((ext) => name.endsWith(ext))) out.push(full);
  }
}

export function findBoundaryViolations(root) {
  const files = [];
  walk(root, files);
  const violations = [];
  for (const file of files) {
    const rel = relative(root, file).replaceAll("\\", "/");
    const text = readFileSync(file, "utf8");
    for (const line of text.split(/\r?\n/)) {
      if (line.includes("vellum-allow:") && !/vellum-allow:\s+\S+/.test(line)) {
        violations.push(`${rel}: vellum-allow requires a reason`);
      }
    }
    const rule = BANNED.find((item) => rel.startsWith(item.prefix + "/") || rel.startsWith(item.prefix));
    if (!rule) continue;
    const specifiers = [...text.matchAll(/from\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']|import\s+["']([^"']+)["']/g)]
      .map((match) => match[1] ?? match[2] ?? match[3] ?? "");
    for (const spec of specifiers) {
      for (const token of rule.tokens) {
        if (spec === token || spec.startsWith(token)) violations.push(`${rel}: forbidden import ${spec}`);
      }
    }
    if (rel.startsWith("apps/web") || rel.startsWith("apps/site")) {
      for (const token of rule.tokens) {
        if (text.includes(token)) violations.push(`${rel}: forbidden reference ${token}`);
      }
    }
  }
  return violations;
}

if (process.argv[1]?.endsWith("check-boundaries.mjs")) {
  const found = findBoundaryViolations(process.argv[2] ?? process.cwd());
  if (found.length > 0) {
    console.error(found.join("\n"));
    process.exit(1);
  }
}
