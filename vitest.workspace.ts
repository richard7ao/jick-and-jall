import { defineWorkspace } from "vitest/config";

// Root Node project (scripts + non-web packages) and the web app project, which
// runs from apps/web with its own jsdom + React config and node_modules.
export default defineWorkspace(["./vitest.config.ts", "./apps/web/vitest.config.ts"]);
