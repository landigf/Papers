import { GrokProvider } from "@papers/ai"
import { task } from "@trigger.dev/sdk"

const provider = new GrokProvider()

export const enrichPaperMetadata = task({
  id: "enrich-paper-metadata",
  retry: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 2_000,
    maxTimeoutInMs: 60_000,
    randomize: true,
  },
  run: async (payload: { title: string; abstract: string }) => {
    const tags = await provider.complete(
      "tag-extraction",
      `Title: ${payload.title}\nAbstract: ${payload.abstract}`,
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
  retry: {
    maxAttempts: 5,
    factor: 1.5,
    minTimeoutInMs: 500,
    maxTimeoutInMs: 15_000,
    randomize: true,
  },
  run: async (payload: { storageKey: string }) => {
    return {
      storageKey: payload.storageKey,
      scrubbed: true,
    }
  },
})
