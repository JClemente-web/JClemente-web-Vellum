import { z } from "zod";

const FORBIDDEN = ["SERVICE_ROLE", "SECRET", "DATABASE_URL", "SERVICE_KEY"];

export const publicEnvSchema = z.record(z.string(), z.string()).superRefine((value, ctx) => {
  for (const key of Object.keys(value)) {
    if (!key.startsWith("VITE_")) {
      ctx.addIssue({ code: "custom", message: "public keys must start with VITE_" });
    }
    if (FORBIDDEN.some((part) => key.includes(part))) {
      ctx.addIssue({ code: "custom", message: "public keys cannot carry a secret name" });
    }
  }
});
