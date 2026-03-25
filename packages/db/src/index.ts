import { randomUUID } from "node:crypto"
import { getPapersConfig } from "@papers/config"
import {
  type Comment,
  type Conference,
  type ConferenceSubmission,
  type CreateCommentInput,
  type CreatePaperInput,
  type CreatePeerReviewInput,
  conferenceSubmissionSchema,
  createCommentInputSchema,
  createPaperInputSchema,
  createPeerReviewInputSchema,
  type DailyDigest,
  dailyDigestSchema,
  type FeedEntry,
  type Opportunity,
  type Paper,
  type Profile,
  type PublicPaper,
  type RoadmapBucket,
  type SavedInterest,
  type SubmitPaperToConferenceInput,
  saveInterestInputSchema,
  slugify,
  submitPaperToConferenceInputSchema,
  type Topic,
  type UpdateViewerProfileInput,
  type User,
  updateViewerProfileInputSchema,
} from "@papers/contracts"
import {
  type DemoState,
  getPublicComments,
  getPublicPaper,
  readDemoState,
  writeDemoState,
} from "./demo-store"
import {
  authAccounts,
  authSessions,
  authUsers,
  authVerifications,
  comments,
  conferenceSubmissions,
  conferences,
  conferenceTopics,
  follows,
  moderationFlags,
  paperAssets,
  papers,
  paperTopics,
  paperVersions,
  peerReviews,
  profiles,
  researchOpportunities,
  savedInterests,
  stars,
  topics,
} from "./schema"

export {
  authAccounts,
  authSessions,
  authUsers,
  authVerifications,
  comments,
  conferenceSubmissions,
  conferences,
  conferenceTopics,
  follows,
  moderationFlags,
  paperAssets,
  papers,
  paperTopics,
  paperVersions,
  peerReviews,
  profiles,
  researchOpportunities,
  savedInterests,
  stars,
  topics,
}

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

export type ConferenceDetail = {
  conference: Conference
  submissions: Array<
    ConferenceSubmission & {
      reviews: DemoState["peerReviews"]
    }
  >
  viewerPapers: PublicPaper[]
}

