// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["twitter-api-v2"],
  productionBrowserSourceMaps: false,


  webpack: (config, { isServer }) => {
    // Modify the existing Webpack configuration

    // Example: Add a rule to ignore source map files
    config.module.rules.push({
      test: /\.js\.map$/,
      use: 'ignore-loader',
    });

    // Return the modified config
    return config;
  },
};

export default nextConfig;