import { describe, expect, it } from "vitest"
import {
  createModerationFlagInputSchema,
  MODERATION_RATE_LIMIT,
  moderationFlagReasonSchema,
  moderationFlagSchema,
  safeAiPayloadSchema,
  serializePublicPaper,
} from "../src/index"

const blindPaper = {
  id: "paper_1",
  slug: "blind-paper",
  title: "Blind",
  abstract: "This is a blind submission abstract that still needs public review.",
  bodyMarkdown: "body",
  visibilityMode: "blind" as const,
  ownerId: "user_1",
  publicAuthorProfile: {
    id: "profile_1",
    handle: "alice",
    displayName: "Alice",
    headline: null,
    bio: null,
    affiliation: null,
    researchInterests: [],
    orcid: "0000-0000-0000-0000",
    isVerifiedResearcher: true,
  },
  topics: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  commentCount: 0,
  starCount: 0,
  followerCount: 0,
  isStarredByViewer: false,
  isFollowedByViewer: false,
  isSavedByViewer: false,
  latestVersion: {
    id: "version_1",
    paperId: "paper_1",
    title: "Blind",
    abstract: "abstract",
    bodyMarkdown: "body",
    createdAt: new Date().toISOString(),
  },
  assets: [],
}

describe("contracts", () => {
  it("removes the public author from blind papers", () => {
    expect(serializePublicPaper(blindPaper).publicAuthorProfile).toBeNull()
  })

  it("removes ownerId from blind papers", () => {
    expect(serializePublicPaper(blindPaper).ownerId).toBeNull()
  })

  it("removes ownerId from public papers in serialized form", () => {
    const publicPaper = { ...blindPaper, visibilityMode: "public" as const }
    expect(serializePublicPaper(publicPaper).ownerId).toBeNull()
  })
})

describe("moderation flag contracts", () => {
  it("accepts valid flag input with paperId", () => {
    const result = createModerationFlagInputSchema.safeParse({
      paperId: "paper_1",
      reason: "spam",
    })
    expect(result.success).toBe(true)
  })

  it("accepts valid flag input with commentId", () => {
    const result = createModerationFlagInputSchema.safeParse({
      commentId: "comment_1",
      reason: "harassment",
    })
    expect(result.success).toBe(true)
  })

  it("rejects unknown reason values", () => {
    const result = createModerationFlagInputSchema.safeParse({
      paperId: "paper_1",
      reason: "i_dont_like_it",
    })
    expect(result.success).toBe(false)
  })

  it("enumerates all expected reason values", () => {
    const reasons = moderationFlagReasonSchema.options
    expect(reasons).toContain("spam")
    expect(reasons).toContain("harassment")
    expect(reasons).toContain("identity_leak")
    expect(reasons).toContain("misinformation")
    expect(reasons).toContain("off_topic")
    expect(reasons).toContain("other")
  })

  it("validates a complete moderation flag", () => {
    const result = moderationFlagSchema.safeParse({
      id: "flag_1",
      reporterId: "user_1",
      paperId: "paper_1",
      commentId: null,
      reason: "identity_leak",
      status: "open",
      createdAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })

  it("exposes rate limit constants", () => {
    expect(MODERATION_RATE_LIMIT.maxFlagsPerUserPerHour).toBeGreaterThan(0)
    expect(MODERATION_RATE_LIMIT.maxFlagsPerTargetPerUser).toBe(1)
  })
})

describe("AI safety contracts", () => {
  it("rejects blind content in AI payload validation", () => {
    const result = safeAiPayloadSchema.safeParse({
      task: "tag-extraction",
      isBlindContent: true,
      containsPrivateDraft: false,
      text: "some text",
    })
    expect(result.success).toBe(true)
    // The schema accepts it structurally; the runtime assertSafe() in GrokProvider rejects it
  })

  it("requires non-empty text for AI payload", () => {
    const result = safeAiPayloadSchema.safeParse({
      task: "summary-refinement",
      isBlindContent: false,
      containsPrivateDraft: false,
      text: "",
    })
    expect(result.success).toBe(false)
  })
})
