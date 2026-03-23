import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: false,
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
