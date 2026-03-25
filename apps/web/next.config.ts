import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  basePath: "/papers",
  transpilePackages: [
    "@papers/ai",
    "@papers/auth",
    "@papers/config",
    "@papers/contracts",
    "@papers/db",
    "@papers/ui",
  ],
  serverExternalPackages: ["better-auth", "drizzle-orm", "pg"],
}

export default nextConfig
