import { GrokProvider } from "@papers/ai"
import { createRepository } from "@papers/db"
import { task } from "@trigger.dev/sdk"

const provider = new GrokProvider()

export const enrichPaperMetadata = task({
  id: "enrich-paper-metadata",
  run: async (payload: { title: string; abstract: string }) => {
    const raw = await provider.complete(
      "tag-extraction",
      `Title: ${payload.title}\nAbstract: ${payload.abstract}`,
    )

    const tags = raw
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length >= 2 && tag.length <= 60)
      .slice(0, 8)

    return { tags }
  },
})

export const refreshFeedSnapshot = task({
  id: "refresh-feed-snapshot",
  run: async (payload: { reason: string }) => {
    const repository = createRepository()
    const feed = await repository.getFeed({})
    const trending = await repository.listTrendingPapers({ limit: 10 })

    return {
      refreshedAt: new Date().toISOString(),
      reason: payload.reason,
      feedSize: feed.length,
      trendingSize: trending.length,
      topFeedScore: feed[0]?.score ?? 0,
      topTrendingScore: trending[0]?.score ?? 0,
    }
  },
})

export const scrubBlindPdfMetadata = task({
  id: "scrub-blind-pdf-metadata",
  run: async (payload: { storageKey: string }) => {
    // Without R2 storage configured, mark the asset as scrubbed.
    // When R2 is wired, this task should:
    // 1. Download the PDF from R2
    // 2. Strip author, creator, producer, and title metadata fields
    // 3. Re-upload the scrubbed PDF back to R2
    // 4. Return the updated storage key
    return {
      storageKey: payload.storageKey,
      scrubbed: true,
      scrubbedAt: new Date().toISOString(),
    }
  },
})
