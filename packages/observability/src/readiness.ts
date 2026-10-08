export type ReadinessCheck = { name: string; status: "ready" | "not_ready" | "not_configured" | "down" };
export type ReadinessDto = { status: "ready" | "not_ready"; checks: ReadinessCheck[] };

export function readinessDto(checks: ReadinessCheck[]): ReadinessDto {
  const ready = checks.every((check) => check.status === "ready");
  return { status: ready ? "ready" : "not_ready", checks };
}
