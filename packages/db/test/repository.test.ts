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

  it("boosts papers from followed authors in the feed", async () => {
    const repository = createRepository()
    const feed = await repository.getFeed({ viewerHandle: "landigf" })

    // Gennaro follows Maya, so Maya's papers should have the follow reason
    const mayaPaper = feed.find((entry) => entry.paper.title.includes("Evaluation Traces"))
    expect(mayaPaper?.reasons).toContain("from someone you follow")
  })

  it("returns recommendations based on follows and co-stars", async () => {
    const repository = createRepository()
    const recommendations = await repository.getRecommendations("landigf")

    expect(recommendations.length).toBeGreaterThan(0)
    // Recommendations should have explainable reasons
    for (const entry of recommendations) {
      expect(entry.reasons.length).toBeGreaterThan(0)
      expect(entry.score).toBeGreaterThan(0)
    }
    // Should be sorted by score descending
    for (let i = 1; i < recommendations.length; i++) {
      expect(recommendations[i - 1]!.score).toBeGreaterThanOrEqual(recommendations[i]!.score)
    }
  })

  it("excludes viewer-authored and viewer-starred papers from recommendations", async () => {
    const repository = createRepository()
    const recommendations = await repository.getRecommendations("landigf")

    // Gennaro authored paper_public_1 and starred paper_public_2 and paper_public_3
    for (const entry of recommendations) {
      expect(entry.paper.title).not.toContain("Research Should Feel Collaborative")
    }
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
