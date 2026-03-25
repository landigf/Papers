import { resolve } from "node:path"
import { defineConfig } from "vitest/config"

const root = resolve(import.meta.dirname, "../..")

export default defineConfig({
  resolve: {
    alias: {
      "@papers/config": resolve(root, "packages/config/src/index.ts"),
      "@papers/contracts": resolve(root, "packages/contracts/src/index.ts"),
    },
  },
})