export interface PapersRepository {
  getViewer(handle?: string | null): Promise<User | null>
  upsertDemoViewer(input: {
    handle: string
    email: string
    name: string
    affiliation?: string | null
    interestLabels?: string[]
  }): Promise<User>
  updateViewerProfile(input: UpdateViewerProfileInput, viewerHandle?: string | null): Promise<User>
  getRoadmap(): Promise<RoadmapBucket>
  getFeed(input?: { viewerHandle?: string | null; query?: string | null }): Promise<FeedEntry[]>
  listTrendingPapers(input?: { viewerHandle?: string | null; limit?: number }): Promise<FeedEntry[]>
  getPaperBySlug(slug: string, viewerHandle?: string | null): Promise<PaperDetail | null>
  getProfileByHandle(handle: string, viewerHandle?: string | null): Promise<ProfileDetail | null>
  createPaper(input: CreatePaperInput, viewerHandle?: string | null): Promise<PublicPaper>
  createComment(input: CreateCommentInput, viewerHandle?: string | null): Promise<Comment>
  toggleFollow(handle: string, viewerHandle?: string | null): Promise<boolean>
  toggleStar(slug: string, viewerHandle?: string | null): Promise<boolean>
  saveInterest(label: string, viewerHandle?: string | null): Promise<SavedInterest>
  listConferences(): Promise<Conference[]>
  getConferenceBySlug(slug: string, viewerHandle?: string | null): Promise<ConferenceDetail | null>
  submitPaperToConference(
    input: SubmitPaperToConferenceInput,
    viewerHandle?: string | null,
  ): Promise<ConferenceSubmission>
  createPeerReview(
    input: CreatePeerReviewInput,
    viewerHandle?: string | null,
  ): Promise<DemoState["peerReviews"][number]>
  getDailyDigest(viewerHandle?: string | null): Promise<DailyDigest>
  getOpportunities(viewerHandle?: string | null): Promise<Opportunity[]>
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

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function getViewerInterestLabels(viewer: User | null, state: DemoState): string[] {
  if (!viewer) {
    return []
  }

  return dedupeStrings([
    ...viewer.profile.researchInterests,
    ...state.savedInterests
      .filter((interest) => interest.userId === viewer.id)
      .map((interest) => interest.label),
  ])
}

function getTopicLabels(topics: Topic[]): string[] {
  return topics.map((topic) => topic.label.toLowerCase())
}

function computePaperReviewSignal(paper: Paper, state: DemoState): number {
  const relatedSubmissions = state.submissions.filter(
    (submission) => submission.paperId === paper.id,
  )
  return relatedSubmissions.reduce((total, submission) => {
    const reviewCount = state.peerReviews.filter(
      (review) => review.submissionId === submission.id,
    ).length
    return total + reviewCount
  }, 0)
}

function scoreFeedPaper(paper: Paper, viewer: User | null, state: DemoState): FeedEntry {
  const normalizedDocument =
    `${paper.title} ${paper.abstract} ${paper.topics.map((topic) => topic.label).join(" ")}`.toLowerCase()
  const viewerInterests = getViewerInterestLabels(viewer, state)
  const interestHits = viewerInterests.filter((interest) =>
    normalizedDocument.includes(interest.toLowerCase()),
  ).length
  const topicHits = viewer
    ? paper.topics.filter((topic) =>
        viewer.profile.researchInterests.some((interest) =>
          interest.toLowerCase().includes(topic.label.toLowerCase()),
        ),
      ).length
    : 0
  const commentHits = state.comments.filter((comment) => comment.paperId === paper.id).length
  const reviewSignal = computePaperReviewSignal(paper, state)
  const recencyBoost = Math.max(
    1,
    24 - Math.floor((Date.now() - new Date(paper.createdAt).getTime()) / 86_400_000),
  )
  const score =
    recencyBoost +
    paper.starCount * 2 +
    commentHits * 3 +
    reviewSignal * 2 +
    interestHits * 5 +
    topicHits * 4

  const reasons = [
    interestHits > 0 ? `${interestHits} interest match${interestHits > 1 ? "es" : ""}` : null,
    topicHits > 0 ? `${topicHits} topic overlap${topicHits > 1 ? "s" : ""}` : null,
    commentHits > 0 ? `${commentHits} active discussion${commentHits > 1 ? "s" : ""}` : null,
    reviewSignal > 0 ? `${reviewSignal} peer-review signal${reviewSignal > 1 ? "s" : ""}` : null,
    `recency score ${recencyBoost}`,
  ].filter(Boolean) as string[]

  return {
    id: `feed_${paper.id}`,
    paper: getPublicPaper(paper),
    score,
    reasons,
  }
}

function scoreTrendingPaper(paper: Paper, state: DemoState): FeedEntry {
  const commentHits = state.comments.filter((comment) => comment.paperId === paper.id).length
  const reviewSignal = computePaperReviewSignal(paper, state)
  const recencyBoost = Math.max(
    1,
    16 - Math.floor((Date.now() - new Date(paper.createdAt).getTime()) / 86_400_000),
  )
  const score = paper.starCount * 4 + commentHits * 3 + reviewSignal * 3 + recencyBoost

  return {
    id: `trending_${paper.id}`,
    paper: getPublicPaper(paper),
    score,
    reasons: [
      `${paper.starCount} star${paper.starCount === 1 ? "" : "s"}`,
      `${commentHits} discussion point${commentHits === 1 ? "" : "s"}`,
      reviewSignal > 0
        ? `${reviewSignal} review signal${reviewSignal === 1 ? "" : "s"}`
        : "freshly published",
    ],
  }
}

function hydrateSubmission(
  submission: DemoState["submissions"][number],
  state: DemoState,
): ConferenceSubmission & { reviews: DemoState["peerReviews"] } {
  const paper = state.papers.find((entry) => entry.id === submission.paperId)
  const reviews = state.peerReviews.filter((review) => review.submissionId === submission.id)
  const averageScore =
    reviews.length > 0
      ? Number((reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length).toFixed(1))
      : null

  return {
    ...submission,
    paper: paper ? getPublicPaper(paper) : submission.paper,
    reviewCount: reviews.length,
    averageScore,
    reviews,
  }
}

function matchOpportunity(
  opportunity: Opportunity,
  viewer: User | null,
  state: DemoState,
): Opportunity {
  const interestLabels = getViewerInterestLabels(viewer, state)
  const topicLabels = getTopicLabels(opportunity.topics)
  const directMatches = interestLabels.filter((interest) =>
    topicLabels.some((topic) => interest.toLowerCase().includes(topic)),
  )

  const matchReasons =
    directMatches.length > 0
      ? [
          `${directMatches.length} overlap${directMatches.length > 1 ? "s" : ""} with your interests`,
          `${opportunity.mode} opportunity from ${opportunity.organization}`,
        ]
      : [
          "Outside your usual lane on purpose",
          `Could create cross-disciplinary contact with ${opportunity.organization}`,
        ]

  return {
    ...opportunity,
    matchReasons,
  }
}

class DemoRepository implements PapersRepository {
  async getViewer(handle?: string | null): Promise<User | null> {
    const state = await readDemoState()
    const resolvedHandle = await getViewerHandle(handle)
    return (
      state.users.find((user) => user.handle === resolvedHandle) ??
      state.users.find((user) => user.email === resolvedHandle) ??
      null
    )
  }

