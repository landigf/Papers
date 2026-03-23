import { randomUUID } from "node:crypto"
import { getPapersConfig } from "@papers/config"
import {
  type Comment,
  type CreateCommentInput,
  type CreatePaperInput,
  createCommentInputSchema,
  createPaperInputSchema,
  type DiscoverySortMode,
  type FeedEntry,
  type Paper,
  type Profile,
  type PublicPaper,
  type RoadmapBucket,
  type SavedInterest,
  type SearchQuery,
  type SearchResultSet,
  saveInterestInputSchema,
  searchQuerySchema,
  slugify,
  type Topic,
  type TrendingTopic,
  type User,
} from "@papers/contracts"
import { getPublicComments, getPublicPaper, readDemoState, writeDemoState } from "./demo-store"

export {
  authAccounts,
  authSessions,
  authUsers,
  authVerifications,
  comments,
  follows,
  moderationFlags,
  paperAssets,
  papers,
  paperTopics,
  paperVersions,
  profiles,
  savedInterests,
  stars,
  topics,
} from "./schema"

function nowIso(): string {
  return new Date().toISOString()
}

export type PaperDetail = {
  paper: PublicPaper
  comments: Comment[]
}

export type ProfileDetail = {
  profile: Profile
  papers: PublicPaper[]
  isFollowedByViewer: boolean
}

export interface PapersRepository {
  getViewer(handle?: string | null): Promise<User | null>
  upsertDemoViewer(input: { handle: string; email: string; name: string }): Promise<User>
  getRoadmap(): Promise<RoadmapBucket>
  getFeed(input?: { viewerHandle?: string | null; query?: string | null }): Promise<FeedEntry[]>
  getPaperBySlug(slug: string, viewerHandle?: string | null): Promise<PaperDetail | null>
  getProfileByHandle(handle: string, viewerHandle?: string | null): Promise<ProfileDetail | null>
  createPaper(input: CreatePaperInput, viewerHandle?: string | null): Promise<PublicPaper>
  createComment(input: CreateCommentInput, viewerHandle?: string | null): Promise<Comment>
  toggleFollow(handle: string, viewerHandle?: string | null): Promise<boolean>
  toggleStar(slug: string, viewerHandle?: string | null): Promise<boolean>
  saveInterest(label: string, viewerHandle?: string | null): Promise<SavedInterest>
  searchPapers(query: SearchQuery, viewerHandle?: string | null): Promise<SearchResultSet>
  getTopics(): Promise<Topic[]>
  getTrendingTopics(limit?: number): Promise<TrendingTopic[]>
}

async function getViewerHandle(viewerHandle?: string | null): Promise<string> {
  const config = getPapersConfig()
  return viewerHandle?.trim() || config.PAPERS_DEFAULT_HANDLE
}

function deriveTopics(labels: string[]): Topic[] {
  return labels.map((label) => ({
    id: `topic_${slugify(label)}`,
    label,
    slug: slugify(label),
  }))
}

function scorePaper(
  paper: Paper,
  viewer: User | null,
  comments: Comment[],
  savedInterests: SavedInterest[],
): FeedEntry {
  const normalizedAbstract = `${paper.title} ${paper.abstract}`.toLowerCase()
  const interestHits = savedInterests.filter((interest) =>
    normalizedAbstract.includes(interest.label.toLowerCase()),
  ).length
  const topicHits = viewer
    ? paper.topics.filter((topic) =>
        viewer.profile.researchInterests.some((interest) =>
          interest.toLowerCase().includes(topic.label.toLowerCase()),
        ),
      ).length
    : 0
  const commentHits = comments.filter((comment) => comment.paperId === paper.id).length
  const recencyBoost = Math.max(
    1,
    30 - Math.floor((Date.now() - new Date(paper.createdAt).getTime()) / 86_400_000),
  )
  const score = recencyBoost + interestHits * 5 + topicHits * 4 + commentHits * 2 + paper.starCount
  const reasons = [
    interestHits > 0 ? `${interestHits} saved-interest match${interestHits > 1 ? "es" : ""}` : null,
    topicHits > 0 ? `${topicHits} topic overlap${topicHits > 1 ? "s" : ""}` : null,
    commentHits > 0 ? `${commentHits} active discussion${commentHits > 1 ? "s" : ""}` : null,
    `recency score ${recencyBoost}`,
  ].filter(Boolean) as string[]

  return {
    id: `feed_${paper.id}`,
    paper: getPublicPaper(paper),
    score,
    reasons,
  }
}

class DemoRepository implements PapersRepository {
  async getViewer(handle?: string | null): Promise<User | null> {
    const state = await readDemoState()
    const resolvedHandle = await getViewerHandle(handle)
    return state.users.find((user) => user.handle === resolvedHandle) ?? null
  }

