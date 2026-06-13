import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@accelerator/ai",
    "@accelerator/config",
    "@accelerator/db",
    "@accelerator/ui"
  ]
};

export default nextConfig;
