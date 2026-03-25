import { resolve } from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: resolve(import.meta.dirname, "../../"),
  basePath: "/papers",
  serverExternalPackages: ["better-auth", "drizzle-orm", "pg"],
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
