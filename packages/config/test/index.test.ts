import { describe, expect, it } from "vitest"
import { getPapersConfig } from "../src/index"

describe("config", () => {
  it("defaults to demo mode without a database", () => {
    const config = getPapersConfig({})
    expect(config.PAPERS_USE_DEMO_DATA).toBe(true)
  })

  it("disables demo mode once a database url is configured", () => {
    const config = getPapersConfig({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/papers",
    })
    expect(config.PAPERS_USE_DEMO_DATA).toBe(false)
  })
})
