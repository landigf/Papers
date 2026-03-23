import { defineConfig } from "@trigger.dev/sdk"

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "papers-dev",
  dirs: ["./apps/web/trigger"],
  runtime: "node-22",
})