  async upsertDemoViewer(input: {
    handle: string
    email: string
    name: string
    affiliation?: string | null
    interestLabels?: string[]
  }): Promise<User> {
    const state = await readDemoState()
    const normalizedHandle = slugify(input.handle)
    const existing =
      state.users.find((user) => user.handle === normalizedHandle) ??
      state.users.find((user) => user.email === input.email)

    if (existing) {
      return existing
    }

    const createdAt = nowIso()
    const user: User = {
      id: randomUUID(),
      email: input.email,
      name: input.name,
      handle: normalizedHandle,
      createdAt,
      profile: {
        id: randomUUID(),
        handle: normalizedHandle,
        displayName: input.name,
        headline: "Researcher building in public without wasting signal.",
        bio: "Joined through demo mode. Start by setting your interests, collaborations, and active research questions.",
        affiliation: input.affiliation ?? null,
        researchInterests: dedupeStrings(input.interestLabels ?? []),
        orcid: null,
        isVerifiedResearcher: false,
      },
      externalIdentities: [],
    }

    state.users.push(user)
    await writeDemoState(state)
    return user
  }

  async updateViewerProfile(
    input: UpdateViewerProfileInput,
    viewerHandle?: string | null,
  ): Promise<User> {
    const parsed = updateViewerProfileInputSchema.parse(input)
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)

    if (!viewer) {
      throw new Error("A viewer is required to update the profile.")
    }

    const target = state.users.find((user) => user.id === viewer.id)
    if (!target) {
      throw new Error("Viewer not found.")
    }

    target.profile.headline = parsed.headline || null
    target.profile.bio = parsed.bio || null
    target.profile.affiliation = parsed.affiliation || null
    target.profile.researchInterests = dedupeStrings(parsed.interestLabels)
    await writeDemoState(state)
    return target
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
    const normalizedQuery = input?.query?.trim().toLowerCase()

