import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @jj/shared is consumed directly as TS; other @jj/* packages ship built dist.
  transpilePackages: ["@jj/shared"],
  // firebase-admin is a native/server-only dependency; keep it external.
  serverExternalPackages: ["firebase-admin"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
