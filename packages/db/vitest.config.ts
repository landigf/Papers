import path from "node:path"
import { defineConfig } from "vitest/config"

const root = path.resolve(__dirname, "../..")

export default defineConfig({
  resolve: {
    alias: {
      "@papers/contracts": path.join(root, "packages/contracts/src/index.ts"),
      "@papers/config": path.join(root, "packages/config/src/index.ts"),
    },
  },
})
