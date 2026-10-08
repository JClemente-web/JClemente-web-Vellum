import { z } from "zod";

export const serverEnvSchema = z.object({
  NODE_ENV: z.string().min(1),
  DATABASE_URL: z.string().min(1).optional(),
  VELLUM_DEPLOYMENT_TIER: z.enum(["local", "ci", "staging", "production"]).default("local"),
  VELLUM_LOCAL_ADMIN_DATABASE_URL: z.string().min(1).optional(),
  LOG_LEVEL: z.string().min(1).optional(),
}).superRefine((value, ctx) => {
  const tier = value.VELLUM_DEPLOYMENT_TIER;
  if ((tier === "staging" || tier === "production") && value.VELLUM_LOCAL_ADMIN_DATABASE_URL !== undefined) {
    ctx.addIssue({ code: "custom", message: "local admin database URL is rejected outside local and ci" });
  }
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
