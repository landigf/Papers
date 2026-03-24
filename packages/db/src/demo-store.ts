import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { getPapersConfig } from "@papers/config"
import type {
  Comment,
  Conference,
  ConferenceSubmission,
  HousingListing,
  HousingListingKind,
  Opportunity,
  Paper,
  PaperAsset,
  PaperVersion,
  PeerReview,
  Profile,
  PublicPaper,
  RoadmapBucket,
  SavedInterest,
  Topic,
  User,
} from "@papers/contracts"
import { serializePublicPaper, slugify } from "@papers/contracts"

export type DemoState = {
  users: User[]
  papers: Paper[]
  comments: Comment[]
  savedInterests: SavedInterest[]
  roadmap: RoadmapBucket
  conferences: Conference[]
  submissions: ConferenceSubmission[]
  peerReviews: PeerReview[]
  opportunities: Opportunity[]
  housingListings: HousingListing[]
}

function nowIso(): string {
  return new Date().toISOString()
}

function createProfile(input: {
  id: string
  handle: string
  displayName: string
  headline: string
  bio: string
  affiliation: string
  interests: string[]
  orcid?: string | null
  verified?: boolean
}): Profile {
  return {
    id: `profile_${input.id}`,
    handle: input.handle,
    displayName: input.displayName,
    headline: input.headline,
    bio: input.bio,
    affiliation: input.affiliation,
    researchInterests: input.interests,
    orcid: input.orcid ?? null,
    isVerifiedResearcher: input.verified ?? false,
  }
}

function createUser(input: {
  id: string
  email: string
  name: string
  handle: string
  headline: string
  bio: string
  affiliation: string
  interests: string[]
  orcid?: string | null
  verified?: boolean
}): User {
  return {
    id: input.id,
    email: input.email,
    name: input.name,
    handle: input.handle,
    createdAt: nowIso(),
    profile: createProfile({
      id: input.id,
      handle: input.handle,
      displayName: input.name,
      headline: input.headline,
      bio: input.bio,
      affiliation: input.affiliation,
      interests: input.interests,
      orcid: input.orcid,
      verified: input.verified,
    }),
    externalIdentities: input.orcid
      ? [
          {
            id: `ext_${input.id}`,
            provider: "orcid",
            providerUserId: input.orcid,
            linkedAt: nowIso(),
          },
        ]
      : [],
  }
}

function createTopic(label: string): Topic {
  return {
    id: `topic_${slugify(label)}`,
    label,
    slug: slugify(label),
  }
}

function createPaper(input: {
  id: string
  owner: User
  title: string
  abstract: string
  bodyMarkdown: string
  visibilityMode: "public" | "blind"
  topics: Topic[]
  createdAt?: string
  assets?: PaperAsset[]
  starCount?: number
  followerCount?: number
}): Paper {
  const createdAt = input.createdAt ?? nowIso()
  const version: PaperVersion = {
    id: `version_${input.id}`,
    paperId: input.id,
    title: input.title,
    abstract: input.abstract,
    bodyMarkdown: input.bodyMarkdown,
    createdAt,
  }

  return {
    id: input.id,
    slug: slugify(input.title),
    title: input.title,
    abstract: input.abstract,
    bodyMarkdown: input.bodyMarkdown,
    visibilityMode: input.visibilityMode,
    ownerId: input.owner.id,
    publicAuthorProfile: input.visibilityMode === "blind" ? null : input.owner.profile,
    topics: input.topics,
    createdAt,
    updatedAt: createdAt,
    commentCount: 0,
    starCount: input.starCount ?? 0,
    followerCount: input.followerCount ?? 0,
    isStarredByViewer: false,
    isFollowedByViewer: false,
    isSavedByViewer: false,
    latestVersion: version,
    assets: input.assets ?? [],
  }
}

function createConference(input: {
  id: string
  name: string
  organizer: string
  summary: string
  callForPapers: string
  status: Conference["status"]
  submissionDeadline: string
  reviewDeadline: string
  featured?: boolean
  topics: Topic[]
}): Conference {
  return {
    id: input.id,
    slug: slugify(input.name),
    name: input.name,
    organizer: input.organizer,
    summary: input.summary,
    callForPapers: input.callForPapers,
    status: input.status,
    submissionDeadline: input.submissionDeadline,
    reviewDeadline: input.reviewDeadline,
    featured: input.featured ?? false,
    topics: input.topics,
    submissionCount: 0,
    reviewCount: 0,
  }
}

