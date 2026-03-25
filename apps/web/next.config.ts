import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  basePath: "/papers",
  output: "standalone",

  transpilePackages: [
    "@papers/ai",
    "@papers/auth",
    "@papers/config",
    "@papers/contracts",
    "@papers/db",
    "@papers/ui",
  ],
}

export default nextConfig
