import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Rules tests require a running Firebase emulator and are run explicitly via
    // `pnpm firebase:exec -- pnpm --filter @jj/test-support test:rules`.
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/rules/**",
      "**/tests/integration/**",
      ".worktrees/**",
    ],
  },
});
