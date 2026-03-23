import { describe, expect, it } from "vitest"
import { serializePublicPaper } from "../src/index"

describe("contracts", () => {
  it("removes the public author from blind papers", () => {
    const paper = {
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

    expect(serializePublicPaper(paper).publicAuthorProfile).toBeNull()
  })
})
