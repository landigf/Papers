import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { getPapersConfig } from "@papers/config"
import type {
  Comment,
  Conference,
  ConferenceSubmission,
  Group,
  GroupAnnouncement,
  GroupMember,
  GroupReadingListItem,
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
  groups: Group[]
  groupMembers: GroupMember[]
  groupAnnouncements: GroupAnnouncement[]
  groupReadingListItems: GroupReadingListItem[]
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

function createGroup(input: {
  id: string
  name: string
  description: string
  visibility: Group["visibility"]
  createdBy: User
  topics: Topic[]
}): Group {
  return {
    id: input.id,
    slug: slugify(input.name),
    name: input.name,
    description: input.description,
    visibility: input.visibility,
    createdBy: input.createdBy.profile,
    topics: input.topics,
    memberCount: 0,
    paperCount: 0,
    announcementCount: 0,
    isViewerMember: false,
    createdAt: nowIso(),
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

  const demoGroups = [
    createGroup({
      id: "group_ml_systems",
      name: "ML Systems Lab Circle",
      description:
        "A working group for researchers building and evaluating machine learning systems, agents, and infrastructure. Share drafts, reading lists, and open problems.",
      visibility: "public",
      createdBy: gennaro,
      topics: [topics.agents, topics.evaluation, topics.researchCollaboration],
    }),
    createGroup({
      id: "group_bio_discovery",
      name: "Computational Biology Discovery",
      description:
        "Cross-disciplinary circle connecting computational biology, optimization, and scientific discovery. Private space for early-stage ideas and collaboration.",
      visibility: "private",
      createdBy: amina,
      topics: [topics.computationalBiology, topics.scientificDiscovery],
    }),
  ]

  const demoGroupMembers: GroupMember[] = [
    {
      id: "gm_1",
      groupId: "group_ml_systems",
      userId: gennaro.id,
      profile: gennaro.profile,
      role: "admin",
      joinedAt: "2026-03-23T09:00:00.000Z",
    },
    {
      id: "gm_2",
      groupId: "group_ml_systems",
      userId: maya.id,
      profile: maya.profile,
      role: "member",
      joinedAt: "2026-03-23T09:30:00.000Z",
    },
    {
      id: "gm_3",
      groupId: "group_ml_systems",
      userId: amina.id,
      profile: amina.profile,
      role: "member",
      joinedAt: "2026-03-23T10:00:00.000Z",
    },
    {
      id: "gm_4",
      groupId: "group_bio_discovery",
      userId: amina.id,
      profile: amina.profile,
      role: "admin",
      joinedAt: "2026-03-22T14:00:00.000Z",
    },
    {
      id: "gm_5",
      groupId: "group_bio_discovery",
      userId: gennaro.id,
      profile: gennaro.profile,
      role: "member",
      joinedAt: "2026-03-22T15:00:00.000Z",
    },
  ]

  const demoGroupAnnouncements: GroupAnnouncement[] = [
    {
      id: "gann_1",
      groupId: "group_ml_systems",
      authorProfile: gennaro.profile,
      title: "Welcome to the ML Systems Lab Circle",
      body: "This is a space for sharing working papers, reading lists, and open questions around ML systems, agents, and evaluation. Post early-stage ideas and let the group give feedback before conference deadlines.",
      createdAt: "2026-03-23T09:05:00.000Z",
    },
    {
      id: "gann_2",
      groupId: "group_ml_systems",
      authorProfile: maya.profile,
      title: "Reading list: agent evaluation baselines",
      body: "I added two papers to the shared reading list that cover structured evaluation traces and reviewer confidence modeling. Would love to discuss at next week's sync.",
      createdAt: "2026-03-23T11:00:00.000Z",
    },
    {
      id: "gann_3",
      groupId: "group_bio_discovery",
      authorProfile: amina.profile,
      title: "Circle kickoff: computational biology meets optimization",
      body: "Starting this private circle for early-stage collaboration between biology and optimization researchers. Feel free to add papers to the reading list and post open problems.",
      createdAt: "2026-03-22T14:05:00.000Z",
    },
  ]

  const demoGroupReadingListItems: GroupReadingListItem[] = [
    {
      id: "grli_1",
      groupId: "group_ml_systems",
      paperId: "paper_public_2",
      paper: getPublicPaper(requirePaper("paper_public_2")),
      addedBy: maya.profile,
      note: "Foundational for our discussion on structured evaluation traces.",
      addedAt: "2026-03-23T11:05:00.000Z",
    },
    {
      id: "grli_2",
      groupId: "group_ml_systems",
      paperId: "paper_public_1",
      paper: getPublicPaper(requirePaper("paper_public_1")),
      addedBy: gennaro.profile,
      note: "Context on why collaboration-first matters for this group.",
      addedAt: "2026-03-23T09:10:00.000Z",
    },
    {
      id: "grli_3",
      groupId: "group_bio_discovery",
      paperId: "paper_public_3",
      paper: getPublicPaper(requirePaper("paper_public_3")),
      addedBy: amina.profile,
      note: "Cross-disciplinary discovery — directly relevant to our circle mission.",
      addedAt: "2026-03-22T14:10:00.000Z",
    },
  ]

  const groupsWithCounts = demoGroups.map((group) => ({
    ...group,
    memberCount: demoGroupMembers.filter((m) => m.groupId === group.id).length,
    paperCount: demoGroupReadingListItems.filter((i) => i.groupId === group.id).length,
    announcementCount: demoGroupAnnouncements.filter((a) => a.groupId === group.id).length,
  }))

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
    groups: groupsWithCounts,
    groupMembers: demoGroupMembers,
    groupAnnouncements: demoGroupAnnouncements,
    groupReadingListItems: demoGroupReadingListItems,
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
      groups: Array.isArray(parsed.groups) ? parsed.groups : initial.groups,
      groupMembers: Array.isArray(parsed.groupMembers) ? parsed.groupMembers : initial.groupMembers,
      groupAnnouncements: Array.isArray(parsed.groupAnnouncements)
        ? parsed.groupAnnouncements
        : initial.groupAnnouncements,
      groupReadingListItems: Array.isArray(parsed.groupReadingListItems)
        ? parsed.groupReadingListItems
        : initial.groupReadingListItems,
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