  async upsertDemoViewer(input: { handle: string; email: string; name: string }): Promise<User> {
    const state = await readDemoState()
    const existing =
      state.users.find((user) => user.handle === input.handle) ??
      state.users.find((user) => user.email === input.email)

    if (existing) {
      return existing
    }

    const createdAt = nowIso()
    const user: User = {
      id: randomUUID(),
      email: input.email,
      name: input.name,
      handle: slugify(input.handle),
      createdAt,
      profile: {
        id: randomUUID(),
        handle: slugify(input.handle),
        displayName: input.name,
        headline: "New researcher on Papers.",
        bio: "Joined through demo mode. Add your profile details from account settings.",
        affiliation: null,
        researchInterests: [],
        orcid: null,
        isVerifiedResearcher: false,
      },
      externalIdentities: [],
    }

    state.users.push(user)
    await writeDemoState(state)
    return user
  }

  async getRoadmap(): Promise<RoadmapBucket> {
    return (await readDemoState()).roadmap
  }

  async getFeed(input?: {
    viewerHandle?: string | null
    query?: string | null
  }): Promise<FeedEntry[]> {
    const state = await readDemoState()
    const viewer = await this.getViewer(input?.viewerHandle)
    const viewerSavedInterests = state.savedInterests.filter(
      (interest) => interest.userId === viewer?.id,
    )
    const normalizedQuery = input?.query?.trim().toLowerCase()
    const visiblePapers = state.papers
      .filter((paper) => {
        if (!normalizedQuery) {
          return true
        }

        return `${paper.title} ${paper.abstract} ${paper.topics.map((topic) => topic.label).join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .map((paper) => scorePaper(paper, viewer, state.comments, viewerSavedInterests))
      .sort((left, right) => right.score - left.score)

    return visiblePapers
  }

  async getPaperBySlug(slug: string, viewerHandle?: string | null): Promise<PaperDetail | null> {
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)
    const paper = state.papers.find((entry) => entry.slug === slug || entry.id === slug)

    if (!paper) {
      return null
    }

    const publicPaper = {
      ...getPublicPaper(paper),
      isSavedByViewer: state.savedInterests.some(
        (interest) =>
          interest.userId === viewer?.id &&
          paper.topics.some((topic) =>
            interest.label.toLowerCase().includes(topic.label.toLowerCase()),
          ),
      ),
    }

    return {
      paper: publicPaper,
      comments: getPublicComments(
        state.comments.filter((comment) => comment.paperId === paper.id),
        paper,
      ),
    }
  }

  async getProfileByHandle(
    handle: string,
    viewerHandle?: string | null,
  ): Promise<ProfileDetail | null> {
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)
    const user = state.users.find((entry) => entry.handle === handle)

    if (!user) {
      return null
    }

    return {
      profile: user.profile,
      papers: state.papers
        .filter((paper) => paper.ownerId === user.id && paper.visibilityMode === "public")
        .map(getPublicPaper),
      isFollowedByViewer: state.papers.some(
        (paper) =>
          paper.ownerId === user.id &&
          paper.visibilityMode === "public" &&
          paper.isFollowedByViewer &&
          viewer !== null,
      ),
    }
  }

  async createPaper(input: CreatePaperInput, viewerHandle?: string | null): Promise<PublicPaper> {
    const parsed = createPaperInputSchema.parse(input)
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)

    if (!viewer) {
      throw new Error("A viewer is required to publish a paper.")
    }

    const paper: Paper = {
      id: randomUUID(),
      slug: `${slugify(parsed.title)}-${Math.random().toString(36).slice(2, 6)}`,
      title: parsed.title,
      abstract: parsed.abstract,
      bodyMarkdown: parsed.bodyMarkdown,
      visibilityMode: parsed.visibilityMode,
      ownerId: viewer.id,
      publicAuthorProfile: parsed.visibilityMode === "blind" ? null : viewer.profile,
      topics: deriveTopics(parsed.topicLabels),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      commentCount: 0,
      starCount: 0,
      followerCount: 0,
      isStarredByViewer: false,
      isFollowedByViewer: false,
      isSavedByViewer: false,
      latestVersion: {
        id: randomUUID(),
        paperId: "",
        title: parsed.title,
        abstract: parsed.abstract,
        bodyMarkdown: parsed.bodyMarkdown,
        createdAt: nowIso(),
      },
      assets: [],
    }
    paper.latestVersion.paperId = paper.id

    state.papers.unshift(paper)
    await writeDemoState(state)
    return getPublicPaper(paper)
  }

  async createComment(input: CreateCommentInput, viewerHandle?: string | null): Promise<Comment> {
    const parsed = createCommentInputSchema.parse(input)
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)

    if (!viewer) {
      throw new Error("A viewer is required to comment.")
    }

    const paper = state.papers.find(
      (entry) => entry.id === parsed.paperId || entry.slug === parsed.paperId,
    )
    if (!paper) {
      throw new Error("Paper not found.")
    }

    const comment: Comment = {
      id: randomUUID(),
      paperId: paper.id,
      authorProfile: paper.visibilityMode === "blind" ? null : viewer.profile,
      body: parsed.body,
      createdAt: nowIso(),
      isBlindSafe: true,
    }

    state.comments.push(comment)
    const targetPaper = state.papers.find((entry) => entry.id === paper.id)
    if (targetPaper) {
      targetPaper.commentCount += 1
      targetPaper.updatedAt = nowIso()
    }
    await writeDemoState(state)
    return comment
  }

  async toggleFollow(handle: string, viewerHandle?: string | null): Promise<boolean> {
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)
    const target = state.users.find((user) => user.handle === handle)

    if (!viewer || !target || viewer.id === target.id) {
      return false
    }

    const papers = state.papers.filter((paper) => paper.ownerId === target.id)
    for (const paper of papers) {
      paper.isFollowedByViewer = !paper.isFollowedByViewer
      paper.followerCount = Math.max(0, paper.followerCount + (paper.isFollowedByViewer ? 1 : -1))
    }
    await writeDemoState(state)
    return papers[0]?.isFollowedByViewer ?? false
  }

  async toggleStar(slug: string, viewerHandle?: string | null): Promise<boolean> {
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)
    if (!viewer) {
      return false
    }

    const paper = state.papers.find((entry) => entry.slug === slug || entry.id === slug)
    if (!paper) {
      return false
    }

    paper.isStarredByViewer = !paper.isStarredByViewer
    paper.starCount = Math.max(0, paper.starCount + (paper.isStarredByViewer ? 1 : -1))
    await writeDemoState(state)
    return paper.isStarredByViewer
  }

  async saveInterest(label: string, viewerHandle?: string | null): Promise<SavedInterest> {
    const parsed = saveInterestInputSchema.parse({ label })
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)

    if (!viewer) {
      throw new Error("A viewer is required to save an interest.")
    }

    const existing = state.savedInterests.find(
      (interest) =>
        interest.userId === viewer.id &&
        interest.label.toLowerCase() === parsed.label.toLowerCase(),
    )
    if (existing) {
      return existing
    }

    const savedInterest: SavedInterest = {
      id: randomUUID(),
      userId: viewer.id,
      label: parsed.label,
      createdAt: nowIso(),
    }
    state.savedInterests.push(savedInterest)
    await writeDemoState(state)
    return savedInterest
  }

  async searchPapers(query: SearchQuery, viewerHandle?: string | null): Promise<SearchResultSet> {
    const parsed = searchQuerySchema.parse(query)
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)
    const viewerSavedInterests = state.savedInterests.filter(
      (interest) => interest.userId === viewer?.id,
    )

    const normalizedQuery = parsed.query?.trim().toLowerCase()
    const sort: DiscoverySortMode = parsed.sort ?? "relevance"
    const limit = parsed.limit ?? 20
    const offset = parsed.offset ?? 0

    // Collect all unique topics across papers for the response
    const topicMap = new Map<string, Topic>()
    for (const paper of state.papers) {
      for (const topic of paper.topics) {
        topicMap.set(topic.slug, topic)
      }
    }
    const availableTopics = Array.from(topicMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    )

    // Filter
    const filtered = state.papers.filter((paper) => {
      if (normalizedQuery) {
        const haystack =
          `${paper.title} ${paper.abstract} ${paper.topics.map((t) => t.label).join(" ")}`.toLowerCase()
        if (!haystack.includes(normalizedQuery)) return false
      }
      if (parsed.filters?.visibilityMode && paper.visibilityMode !== parsed.filters.visibilityMode)
        return false
      if (parsed.filters?.topicSlugs?.length) {
        const paperTopicSlugs = new Set(paper.topics.map((t) => t.slug))
        if (!parsed.filters.topicSlugs.some((slug) => paperTopicSlugs.has(slug))) return false
      }
      return true
    })

    // Score and sort
    const scored = filtered.map((paper) =>
      scorePaper(paper, viewer, state.comments, viewerSavedInterests),
    )

    if (sort === "recent") {
      scored.sort(
        (a, b) => new Date(b.paper.createdAt).getTime() - new Date(a.paper.createdAt).getTime(),
      )
    } else if (sort === "popular") {
      scored.sort(
        (a, b) =>
          b.paper.starCount + b.paper.commentCount - (a.paper.starCount + a.paper.commentCount),
      )
    } else {
      scored.sort((a, b) => b.score - a.score)
    }

    const total = scored.length
    const entries = scored.slice(offset, offset + limit)

    return { entries, total, appliedSort: sort, availableTopics }
  }

  async getTopics(): Promise<Topic[]> {
    const state = await readDemoState()
    const topicMap = new Map<string, Topic>()
    for (const paper of state.papers) {
      for (const topic of paper.topics) {
        topicMap.set(topic.slug, topic)
      }
    }
    return Array.from(topicMap.values()).sort((a, b) => a.label.localeCompare(b.label))
  }

  async getTrendingTopics(limit = 10): Promise<TrendingTopic[]> {
    const state = await readDemoState()
    const counts = new Map<string, { topic: Topic; count: number }>()
    for (const paper of state.papers) {
      for (const topic of paper.topics) {
        const existing = counts.get(topic.slug)
        if (existing) {
          existing.count += 1
        } else {
          counts.set(topic.slug, { topic, count: 1 })
        }
      }
    }
    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ topic, count }) => ({ ...topic, paperCount: count }))
  }
}

export function createRepository(): PapersRepository {
  return new DemoRepository()
}
