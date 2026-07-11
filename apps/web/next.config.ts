import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @jj/shared is a workspace TS package consumed directly.
  transpilePackages: ["@jj/shared"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
