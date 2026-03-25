import { GrokProvider } from "@papers/ai"
import { task } from "@trigger.dev/sdk"
import { PDFDocument } from "pdf-lib"
import { downloadObject, uploadObject } from "../lib/r2"

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
    const pdfBytes = await downloadObject(payload.storageKey)
    const doc = await PDFDocument.load(pdfBytes)

    doc.setTitle("")
    doc.setAuthor("")
    doc.setSubject("")
    doc.setKeywords([])
    doc.setProducer("Papers")
    doc.setCreator("Papers")

    const scrubbed = await doc.save()
    await uploadObject(payload.storageKey, scrubbed, "application/pdf")

    return {
      storageKey: payload.storageKey,
      scrubbed: true,
      sizeBytes: scrubbed.byteLength,
    }
  },
})
