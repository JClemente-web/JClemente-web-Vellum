import { z } from "zod";

export const secretEnvSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  VELLUM_LOCAL_DB_PASSWORD: z.string().min(1).optional(),
}).strict();
