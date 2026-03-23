import { describe, expect, it } from "vitest"
import { GrokProvider } from "../src/index"

describe("ai safety", () => {
  it("rejects blind content before provider submission", () => {
    const provider = new GrokProvider()

    expect(() =>
      provider.assertSafe({
        task: "summary-refinement",
        isBlindContent: true,
        containsPrivateDraft: false,
        text: "hidden content",
      }),
    ).toThrow(/cannot be sent to Grok/i)
  })
})
