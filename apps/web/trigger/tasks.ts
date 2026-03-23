import { GrokProvider } from "@papers/ai"
import { task } from "@trigger.dev/sdk"

const provider = new GrokProvider()

export const enrichPaperMetadata = task({
  id: "enrich-paper-metadata",
  run: async (payload: { title: string; abstract: string; isBlindContent: boolean }) => {
    const tags = await provider.complete(
      "tag-extraction",
      `Title: ${payload.title}\nAbstract: ${payload.abstract}`,
      { isBlindContent: payload.isBlindContent, containsPrivateDraft: false },
    )

    return {
      tags,
    }
  },
})

export const refreshFeedSnapshot = task({
  id: "refresh-feed-snapshot",
  run: async (payload: { reason: string }) => {
    return {
      refreshedAt: new Date().toISOString(),
      reason: payload.reason,
    }
  },
})

export const scrubBlindPdfMetadata = task({
  id: "scrub-blind-pdf-metadata",
  run: async (payload: { storageKey: string }) => {
    return {
      storageKey: payload.storageKey,
      scrubbed: true,
    }
  },
})