function createOpportunity(input: {
  id: string
  title: string
  organization: string
  kind: Opportunity["kind"]
  mode: Opportunity["mode"]
  location: string
  summary: string
  topics: Topic[]
  url?: string | null
}): Opportunity {
  return {
    id: input.id,
    title: input.title,
    organization: input.organization,
    kind: input.kind,
    mode: input.mode,
    location: input.location,
    summary: input.summary,
    topics: input.topics,
    url: input.url ?? null,
    matchReasons: [],
  }
}

function createHousingListing(input: {
  id: string
  title: string
  kind: HousingListingKind
  neighborhood: string
  city: string
  monthlyRentChf: number
  availableFrom: string
  availableUntil?: string | null
  summary: string
  rooms: number
  furnished: boolean
  url?: string | null
  postedAt?: string
}): HousingListing {
  return {
    id: input.id,
    title: input.title,
    kind: input.kind,
    neighborhood: input.neighborhood,
    city: input.city,
    monthlyRentChf: input.monthlyRentChf,
    availableFrom: input.availableFrom,
    availableUntil: input.availableUntil ?? null,
    summary: input.summary,
    rooms: input.rooms,
    furnished: input.furnished,
    url: input.url ?? null,
    postedAt: input.postedAt ?? nowIso(),
  }
}

