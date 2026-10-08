import { z } from "zod";

export const apiErrorV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    code: z.string().min(1),
    message: z.string().min(1),
    correlationId: z.string().min(1),
  })
  .strict();

export type ApiErrorV1 = z.infer<typeof apiErrorV1Schema>;