    return state.papers
      .filter((paper) => {
        if (!normalizedQuery) {
          return true
        }

        return `${paper.title} ${paper.abstract} ${paper.topics.map((topic) => topic.label).join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .map((paper) => scoreFeedPaper(paper, viewer, state))
      .sort((left, right) => right.score - left.score)
  }

  async listTrendingPapers(input?: {
    viewerHandle?: string | null
    limit?: number
  }): Promise<FeedEntry[]> {
    const state = await readDemoState()
    const limit = input?.limit ?? 3

    return state.papers
      .map((paper) => scoreTrendingPaper(paper, state))
      .sort((left, right) => right.score - left.score)
      .slice(0, limit)
  }

  async getPaperBySlug(slug: string, viewerHandle?: string | null): Promise<PaperDetail | null> {
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)
    const paper = state.papers.find((entry) => entry.slug === slug || entry.id === slug)

    if (!paper) {
      return null
    }

    const interestLabels = getViewerInterestLabels(viewer, state)

    return {
      paper: {
        ...getPublicPaper(paper),
        isSavedByViewer: interestLabels.some((interest) =>
          paper.topics.some((topic) => interest.toLowerCase().includes(topic.label.toLowerCase())),
        ),
      },
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
      isFollowedByViewer:
        viewer !== null &&
        state.papers.some(
          (paper) =>
            paper.ownerId === user.id &&
            paper.visibilityMode === "public" &&
            paper.isFollowedByViewer,
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

    const createdAt = nowIso()
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
      createdAt,
      updatedAt: createdAt,
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
        createdAt,
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
    paper.commentCount += 1
    paper.updatedAt = nowIso()
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

    const targetPapers = state.papers.filter((paper) => paper.ownerId === target.id)
    const nextValue = !(targetPapers[0]?.isFollowedByViewer ?? false)
    for (const paper of targetPapers) {
      paper.isFollowedByViewer = nextValue
      paper.followerCount = Math.max(0, paper.followerCount + (nextValue ? 1 : -1))
    }
    await writeDemoState(state)
    return nextValue
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
    paper.updatedAt = nowIso()
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

  async listConferences(): Promise<Conference[]> {
    const state = await readDemoState()
    return state.conferences
      .map((conference) => ({
        ...conference,
        submissionCount: state.submissions.filter(
          (submission) => submission.conferenceId === conference.id,
        ).length,
        reviewCount: state.peerReviews.filter((review) => review.conferenceId === conference.id)
          .length,
      }))
      .sort((left, right) => Number(right.featured) - Number(left.featured))
  }

  async getConferenceBySlug(
    slug: string,
    viewerHandle?: string | null,
  ): Promise<ConferenceDetail | null> {
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)
    const conference = state.conferences.find((entry) => entry.slug === slug || entry.id === slug)

    if (!conference) {
      return null
    }

    const submissions = state.submissions
      .filter((submission) => submission.conferenceId === conference.id)
      .map((submission) => hydrateSubmission(submission, state))
      .sort((left, right) => {
        const rightScore = right.averageScore ?? 0
        const leftScore = left.averageScore ?? 0
        return rightScore - leftScore
      })

    const viewerPapers =
      viewer === null
        ? []
        : state.papers
            .filter(
              (paper) =>
                paper.ownerId === viewer.id &&
                !state.submissions.some(
                  (submission) =>
                    submission.conferenceId === conference.id && submission.paperId === paper.id,
                ),
            )
            .map(getPublicPaper)

    return {
      conference: {
        ...conference,
        submissionCount: submissions.length,
        reviewCount: state.peerReviews.filter((review) => review.conferenceId === conference.id)
          .length,
      },
      submissions,
      viewerPapers,
    }
  }

  async submitPaperToConference(
    input: SubmitPaperToConferenceInput,
    viewerHandle?: string | null,
  ): Promise<ConferenceSubmission> {
    const parsed = submitPaperToConferenceInputSchema.parse(input)
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)

    if (!viewer) {
      throw new Error("A viewer is required to submit to a conference.")
    }

    const conference = state.conferences.find((entry) => entry.slug === parsed.conferenceSlug)
    const paper = state.papers.find((entry) => entry.slug === parsed.paperSlug)

    if (!conference || !paper) {
      throw new Error("Conference or paper not found.")
    }
    if (paper.ownerId !== viewer.id) {
      throw new Error("You can only submit your own papers.")
    }

    const existing = state.submissions.find(
      (submission) => submission.conferenceId === conference.id && submission.paperId === paper.id,
    )
    if (existing) {
      return existing
    }

    const submission = conferenceSubmissionSchema.parse({
      id: randomUUID(),
      conferenceId: conference.id,
      paperId: paper.id,
      paper: getPublicPaper(paper),
      status: "submitted",
      submittedAt: nowIso(),
      reviewCount: 0,
      averageScore: null,
    })

    state.submissions.unshift(submission)
    conference.submissionCount += 1
    await writeDemoState(state)
    return submission
  }

  async createPeerReview(
    input: CreatePeerReviewInput,
    viewerHandle?: string | null,
  ): Promise<DemoState["peerReviews"][number]> {
    const parsed = createPeerReviewInputSchema.parse(input)
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)

    if (!viewer) {
      throw new Error("A viewer is required to review submissions.")
    }

    const conference = state.conferences.find((entry) => entry.slug === parsed.conferenceSlug)
    const submission = state.submissions.find((entry) => entry.id === parsed.submissionId)
    if (!conference || !submission || submission.conferenceId !== conference.id) {
      throw new Error("Submission not found for this conference.")
    }

    const paper = state.papers.find((entry) => entry.id === submission.paperId)
    if (!paper) {
      throw new Error("Paper not found.")
    }
    if (paper.ownerId === viewer.id) {
      throw new Error("You cannot review your own submission.")
    }

    const existing = state.peerReviews.find(
      (review) =>
        review.submissionId === submission.id && review.reviewerProfile?.handle === viewer.handle,
    )
    if (existing) {
      return existing
    }

    const review = {
      id: randomUUID(),
      conferenceId: conference.id,
      submissionId: submission.id,
      reviewerProfile: viewer.profile,
      score: parsed.score,
      confidence: parsed.confidence,
      summary: parsed.summary,
      strengths: parsed.strengths,
      concerns: parsed.concerns,
      recommendation: parsed.recommendation,
      createdAt: nowIso(),
    } satisfies DemoState["peerReviews"][number]

    state.peerReviews.unshift(review)
    submission.status = "under_review"
    submission.reviewCount += 1
    const scores = state.peerReviews
      .filter((entry) => entry.submissionId === submission.id)
      .map((entry) => entry.score)
    submission.averageScore = Number(
      (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1),
    )
    conference.reviewCount += 1
    await writeDemoState(state)
    return review
  }

  async getDailyDigest(viewerHandle?: string | null): Promise<DailyDigest> {
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)
    const feed = await this.getFeed({ viewerHandle })
    const trending = await this.listTrendingPapers({ viewerHandle, limit: 3 })
    const opportunities = await this.getOpportunities(viewerHandle)

    const insideOrbit = feed.slice(0, 3)
    const adjacentPaper =
      feed.find(
        (entry) =>
          viewer &&
          !entry.paper.topics.some((topic) =>
            viewer.profile.researchInterests.some((interest) =>
              interest.toLowerCase().includes(topic.label.toLowerCase()),
            ),
          ),
      ) ?? feed[2]

    const openCalls = state.conferences
      .filter((conference) => conference.status !== "closed")
      .slice(0, 2)

    return dailyDigestSchema.parse({
      id: `digest_${slugify(viewer?.handle ?? "guest")}`,
      title: viewer
        ? `Daily briefing for ${viewer.profile.displayName}`
        : "Daily research briefing",
      intro:
        "Papers is designed for signal, not passive scrolling. This briefing prioritizes current relevance, conference momentum, and cross-disciplinary opportunities.",
      generatedAt: nowIso(),
      sections: [
        {
          id: "digest_interest",
          title: "Inside your orbit",
          summary:
            "Papers close to your declared interests, saved topics, and recent social signal.",
          items: insideOrbit.map(
            (entry) => `${entry.paper.title} — ${entry.reasons.slice(0, 2).join(", ")}`,
          ),
        },
        {
          id: "digest_trending",
          title: "Trending right now",
          summary: "Papers with the strongest current social and review momentum.",
          items: trending.map((entry) => `${entry.paper.title} — ${entry.reasons.join(", ")}`),
        },
        {
          id: "digest_adjacent",
          title: "Worth crossing into",
          summary:
            "A paper outside your default lane so discovery stays expansive instead of self-sealing.",
          items: adjacentPaper
            ? [`${adjacentPaper.paper.title} — ${adjacentPaper.paper.abstract}`]
            : [],
        },
        {
          id: "digest_calls",
          title: "Competition and conference momentum",
          summary:
            "Open calls and review deadlines that can move current work into public feedback loops.",
          items: openCalls.map(
            (conference) =>
              `${conference.name} — submissions ${conference.submissionCount}, reviews ${conference.reviewCount}, deadline ${conference.submissionDeadline.slice(0, 10)}`,
          ),
        },
        {
          id: "digest_opportunities",
          title: "Opportunity matches",
          summary:
            "Research opportunities aligned with your interests, plus a deliberate adjacent bet.",
          items: opportunities
            .slice(0, 3)
            .map(
              (opportunity) =>
                `${opportunity.title} — ${opportunity.matchReasons.slice(0, 2).join(", ")}`,
            ),
        },
      ],
    })
  }

  async getOpportunities(viewerHandle?: string | null): Promise<Opportunity[]> {
    const state = await readDemoState()
    const viewer = await this.getViewer(viewerHandle)

    return state.opportunities
      .map((opportunity) => matchOpportunity(opportunity, viewer, state))
      .sort((left, right) => right.matchReasons.length - left.matchReasons.length)
  }
}

export function createRepository(): PapersRepository {
  return new DemoRepository()
}

export async function pingDatabase(
  databaseUrl: string,
): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const { default: pg } = await import("pg")
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 1, connectionTimeoutMillis: 5000 })
  const start = performance.now()
  try {
    const result = await pool.query("SELECT 1 AS ping")
    const latencyMs = Math.round(performance.now() - start)
    return { ok: result.rows[0]?.ping === 1, latencyMs }
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start)
    return { ok: false, latencyMs, error: err instanceof Error ? err.message : String(err) }
  } finally {
    await pool.end()
  }
}
