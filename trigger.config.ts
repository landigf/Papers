import { defineConfig } from "@trigger.dev/sdk"

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "papers-dev",
  dirs: ["./apps/web/trigger"],
  runtime: "node-22",
  retries: {
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1_000,
      maxTimeoutInMs: 30_000,
      randomize: true,
    },
  },
})
