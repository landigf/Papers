import path from "node:path"
import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  basePath: "/papers",
  output: "standalone",
  outputFileTracingRoot: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."),
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
