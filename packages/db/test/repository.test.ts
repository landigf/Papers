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

  it("searches papers by query text", async () => {
    const repository = createRepository()
    const result = await repository.searchPapers({ query: "blind" }, "landigf")

    expect(result.entries.length).toBeGreaterThan(0)
    expect(result.total).toBe(result.entries.length)
    expect(result.appliedSort).toBe("relevance")
    expect(result.availableTopics.length).toBeGreaterThan(0)
  })

  it("filters papers by topic slug", async () => {
    const repository = createRepository()
    const result = await repository.searchPapers(
      { filters: { topicSlugs: ["fuzzy-logic"] } },
      "landigf",
    )

    expect(result.entries.length).toBeGreaterThan(0)
    for (const entry of result.entries) {
      expect(entry.paper.topics.some((t) => t.slug === "fuzzy-logic")).toBe(true)
    }
  })

  it("sorts papers by recent", async () => {
    const repository = createRepository()
    const result = await repository.searchPapers({ sort: "recent" }, "landigf")

    for (let i = 1; i < result.entries.length; i++) {
      const prev = new Date(result.entries[i - 1]?.paper.createdAt).getTime()
      const curr = new Date(result.entries[i]?.paper.createdAt).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })

  it("returns trending topics with paper counts", async () => {
    const repository = createRepository()
    const trending = await repository.getTrendingTopics(5)

    expect(trending.length).toBeGreaterThan(0)
    for (const topic of trending) {
      expect(topic.paperCount).toBeGreaterThan(0)
      expect(topic.slug).toBeTruthy()
    }
    // Sorted by count descending
    for (let i = 1; i < trending.length; i++) {
      expect(trending[i - 1]?.paperCount).toBeGreaterThanOrEqual(trending[i]?.paperCount)
    }
  })

  it("returns all available topics", async () => {
    const repository = createRepository()
    const topics = await repository.getTopics()

    expect(topics.length).toBeGreaterThan(0)
    // Sorted alphabetically
    for (let i = 1; i < topics.length; i++) {
      expect(topics[i - 1]?.label.localeCompare(topics[i]?.label)).toBeLessThanOrEqual(0)
    }
  })

  it("returns empty results for non-matching query", async () => {
    const repository = createRepository()
    const result = await repository.searchPapers({ query: "xyznonexistent123" }, "landigf")

    expect(result.entries.length).toBe(0)
    expect(result.total).toBe(0)
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
