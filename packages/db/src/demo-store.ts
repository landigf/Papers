import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { getPapersConfig } from "@papers/config"
import type {
  Comment,
  Conference,
  ConferenceSubmission,
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

  const raj = createUser({
    id: "user_raj",
    email: "raj@papers.dev",
    name: "Raj Patel",
    handle: "raj-patel",
    headline: "Reinforcement learning for science, not just games.",
    bio: "Studying how RL-based experiment planning can speed up wet-lab iteration cycles. Previously at DeepMind.",
    affiliation: "University of Cambridge",
    interests: ["reinforcement learning", "experiment design", "scientific discovery", "agents"],
    orcid: "0000-0002-8811-3456",
    verified: true,
  })

  const lena = createUser({
    id: "user_lena",
    email: "lena@papers.dev",
    name: "Lena Kowalski",
    handle: "lena-k",
    headline: "Making peer review a research problem instead of an afterthought.",
    bio: "Working on review quality metrics, calibration models, and incentive design for open science. Believer in structured disagreement.",
    affiliation: "Max Planck Institute",
    interests: ["open review", "evaluation", "incentive design", "reproducibility"],
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
    reinforcementLearning: createTopic("reinforcement learning"),
    experimentDesign: createTopic("experiment design"),
    reproducibility: createTopic("reproducibility"),
    incentiveDesign: createTopic("incentive design"),
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
    createPaper({
      id: "paper_public_4",
      owner: raj,
      title: "RL-Guided Experiment Design: Letting the Agent Pick the Next Wet-Lab Run",
      abstract:
        "A framework for using reinforcement learning to prioritize experiments in biology and materials science, reducing wasted cycles and accelerating hypothesis refinement.",
      bodyMarkdown:
        "## Why RL for experiments\n\nTraditional experiment planning relies on researcher intuition and grid search. By framing each experiment as a step in an MDP, we can train policies that propose higher-value experiments earlier.\n\n## Setup\n\nWe model the experiment space as a contextual bandit with delayed rewards. The agent observes previous results and proposes the next assay or parameter sweep.\n\n## Early results\n\nOn simulated wet-lab benchmarks, RL-guided planning reduces the number of experiments needed to reach target accuracy by 35-40%.",
      visibilityMode: "public",
      topics: [topics.reinforcementLearning, topics.experimentDesign, topics.scientificDiscovery],
      createdAt: "2026-03-23T11:20:00.000Z",
      starCount: 6,
      followerCount: 2,
    }),
    createPaper({
      id: "paper_public_5",
      owner: lena,
      title: "Reviewer Calibration Is a Research Problem We Keep Ignoring",
      abstract:
        "An analysis of how uncalibrated reviewers distort conference outcomes and a proposal for lightweight calibration rounds that improve score consistency without adding reviewer burden.",
      bodyMarkdown:
        "## The calibration gap\n\nReviewers at the same conference routinely disagree on score meaning. A '3' from one reviewer is a '5' from another. This is a solvable problem.\n\n## Proposed fix\n\nBefore the main review phase, run a 15-minute calibration round where reviewers score 2-3 reference papers with known consensus ranges. Use the delta to adjust scores during aggregation.\n\n## Why this matters\n\nBetter calibration means fewer false rejections, less randomness in acceptance, and more trust in the review process.",
      visibilityMode: "public",
      topics: [topics.openReview, topics.evaluation, topics.incentiveDesign],
      createdAt: "2026-03-23T08:45:00.000Z",
      starCount: 11,
      followerCount: 6,
    }),
    createPaper({
      id: "paper_public_6",
      owner: gennaro,
      title: "Fuzzy Preference Aggregation for Multi-Stakeholder Research Prioritization",
      abstract:
        "A method for combining imprecise stakeholder preferences using fuzzy set theory to rank research directions when priorities conflict and data is incomplete.",
      bodyMarkdown:
        "## Problem\n\nResearch teams face prioritization decisions where stakeholders have vague, overlapping, and sometimes contradictory preferences. Classical voting and ranking methods break down.\n\n## Approach\n\nWe model each stakeholder's preference as a fuzzy membership function over candidate research directions, then aggregate using OWA operators that balance consensus and coverage.\n\n## Application\n\nTested on a simulated research lab with 5 PIs and 20 candidate projects. Fuzzy aggregation produced rankings that all PIs rated as 'fair' more often than majority voting or Borda count.",
      visibilityMode: "public",
      topics: [topics.fuzzyLogic, topics.researchCollaboration, topics.scientificDiscovery],
      createdAt: "2026-03-22T20:00:00.000Z",
      starCount: 4,
      followerCount: 2,
    }),
    createPaper({
      id: "paper_blind_2",
      owner: raj,
      title: "Reproducibility Debt in Agent Benchmarks: A Quantitative Audit",
      abstract:
        "A blind submission auditing 12 popular agent benchmarks for reproducibility gaps, finding that 7 out of 12 cannot be independently reproduced within one standard deviation of claimed performance.",
      bodyMarkdown:
        "## Audit methodology\n\nWe attempted to independently reproduce the headline results of 12 agent benchmarks published between 2024 and 2026, using only the artifacts and instructions provided in the original papers.\n\n## Findings\n\n7 of 12 benchmarks had reproducibility gaps exceeding 1 standard deviation. Common causes: undocumented hyperparameters, missing seed specifications, and reliance on deprecated API endpoints.\n\n## Recommendation\n\nBenchmark papers should include a reproducibility checklist and deposit frozen environments alongside their results.",
      visibilityMode: "blind",
      topics: [topics.agents, topics.evaluation, topics.reproducibility],
      createdAt: "2026-03-23T06:00:00.000Z",
      starCount: 8,
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
    {
      id: "comment_4",
      paperId: "paper_public_4",
      authorProfile: amina.profile,
      body: "The contextual bandit framing is clever. Have you considered how this transfers to domains where experiment cost varies by orders of magnitude?",
      createdAt: "2026-03-23T12:30:00.000Z",
      isBlindSafe: true,
    },
    {
      id: "comment_5",
      paperId: "paper_public_4",
      authorProfile: gennaro.profile,
      body: "This connects well to the fuzzy prioritization angle. If you model experiment value as a fuzzy quantity, the RL agent could handle uncertainty more gracefully.",
      createdAt: "2026-03-23T13:00:00.000Z",
      isBlindSafe: true,
    },
    {
      id: "comment_6",
      paperId: "paper_public_5",
      authorProfile: maya.profile,
      body: "The calibration round idea is exactly what conference organizers avoid because they think it adds friction. But 15 minutes up front could save hours of meta-review debates.",
      createdAt: "2026-03-23T09:30:00.000Z",
      isBlindSafe: true,
    },
    {
      id: "comment_7",
      paperId: "paper_public_5",
      authorProfile: gennaro.profile,
      body: "Would be great to see this integrated into Papers' own conference workflow as a calibration step before the main review opens.",
      createdAt: "2026-03-23T10:00:00.000Z",
      isBlindSafe: true,
    },
    {
      id: "comment_8",
      paperId: "paper_public_6",
      authorProfile: raj.profile,
      body: "The OWA operator choice is interesting. Does the fairness property hold when stakeholder preferences are adversarial rather than just vague?",
      createdAt: "2026-03-23T00:15:00.000Z",
      isBlindSafe: true,
    },
    {
      id: "comment_9",
      paperId: "paper_blind_2",
      authorProfile: null,
      body: "This audit is overdue. The missing seed specifications alone explain half the variance in agent leaderboards.",
      createdAt: "2026-03-23T08:00:00.000Z",
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
    createConference({
      id: "conf_repro_1",
      name: "Reproducibility in AI Research 2026",
      organizer: "Cambridge ML Society x Papers",
      summary:
        "A workshop track dedicated to reproducibility audits, benchmark reliability, and methods for making research artifacts independently verifiable.",
      callForPapers:
        "We welcome reproducibility case studies, negative results, benchmark audits, and tooling for experiment tracking. Both public and blind submissions accepted.",
      status: "open",
      submissionDeadline: "2026-04-15T23:59:00.000Z",
      reviewDeadline: "2026-05-01T23:59:00.000Z",
      featured: true,
      topics: [topics.reproducibility, topics.evaluation, topics.agents],
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
    {
      id: "submission_public_5",
      conferenceId: "conf_open_1",
      paperId: "paper_public_5",
      paper: getPublicPaper(requirePaper("paper_public_5")),
      status: "submitted",
      submittedAt: "2026-03-23T09:00:00.000Z",
      reviewCount: 0,
      averageScore: null,
    },
    {
      id: "submission_blind_2",
      conferenceId: "conf_repro_1",
      paperId: "paper_blind_2",
      paper: getPublicPaper(requirePaper("paper_blind_2")),
      status: "submitted",
      submittedAt: "2026-03-23T07:00:00.000Z",
      reviewCount: 0,
      averageScore: null,
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
    createOpportunity({
      id: "opp_4",
      title: "Open call for papers on review calibration methods",
      organization: "Max Planck Institute",
      kind: "call_for_papers",
      mode: "remote",
      location: "Munich / remote",
      summary:
        "Seeking empirical studies and tooling proposals for improving peer review calibration in ML venues. Both positive and negative results welcome.",
      topics: [topics.openReview, topics.evaluation, topics.incentiveDesign],
      url: "https://example.org/opportunities/mpi-review-calibration",
    }),
    createOpportunity({
      id: "opp_5",
      title: "RL for scientific experimentation collaboration",
      organization: "University of Cambridge",
      kind: "collaboration",
      mode: "hybrid",
      location: "Cambridge",
      summary:
        "Looking for co-investigators to extend RL-based experiment planning to real wet-lab settings in chemistry and materials science.",
      topics: [topics.reinforcementLearning, topics.experimentDesign, topics.scientificDiscovery],
      url: "https://example.org/opportunities/cambridge-rl-experiments",
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
    users: [gennaro, maya, amina, raj, lena],
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
        {
          id: "idea_calibration",
          label: "Review calibration rounds",
          summary:
            "Pre-review calibration step where reviewers score reference papers to normalize scoring before the main review opens.",
        },
        {
          id: "idea_reading_lists",
          label: "Reading lists",
          summary:
            "Curated, shareable paper collections around themes, courses, or research questions.",
        },
        {
          id: "idea_citation_graph",
          label: "Citation graph",
          summary:
            "Visual map of how papers on the platform reference and build on each other, surfacing intellectual lineage.",
        },
      ],
    },
    conferences: conferencesWithCounts,
    submissions,
    peerReviews,
    opportunities,
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
