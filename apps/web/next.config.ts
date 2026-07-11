import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// Repo root (two levels up from apps/web) — pins the workspace root so builds
// don't accidentally infer it from an unrelated lockfile higher up the tree.
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: repoRoot },
  // @jj/shared is consumed directly as TS; other @jj/* packages ship built dist.
  transpilePackages: ["@jj/shared"],
  // firebase-admin is a native/server-only dependency; keep it external.
  serverExternalPackages: ["firebase-admin"],
  typedRoutes: true,
};

export default nextConfig;