function createInitialState(): DemoState {
  const gennaro = createUser({
    id: "user_demo",
    email: "gennaro@papers.dev",
    name: "Gennaro Landi",
    handle: "landigf",
    headline: "Building infrastructure for living research instead of passive self-promotion.",
    bio: "I care about scientific curiosity, collaboration, and making research feel active before it becomes a polished artifact.",
    affiliation: "ETH Zurich",
    interests: ["machine learning systems", "fuzzy logic", "research collaboration", "ai agents"],
    orcid: "0000-0001-2345-6789",
    verified: true,
  })

  const maya = createUser({
    id: "user_maya",
    email: "maya@papers.dev",
    name: "Maya Chen",
    handle: "maya-chen",
    headline: "Systems researcher working on evaluation, observability, and open review.",
    bio: "Interested in reproducibility, evals, and building research tooling that helps ideas mature before a conference deadline.",
    affiliation: "MIT CSAIL",
    interests: ["agents", "distributed systems", "evaluation", "open review"],
    orcid: "0000-0003-2089-1000",
    verified: true,
  })

  const amina = createUser({
    id: "user_amina",
    email: "amina@papers.dev",
    name: "Amina El-Sayed",
    handle: "amina-labs",
    headline: "Working where computational biology, optimization, and collaboration design meet.",
    bio: "I look for research spaces where mixed backgrounds generate stronger questions than narrow specialization alone.",
    affiliation: "EPFL",
    interests: ["computational biology", "optimization", "scientific discovery", "collaboration"],
  })

  const topics = {
    researchCollaboration: createTopic("research collaboration"),
    agents: createTopic("agents"),
    fuzzyLogic: createTopic("fuzzy logic"),
    evaluation: createTopic("evaluation"),
    openReview: createTopic("open review"),
    computationalBiology: createTopic("computational biology"),
    scientificDiscovery: createTopic("scientific discovery"),
    procurementAi: createTopic("procurement ai"),
  }

  const papers = [
    createPaper({
      id: "paper_public_1",
      owner: gennaro,
      title: "Research Should Feel Collaborative Before It Feels Official",
      abstract:
        "A product note on why paper sharing, open problem framing, conferences, and interest-driven discovery should exist outside institutional marketing channels.",
      bodyMarkdown:
        "## Why this exists\n\nResearch collaboration still happens in fragmented places. Papers starts with a feed, paper-first publishing, conferences, and discussion, but the real goal is a living research graph around ideas, people, and opportunities.",
      visibilityMode: "public",
      topics: [topics.researchCollaboration, topics.agents, topics.scientificDiscovery],
      createdAt: "2026-03-23T09:00:00.000Z",
      starCount: 7,
      followerCount: 4,
    }),
    createPaper({
      id: "paper_public_2",
      owner: maya,
      title: "Evaluation Traces for Agentic Systems Without Turning Reviews Into Guesswork",
      abstract:
        "A systems note on using structured traces, validation passes, and review metadata to make research agents easier to compare and debug.",
      bodyMarkdown:
        "## Structured review\n\nIf research systems are going to improve, we need public artifacts that survive beyond a demo. This note proposes structured reviews, explainable traces, and explicit reviewer confidence.",
      visibilityMode: "public",
      topics: [topics.agents, topics.evaluation, topics.openReview],
      createdAt: "2026-03-23T07:30:00.000Z",
      starCount: 9,
      followerCount: 5,
    }),
    createPaper({
      id: "paper_public_3",
      owner: amina,
      title: "Cross-Disciplinary Discovery Needs More Than Following Your Existing Interests",
      abstract:
        "A note on why recommendation systems for researchers should preserve serendipity and cross-domain exposure instead of collapsing everyone into narrow taste bubbles.",
      bodyMarkdown:
        "## Discovery outside your lane\n\nBreakthroughs often happen where fields overlap. Papers should learn what matters to you without sealing you into your current graph.",
      visibilityMode: "public",
      topics: [
        topics.scientificDiscovery,
        topics.computationalBiology,
        topics.researchCollaboration,
      ],
      createdAt: "2026-03-22T15:10:00.000Z",
      starCount: 5,
      followerCount: 3,
    }),
    createPaper({
      id: "paper_blind_1",
      owner: maya,
      title: "Blind Submission Demo: Agent Evaluation Without Identity Leakage",
      abstract:
        "A blind-mode post showing how the product preserves internal ownership while hiding public identity across feed cards, paper pages, conference entries, and comments.",
      bodyMarkdown:
        "## Blind mode\n\nThis post demonstrates the safety boundary. The public page cannot reveal the author, their profile, or linked ORCID identity.",
      visibilityMode: "blind",
      topics: [topics.agents, topics.fuzzyLogic, topics.openReview],
      createdAt: "2026-03-22T18:30:00.000Z",
      starCount: 3,
      followerCount: 0,
    }),
  ]

  function requirePaper(id: string): Paper {
    const paper = papers.find((entry) => entry.id === id)
    if (!paper) {
      throw new Error(`Missing demo paper: ${id}`)
    }
    return paper
  }

  const comments: Comment[] = [
    {
      id: "comment_1",
      paperId: "paper_public_1",
      authorProfile: maya.profile,
      body: "The collaboration angle is strong. The next unlock is letting people publish open problems and reviewer-ready drafts in the same place.",
      createdAt: "2026-03-23T10:15:00.000Z",
      isBlindSafe: true,
    },
    {
      id: "comment_2",
      paperId: "paper_public_2",
      authorProfile: gennaro.profile,
      body: "Reviewer confidence plus trace visibility would already make conference feedback feel much less random.",
      createdAt: "2026-03-23T10:48:00.000Z",
      isBlindSafe: true,
    },
    {
      id: "comment_3",
      paperId: "paper_blind_1",
      authorProfile: null,
      body: "Blind-safe comment rendering is working here: no author identity is visible on the public page or conference workflow.",
      createdAt: "2026-03-23T11:00:00.000Z",
      isBlindSafe: true,
    },
  ]

  const conferences = [
    createConference({
      id: "conf_open_1",
      name: "Open Systems for Science 2026",
      organizer: "Papers Research Collective",
      summary:
        "A conference track for research infrastructure, collaboration tooling, and open review systems that speed up real scientific work.",
      callForPapers:
        "Submit working papers, open problem statements, or infrastructure notes that improve how research is shared, reviewed, or reproduced.",
      status: "open",
      submissionDeadline: "2026-04-05T23:59:00.000Z",
      reviewDeadline: "2026-04-20T23:59:00.000Z",
      featured: true,
      topics: [topics.researchCollaboration, topics.openReview, topics.scientificDiscovery],
    }),
    createConference({
      id: "conf_review_1",
      name: "Blind Review Challenge 2026",
      organizer: "Papers x OpenReview Guild",
      summary:
        "A double-blind-friendly challenge focused on review quality, anonymity safety, and evaluation clarity.",
      callForPapers:
        "Submit blind papers and review them with explicit score, confidence, strengths, and concerns.",
      status: "reviewing",
      submissionDeadline: "2026-03-15T23:59:00.000Z",
      reviewDeadline: "2026-03-30T23:59:00.000Z",
      topics: [topics.openReview, topics.agents, topics.evaluation],
    }),
  ]

  const submissions: ConferenceSubmission[] = [
    {
      id: "submission_public_1",
      conferenceId: "conf_open_1",
      paperId: "paper_public_1",
      paper: getPublicPaper(requirePaper("paper_public_1")),
      status: "submitted",
      submittedAt: "2026-03-23T12:10:00.000Z",
      reviewCount: 0,
      averageScore: null,
    },
    {
      id: "submission_blind_1",
      conferenceId: "conf_review_1",
      paperId: "paper_blind_1",
      paper: getPublicPaper(requirePaper("paper_blind_1")),
      status: "under_review",
      submittedAt: "2026-03-20T09:30:00.000Z",
      reviewCount: 1,
      averageScore: 4,
    },
    {
      id: "submission_public_2",
      conferenceId: "conf_review_1",
      paperId: "paper_public_2",
      paper: getPublicPaper(requirePaper("paper_public_2")),
      status: "under_review",
      submittedAt: "2026-03-19T16:20:00.000Z",
      reviewCount: 1,
      averageScore: 5,
    },
  ]

  const peerReviews: PeerReview[] = [
    {
      id: "review_1",
      conferenceId: "conf_review_1",
      submissionId: "submission_blind_1",
      reviewerProfile: gennaro.profile,
      score: 4,
      confidence: 4,
      summary:
        "Clear contribution and a strong blind-safety demonstration. The next revision should expose more evaluation detail around reviewer workflows.",
      strengths:
        "The paper makes the anonymity boundary tangible and gives a concrete product framing for review quality.",
      concerns:
        "It would benefit from a deeper comparison between reviewer transparency and blind preservation in mixed review settings.",
      recommendation: "weak_accept",
      createdAt: "2026-03-22T21:10:00.000Z",
    },
    {
      id: "review_2",
      conferenceId: "conf_review_1",
      submissionId: "submission_public_2",
      reviewerProfile: amina.profile,
      score: 5,
      confidence: 4,
      summary:
        "Strong systems framing and reviewer confidence modeling. This feels directly useful for both conference review and agent evaluation.",
      strengths:
        "Explicit trace structure, clear use case, and a concrete mechanism for improving review quality.",
      concerns:
        "Would still need user studies or comparative evidence before a full conference-ready version.",
      recommendation: "accept",
      createdAt: "2026-03-22T22:40:00.000Z",
    },
  ]

  const opportunities = [
    createOpportunity({
      id: "opp_1",
      title: "Remote visiting student on agent reliability",
      organization: "MIT CSAIL",
      kind: "visiting_student",
      mode: "remote",
      location: "Cambridge / remote",
      summary:
        "A part-time visiting-student style collaboration around agent reliability, eval traces, and reproducible research tooling.",
      topics: [topics.agents, topics.evaluation, topics.researchCollaboration],
      url: "https://example.org/opportunities/mit-agent-reliability",
    }),
    createOpportunity({
      id: "opp_2",
      title: "Cross-domain collaboration call on fuzzy decision systems",
      organization: "ETH Zurich x Industrial Partners",
      kind: "collaboration",
      mode: "hybrid",
      location: "Zurich",
      summary:
        "Looking for researchers who can connect fuzzy decision models, procurement workflows, and interpretable recommendation systems.",
      topics: [topics.fuzzyLogic, topics.procurementAi, topics.scientificDiscovery],
      url: "https://example.org/opportunities/fuzzy-systems-call",
    }),
    createOpportunity({
      id: "opp_3",
      title: "Interdisciplinary biology + systems internship",
      organization: "EPFL",
      kind: "internship",
      mode: "onsite",
      location: "Lausanne",
      summary:
        "A summer internship exploring discovery tooling for cross-disciplinary research teams in biology and AI systems.",
      topics: [
        topics.computationalBiology,
        topics.scientificDiscovery,
        topics.researchCollaboration,
      ],
      url: "https://example.org/opportunities/epfl-bio-systems",
    }),
  ]

  const housingListings = [
    createHousingListing({
      id: "housing_1",
      title: "Bright 2.5-room apartment near ETH Zentrum",
      kind: "apartment",
      neighborhood: "Universitätstrasse",
      city: "Zürich",
      monthlyRentChf: 1850,
      availableFrom: "2026-07-01",
      availableUntil: null,
      summary:
        "Renovated apartment five minutes from ETH main building. Open kitchen, good natural light, shared laundry in the basement. Ideal for a researcher starting a new position.",
      rooms: 2.5,
      furnished: false,
      url: "https://example.org/housing/eth-zentrum-2-5",
      postedAt: "2026-03-20T10:00:00.000Z",
    }),
    createHousingListing({
      id: "housing_2",
      title: "Furnished sublet in Wiedikon — July to September",
      kind: "sublet",
      neighborhood: "Wiedikon",
      city: "Zürich",
      monthlyRentChf: 1400,
      availableFrom: "2026-07-01",
      availableUntil: "2026-09-30",
      summary:
        "A colleague is away for the summer. Fully furnished 1.5-room flat close to tram 9. Quiet street, good for focused work. Available July through end of September.",
      rooms: 1.5,
      furnished: true,
      url: "https://example.org/housing/wiedikon-sublet-summer",
      postedAt: "2026-03-18T14:30:00.000Z",
    }),
    createHousingListing({
      id: "housing_3",
      title: "Room in shared flat, Oerlikon — researchers preferred",
      kind: "shared_flat",
      neighborhood: "Oerlikon",
      city: "Zürich",
      monthlyRentChf: 980,
      availableFrom: "2026-07-15",
      availableUntil: null,
      summary:
        "Spacious room in a 4-person WG near the S-Bahn. Two current flatmates are PhD students. Shared kitchen and living room. Fast internet included.",
      rooms: 1,
      furnished: true,
      url: "https://example.org/housing/oerlikon-wg-room",
      postedAt: "2026-03-22T08:15:00.000Z",
    }),
    createHousingListing({
      id: "housing_4",
      title: "Studio in Höngg, walking distance to campus",
      kind: "studio",
      neighborhood: "Höngg",
      city: "Zürich",
      monthlyRentChf: 1250,
      availableFrom: "2026-08-01",
      availableUntil: null,
      summary:
        "Compact studio on the Hönggerberg side. 12 minutes on foot to the ETH campus there. Building has a shared bike storage and a quiet courtyard.",
      rooms: 1,
      furnished: false,
      url: "https://example.org/housing/hoengg-studio",
      postedAt: "2026-03-21T16:45:00.000Z",
    }),
    createHousingListing({
      id: "housing_5",
      title: "Temporary summer let near Zürich HB — Aug only",
      kind: "temporary",
      neighborhood: "Langstrasse",
      city: "Zürich",
      monthlyRentChf: 1600,
      availableFrom: "2026-08-01",
      availableUntil: "2026-08-31",
      summary:
        "One-month temporary rental near the main station. Good for someone still looking for permanent housing and needing a base. Furnished, all-inclusive price.",
      rooms: 1.5,
      furnished: true,
      url: "https://example.org/housing/hb-temp-august",
      postedAt: "2026-03-23T11:00:00.000Z",
    }),
  ]

  const papersWithCommentCounts = papers.map((paper) => ({
    ...paper,
    commentCount: comments.filter((comment) => comment.paperId === paper.id).length,
  }))

  const conferencesWithCounts = conferences.map((conference) => ({
    ...conference,
    submissionCount: submissions.filter((submission) => submission.conferenceId === conference.id)
      .length,
    reviewCount: peerReviews.filter((review) => review.conferenceId === conference.id).length,
  }))

  return {
    users: [gennaro, maya, amina],
    papers: papersWithCommentCounts,
    comments,
    savedInterests: [
      {
        id: "interest_1",
        userId: gennaro.id,
        label: "agent evaluation",
        createdAt: nowIso(),
      },
      {
        id: "interest_2",
        userId: gennaro.id,
        label: "scientific collaboration",
        createdAt: nowIso(),
      },
      {
        id: "interest_3",
        userId: gennaro.id,
        label: "fuzzy logic",
        createdAt: nowIso(),
      },
    ],
    roadmap: {
      now: [
        "Web-first publishing, feed, profile, conference, and digest flows.",
        "Deterministic ranking from interests, trends, active discussion, and peer review context.",
      ],
      tonight: [
        "ORCID linking, blind-mode upload hardening, and richer discovery explanations.",
        "Newsletter automation, research opportunities, and conference review loops.",
      ],
      needsDecision: [
        "Moderation escalation policy for abuse, impersonation, and blind submission leaks.",
      ],
      proposedByJarvis: [
        {
          id: "idea_groups",
          label: "Research groups",
          summary: "Private and public circles around labs, interests, or conference tracks.",
        },
        {
          id: "idea_dm",
          label: "Direct messages",
          summary: "Low-friction researcher-to-researcher outreach around shared work.",
        },
        {
          id: "idea_open_problems",
          label: "Open problems",
          summary: "Problem statements, collaborator calls, and early-stage research invites.",
        },
        {
          id: "idea_opportunities",
          label: "Research opportunities",
          summary: "Visiting student, remote collaboration, and lab opportunity matching.",
        },
      ],
    },
    conferences: conferencesWithCounts,
    submissions,
    peerReviews,
    opportunities,
    housingListings,
  }
}

