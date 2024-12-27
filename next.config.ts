// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["twitter-api-v2"],
  productionBrowserSourceMaps: false,
}

export default nextConfig;