import { describe, expect, it } from "vitest"
import {
  buildDeepLink,
  conferenceDeepLink,
  feedDeepLink,
  groupDeepLink,
  paperDeepLink,
  profileDeepLink,
  serializePublicPaper,
} from "../src/index"

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

describe("deep links with /papers basePath", () => {
  const url = "https://papers.example.com"
  const basePath = "/papers"

  it("prefixes arbitrary routes with basePath", () => {
    expect(buildDeepLink(url, basePath, "/feed")).toBe("https://papers.example.com/papers/feed")
  })

  it("handles routes without leading slash", () => {
    expect(buildDeepLink(url, basePath, "feed")).toBe("https://papers.example.com/papers/feed")
  })

  it("strips trailing slashes from publicUrl", () => {
    expect(buildDeepLink("https://papers.example.com/", basePath, "/feed")).toBe(
      "https://papers.example.com/papers/feed",
    )
  })

  it("builds correct paper deep link", () => {
    expect(paperDeepLink(url, basePath, "my-paper-slug")).toBe(
      "https://papers.example.com/papers/papers/my-paper-slug",
    )
  })

  it("builds correct profile deep link", () => {
    expect(profileDeepLink(url, basePath, "alice")).toBe(
      "https://papers.example.com/papers/u/alice",
    )
  })

  it("builds correct feed deep link", () => {
    expect(feedDeepLink(url, basePath)).toBe("https://papers.example.com/papers/feed")
  })

  it("builds correct group deep link", () => {
    expect(groupDeepLink(url, basePath, "ml-reading-club")).toBe(
      "https://papers.example.com/papers/groups/ml-reading-club",
    )
  })

  it("builds correct conference deep link", () => {
    expect(conferenceDeepLink(url, basePath, "neurips-2026")).toBe(
      "https://papers.example.com/papers/conferences/neurips-2026",
    )
  })

  it("works with empty basePath (no prefix deployment)", () => {
    expect(paperDeepLink(url, "", "my-paper")).toBe("https://papers.example.com/papers/my-paper")
  })

  it("works with localhost for development", () => {
    expect(feedDeepLink("http://localhost:3000", "/papers")).toBe(
      "http://localhost:3000/papers/feed",
    )
  })
})
