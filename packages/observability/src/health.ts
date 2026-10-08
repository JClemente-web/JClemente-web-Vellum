export type HealthDto = { status: "ok" };

export function healthDto(): HealthDto {
  return { status: "ok" };
}
