import { defineConfig } from "vitest/config";

/**
 * Node project: scripts and non-web packages. The web app runs under its own
 * config (jsdom + React) via the workspace. Emulator-backed tests (tests/rules,
 * tests/integration) run explicitly through the firebase:exec wrapper.
 */
export default defineConfig({
  test: {
    name: "node",
    environment: "node",
    include: ["scripts/**/*.test.{ts,mts}", "packages/**/tests/**/*.test.{ts,mts}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/rules/**",
      "**/tests/integration/**",
      ".worktrees/**",
    ],
  },
});
