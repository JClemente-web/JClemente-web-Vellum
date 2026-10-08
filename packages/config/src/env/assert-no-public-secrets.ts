const FORBIDDEN = ["SERVICE_ROLE", "SECRET", "DATABASE_URL", "SERVICE_KEY", "VELLUM_LOCAL_DB_PASSWORD"];

export function assertNoPublicSecrets(env: Record<string, string>): void {
  for (const key of Object.keys(env)) {
    if (FORBIDDEN.some((part) => key.includes(part))) {
      throw new Error("public environment cannot carry a secret name");
    }
  }
}
