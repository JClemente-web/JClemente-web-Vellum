export type BuildMetadata = { commitSha: string; name: "vellum-api"; schemaVersion: 1 };

export function buildMetadata(env: { VELLUM_COMMIT_SHA?: string }): BuildMetadata {
  return {
    schemaVersion: 1,
    name: "vellum-api",
    commitSha: env.VELLUM_COMMIT_SHA && env.VELLUM_COMMIT_SHA.length > 0 ? env.VELLUM_COMMIT_SHA : "unknown",
  };
}
