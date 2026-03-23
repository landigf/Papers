import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { getPapersConfig } from "@papers/config"
import type {
  Comment,
  Paper,
  PaperAsset,
  PaperVersion,
  Profile,
  PublicPaper,
  RoadmapBucket,
  SavedInterest,
  Topic,
  User,
} from "@papers/contracts"
import { serializePublicPaper, slugify } from "@papers/contracts"

type DemoState = {
  users: User[]
  papers: Paper[]
  comments: Comment[]
  savedInterests: SavedInterest[]
  roadmap: RoadmapBucket
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
    starCount: 0,
    followerCount: 0,
    isStarredByViewer: false,
    isFollowedByViewer: false,
    isSavedByViewer: false,
    latestVersion: version,
    assets: input.assets ?? [],
  }
}

function createInitialState(): DemoState {
  const demoUser = createUser({
    id: "user_demo",
    email: "gennaro@papers.dev",
    name: "Gennaro Landi",
    handle: "landigf",
    headline: "Building a place where research feels alive again.",
    bio: "I care about open collaboration, real feedback, and not turning research into LinkedIn theater.",
    affiliation: "ETH Zurich",
    interests: ["machine learning systems", "fuzzy logic", "research collaboration", "ai agents"],
    orcid: "0000-0001-2345-6789",
    verified: true,
  })

  const secondUser = createUser({
    id: "user_maya",
    email: "maya@papers.dev",
    name: "Maya Chen",
    handle: "maya-chen",
    headline: "Systems researcher exploring agent reliability and evaluation.",
    bio: "Interested in reproducibility, evals, and lightweight collaboration around evolving research ideas.",
    affiliation: "MIT CSAIL",
    interests: ["agents", "distributed systems", "evaluation"],
  })

  const topics = [
    createTopic("research collaboration"),
    createTopic("agents"),
    createTopic("procurement ai"),
    createTopic("fuzzy logic"),
  ]

  const papers = [
    createPaper({
      id: "paper_public_1",
      owner: demoUser,
      title: "Research Should Feel Collaborative Before It Feels Official",
      abstract:
        "A product note on why paper sharing, open problem framing, and interest-driven discovery should exist outside institutional marketing channels.",
      bodyMarkdown:
        "## Why this exists\n\nResearch collaboration still happens in fragmented places. Papers starts with a feed, public posts, and discussion, but the real goal is a living research graph around ideas and people.",
      visibilityMode: "public",
      topics: [topics[0], topics[1]],
      createdAt: "2026-03-23T09:00:00.000Z",
    }),
    createPaper({
      id: "paper_blind_1",
      owner: secondUser,
      title: "Blind Submission Demo: Agent Evaluation Without Identity Leakage",
      abstract:
        "A blind-mode post showing how the product preserves internal ownership while hiding public identity across feed cards, paper pages, and comments.",
      bodyMarkdown:
        "## Blind mode\n\nThis post demonstrates the safety boundary. The public page cannot reveal the author, their profile, or linked ORCID identity.",
      visibilityMode: "blind",
      topics: [topics[1], topics[3]],
      createdAt: "2026-03-22T18:30:00.000Z",
    }),
  ]

  const comments: Comment[] = [
    {
      id: "comment_1",
      paperId: "paper_public_1",
      authorProfile: secondUser.profile,
      body: "The part about discovery matching feels strong. The next unlock is exposing open problems and collaborator intent directly on the paper.",
      createdAt: "2026-03-23T10:15:00.000Z",
      isBlindSafe: true,
    },
    {
      id: "comment_2",
      paperId: "paper_blind_1",
      authorProfile: null,
      body: "Blind-safe comment rendering is working here: no author identity is visible on the public page.",
      createdAt: "2026-03-23T11:00:00.000Z",
      isBlindSafe: true,
    },
  ]

  return {
    users: [demoUser, secondUser],
    papers: papers.map((paper) => ({
      ...paper,
      commentCount: comments.filter((comment) => comment.paperId === paper.id).length,
    })),
    comments,
    savedInterests: [
      {
        id: "interest_1",
        userId: demoUser.id,
        label: "agent evaluation",
        createdAt: nowIso(),
      },
      {
        id: "interest_2",
        userId: demoUser.id,
        label: "scientific collaboration",
        createdAt: nowIso(),
      },
    ],
    roadmap: {
      now: [
        "Repo bootstrap, auth/profile, paper post model, and the first feed shell.",
        "Deterministic ranking from follows, topics, and social actions.",
      ],
      tonight: [
        "ORCID linking and blind-mode enforcement.",
        "Comments, search, and discovery skeleton.",
      ],
      needsDecision: [
        "Moderation escalation policy for abuse, impersonation, and blind submission leaks.",
      ],
      proposedByJarvis: [
        {
          id: "idea_groups",
          label: "Research groups",
          summary: "Private and public research circles around labs, interests, or paper threads.",
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
    return JSON.parse(raw) as DemoState
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
