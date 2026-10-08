import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assertNoPublicSecrets } from "./assert-no-public-secrets.js";
import { publicEnvSchema } from "./public-env.js";
import { secretEnvSchema } from "./secret-env.js";
import { serverEnvSchema } from "./server-env.js";

describe("environment boundaries", () => {
  it("rejects a service role key in the public namespace", () => {
    expect(() => assertNoPublicSecrets({ VITE_SUPABASE_SERVICE_ROLE_KEY: "x" })).toThrow(/secret name/);
    expect(publicEnvSchema.safeParse({ VITE_SUPABASE_SERVICE_ROLE_KEY: "x" }).success).toBe(false);
    expect(publicEnvSchema.safeParse({ DATABASE_URL: "x" }).success).toBe(false);
    expect(publicEnvSchema.safeParse({ VITE_SITE_NAME: "VELLUM" }).success).toBe(true);
    expect(() => assertNoPublicSecrets({ VITE_SITE_NAME: "VELLUM" })).not.toThrow();
  });

  it("requires NODE_ENV and rejects the admin URL in production", () => {
    expect(serverEnvSchema.safeParse({}).success).toBe(false);
    expect(serverEnvSchema.safeParse({ NODE_ENV: "test" }).success).toBe(true);
    expect(serverEnvSchema.safeParse({
      NODE_ENV: "production",
      VELLUM_DEPLOYMENT_TIER: "staging",
      VELLUM_LOCAL_ADMIN_DATABASE_URL: "postgres://local",
    }).success).toBe(false);
    expect(serverEnvSchema.safeParse({
      NODE_ENV: "test",
      VELLUM_DEPLOYMENT_TIER: "production",
      VELLUM_LOCAL_ADMIN_DATABASE_URL: "postgres://prod",
    }).success).toBe(false);
    expect(serverEnvSchema.safeParse({
      NODE_ENV: "test",
      VELLUM_DEPLOYMENT_TIER: "ci",
      VELLUM_LOCAL_ADMIN_DATABASE_URL: "postgres://ci",
    }).success).toBe(true);
  });

  it("keeps the example file free of concrete secrets", () => {
    const example = readFileSync(new URL("../../../../.env.example", import.meta.url), "utf8");
    expect(example).toContain("replace-me");
    expect(example).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}/);
    expect(example).not.toContain("service_role");
    expect(example).not.toContain("local-dev-only");
    expect(example).toContain("LOG_LEVEL=info");
    expect(secretEnvSchema.safeParse({ DATABASE_URL: "replace-me" }).success).toBe(true);
    expect(secretEnvSchema.safeParse({ service_role: "x" }).success).toBe(false);
  });
});
