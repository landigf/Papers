import { describe, expect, it } from "vitest"
import { assertBlindSafe, serializePublicPaper } from "../src/index"

function blindPaper(overrides: Record<string, unknown> = {}) {
  return {
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
    ...overrides,
  }
}

describe("contracts", () => {
  it("removes the public author from blind papers", () => {
    expect(serializePublicPaper(blindPaper()).publicAuthorProfile).toBeNull()
  })

  it("nulls ownerId for blind papers", () => {
    expect(serializePublicPaper(blindPaper()).ownerId).toBeNull()
  })

  it("scrubs asset filenames for blind papers", () => {
    const paper = blindPaper({
      assets: [
        {
          id: "asset_1",
          paperId: "paper_1",
          storageKey: "uploads/paper_1/draft.pdf",
          fileName: "alice-research-draft-v3.pdf",
          mimeType: "application/pdf",
          fileSizeBytes: 42000,
          uploadedAt: new Date().toISOString(),
          isMetadataScrubbed: false,
        },
      ],
    })

    const result = serializePublicPaper(paper)
    expect(result.assets[0]?.fileName).toBe("attachment")
  })

  it("assertBlindSafe throws when ownerId leaks", () => {
    const paper = serializePublicPaper(blindPaper())
    const tampered = { ...paper, ownerId: "user_1" }
    expect(() => assertBlindSafe(tampered)).toThrow("Blind paper leaked ownerId.")
  })

  it("assertBlindSafe passes for correctly serialized blind paper", () => {
    const paper = serializePublicPaper(blindPaper())
    expect(() => assertBlindSafe(paper)).not.toThrow()
  })
})
