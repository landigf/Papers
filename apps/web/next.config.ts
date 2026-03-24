import { resolve } from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve(import.meta.dirname, "../../"),
  ...(process.env.NEXT_OUTPUT_STANDALONE === "1" && {
    output: "standalone" as const,
  }),
  basePath: "/papers",
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
