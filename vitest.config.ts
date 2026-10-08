import { defineConfig } from "vitest/config";

const gated = [
  "packages/domain/src/**/*.ts",
  "packages/contracts/src/**/*.ts",
  "packages/auth/src/**/*.ts",
  "packages/gis/src/**/*.ts",
  "packages/evidence/src/**/*.ts",
  "packages/config/src/**/*.ts",
  "packages/events/src/**/*.ts",
];

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "packages/**/*.test.tsx"],
    exclude: ["tests/integration/**", "tests/e2e/**", "node_modules/**", "dist/**"],
    coverage: {
      provider: "v8",
      include: gated,
      exclude: ["**/*.test.ts"],
      thresholds: {
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },
    },
  },
});