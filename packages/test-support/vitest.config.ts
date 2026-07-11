import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unlike the repo root config, this package intentionally includes the
    // emulator-backed rules tests; they are run via the firebase:exec wrapper.
    exclude: ["**/node_modules/**", "**/dist/**"],
    // Rules tests connect to a live emulator; give them room to start.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
