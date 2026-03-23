import { describe, expect, it } from "vitest"
import { createRepository } from "../src/index"

describe("repository", () => {
  it("ranks the feed deterministically", async () => {
    const repository = createRepository()
    const feed = await repository.getFeed({
      viewerHandle: "landigf",
      query: "research",
    })

    expect(feed.length).toBeGreaterThan(0)
    expect(feed[0]?.score).toBeGreaterThanOrEqual(feed[1]?.score ?? 0)
  })

  it("keeps blind paper comments anonymous", async () => {
    const repository = createRepository()
    const detail = await repository.getPaperBySlug(
      "blind-submission-demo-agent-evaluation-without-identity-leakage",
    )

    expect(detail?.paper.visibilityMode).toBe("blind")
    expect(detail?.comments.every((comment) => comment.authorProfile === null)).toBe(true)
  })
})
