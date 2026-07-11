import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appDir = dirname(fileURLToPath(import.meta.url));
// The pnpm monorepo root (two levels up from apps/web) holds the hoisted
// node_modules and the bilingual `content/` dictionaries.
const repoRoot = resolve(appDir, "..", "..");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: repoRoot,
  },
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