function getStorePath(): string {
  const config = getPapersConfig()
  return path.join(config.PGLITE_DATA_DIR, "demo-store.json")
}

export async function readDemoState(): Promise<DemoState> {
  const filePath = getStorePath()
  await mkdir(path.dirname(filePath), { recursive: true })

  try {
    const raw = await readFile(filePath, "utf8")
    const parsed = JSON.parse(raw) as Partial<DemoState>
    const initial = createInitialState()
    const normalized: DemoState = {
      users: Array.isArray(parsed.users) ? parsed.users : initial.users,
      papers: Array.isArray(parsed.papers) ? parsed.papers : initial.papers,
      comments: Array.isArray(parsed.comments) ? parsed.comments : initial.comments,
      savedInterests: Array.isArray(parsed.savedInterests)
        ? parsed.savedInterests
        : initial.savedInterests,
      roadmap:
        parsed.roadmap &&
        Array.isArray(parsed.roadmap.now) &&
        Array.isArray(parsed.roadmap.tonight) &&
        Array.isArray(parsed.roadmap.needsDecision) &&
        Array.isArray(parsed.roadmap.proposedByJarvis)
          ? parsed.roadmap
          : initial.roadmap,
      conferences: Array.isArray(parsed.conferences) ? parsed.conferences : initial.conferences,
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : initial.submissions,
      peerReviews: Array.isArray(parsed.peerReviews) ? parsed.peerReviews : initial.peerReviews,
      opportunities: Array.isArray(parsed.opportunities)
        ? parsed.opportunities
        : initial.opportunities,
      housingListings: Array.isArray(parsed.housingListings)
        ? parsed.housingListings
        : initial.housingListings,
    }
    await writeFile(filePath, JSON.stringify(normalized, null, 2))
    return normalized
  } catch {
    const initial = createInitialState()
    await writeFile(filePath, JSON.stringify(initial, null, 2))
    return initial
  }
}

export async function writeDemoState(state: DemoState): Promise<void> {
  await mkdir(path.dirname(getStorePath()), { recursive: true })
  await writeFile(getStorePath(), JSON.stringify(state, null, 2))
}

export function getPublicComments(comments: Comment[], paper: Paper): Comment[] {
  if (paper.visibilityMode === "blind") {
    return comments.map((comment) => ({ ...comment, authorProfile: null }))
  }

  return comments
}

export function getPublicPaper(paper: Paper): PublicPaper {
  return serializePublicPaper(paper)
}
