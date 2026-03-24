import { z } from "zod"

export const paperVisibilityModeSchema = z.enum(["public", "blind"])
export type PaperVisibilityMode = z.infer<typeof paperVisibilityModeSchema>

export const topicSchema = z.object({
  id: z.string(),
  label: z.string(),
  slug: z.string(),
})
export type Topic = z.infer<typeof topicSchema>

export const profileSchema = z.object({
  id: z.string(),
  handle: z.string(),
  displayName: z.string(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  affiliation: z.string().nullable(),
  researchInterests: z.array(z.string()),
  orcid: z.string().nullable(),
  isVerifiedResearcher: z.boolean(),
})
export type Profile = z.infer<typeof profileSchema>

export const externalIdentitySchema = z.object({
  id: z.string(),
  provider: z.enum(["orcid"]),
  providerUserId: z.string(),
  linkedAt: z.string(),
})
export type ExternalIdentity = z.infer<typeof externalIdentitySchema>

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  handle: z.string(),
  createdAt: z.string(),
  profile: profileSchema,
  externalIdentities: z.array(externalIdentitySchema),
})
export type User = z.infer<typeof userSchema>

export const paperAssetSchema = z.object({
  id: z.string(),
  paperId: z.string(),
  storageKey: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  fileSizeBytes: z.number().int().nonnegative(),
  uploadedAt: z.string(),
  isMetadataScrubbed: z.boolean(),
})
export type PaperAsset = z.infer<typeof paperAssetSchema>

export const paperVersionSchema = z.object({
  id: z.string(),
  paperId: z.string(),
  title: z.string(),
  abstract: z.string(),
  bodyMarkdown: z.string(),
  createdAt: z.string(),
})
export type PaperVersion = z.infer<typeof paperVersionSchema>

export const paperSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  abstract: z.string(),
  bodyMarkdown: z.string(),
  visibilityMode: paperVisibilityModeSchema,
  ownerId: z.string(),
  publicAuthorProfile: profileSchema.nullable(),
  topics: z.array(topicSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  commentCount: z.number().int().nonnegative(),
  starCount: z.number().int().nonnegative(),
  followerCount: z.number().int().nonnegative(),
  isStarredByViewer: z.boolean(),
  isFollowedByViewer: z.boolean(),
  isSavedByViewer: z.boolean(),
  latestVersion: paperVersionSchema,
  assets: z.array(paperAssetSchema),
})
export type Paper = z.infer<typeof paperSchema>

export const publicPaperSchema = paperSchema.extend({
  ownerId: z.string().nullable(),
  publicAuthorProfile: profileSchema.nullable(),
})
export type PublicPaper = z.infer<typeof publicPaperSchema>

export const commentSchema = z.object({
  id: z.string(),
  paperId: z.string(),
  authorProfile: profileSchema.nullable(),
  body: z.string(),
  createdAt: z.string(),
  isBlindSafe: z.boolean(),
})
export type Comment = z.infer<typeof commentSchema>

export const followSchema = z.object({
  id: z.string(),
  followerId: z.string(),
  targetProfileId: z.string(),
  createdAt: z.string(),
})
export type Follow = z.infer<typeof followSchema>

export const starSchema = z.object({
  id: z.string(),
  userId: z.string(),
  paperId: z.string(),
  createdAt: z.string(),
})
export type Star = z.infer<typeof starSchema>

export const savedInterestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  label: z.string(),
  createdAt: z.string(),
})
export type SavedInterest = z.infer<typeof savedInterestSchema>

export const moderationFlagSchema = z.object({
  id: z.string(),
  paperId: z.string().nullable(),
  commentId: z.string().nullable(),
  reason: z.string(),
  status: z.enum(["open", "reviewing", "resolved"]),
  createdAt: z.string(),
})
export type ModerationFlag = z.infer<typeof moderationFlagSchema>

export const feedEntrySchema = z.object({
  id: z.string(),
  paper: publicPaperSchema,
  score: z.number(),
  reasons: z.array(z.string()),
})
export type FeedEntry = z.infer<typeof feedEntrySchema>

export const createPaperInputSchema = z.object({
  title: z.string().min(8).max(160),
  abstract: z.string().min(40).max(4000),
  bodyMarkdown: z.string().min(80).max(50000),
  topicLabels: z.array(z.string()).max(8),
  visibilityMode: paperVisibilityModeSchema,
})
export type CreatePaperInput = z.infer<typeof createPaperInputSchema>

export const createCommentInputSchema = z.object({
  paperId: z.string(),
  body: z.string().min(3).max(2000),
})
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>

export const saveInterestInputSchema = z.object({
  label: z.string().min(2).max(80),
})
export type SaveInterestInput = z.infer<typeof saveInterestInputSchema>

export const providerTaskKindSchema = z.enum([
  "tag-extraction",
  "summary-refinement",
  "interest-explanation",
  "opportunity-summary",
])
export type ProviderTaskKind = z.infer<typeof providerTaskKindSchema>

export const safeAiPayloadSchema = z.object({
  task: providerTaskKindSchema,
  isBlindContent: z.boolean(),
  containsPrivateDraft: z.boolean(),
  text: z.string().min(1),
})
export type SafeAiPayload = z.infer<typeof safeAiPayloadSchema>

export const opportunityIdeaSchema = z.object({
  id: z.string(),
  label: z.string(),
  summary: z.string(),
})
export type OpportunityIdea = z.infer<typeof opportunityIdeaSchema>

export const roadmapBucketSchema = z.object({
  now: z.array(z.string()),
  tonight: z.array(z.string()),
  needsDecision: z.array(z.string()),
  proposedByJarvis: z.array(opportunityIdeaSchema),
})
export type RoadmapBucket = z.infer<typeof roadmapBucketSchema>

export const conferenceStatusSchema = z.enum(["open", "reviewing", "closed"])
export type ConferenceStatus = z.infer<typeof conferenceStatusSchema>

export const submissionStatusSchema = z.enum([
  "submitted",
  "under_review",
  "accepted",
  "waitlist",
  "rejected",
])
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>

export const reviewRecommendationSchema = z.enum([
  "accept",
  "weak_accept",
  "borderline",
  "weak_reject",
  "reject",
])
export type ReviewRecommendation = z.infer<typeof reviewRecommendationSchema>

export const conferenceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  organizer: z.string(),
  summary: z.string(),
  callForPapers: z.string(),
  status: conferenceStatusSchema,
  submissionDeadline: z.string(),
  reviewDeadline: z.string(),
  featured: z.boolean(),
  topics: z.array(topicSchema),
  submissionCount: z.number().int().nonnegative(),
  reviewCount: z.number().int().nonnegative(),
})
export type Conference = z.infer<typeof conferenceSchema>

export const conferenceSubmissionSchema = z.object({
  id: z.string(),
  conferenceId: z.string(),
  paperId: z.string(),
  paper: publicPaperSchema,
  status: submissionStatusSchema,
  submittedAt: z.string(),
  reviewCount: z.number().int().nonnegative(),
  averageScore: z.number().nullable(),
})
export type ConferenceSubmission = z.infer<typeof conferenceSubmissionSchema>

export const peerReviewSchema = z.object({
  id: z.string(),
  conferenceId: z.string(),
  submissionId: z.string(),
  reviewerProfile: profileSchema.nullable(),
  score: z.number().int().min(1).max(5),
  confidence: z.number().int().min(1).max(5),
  summary: z.string(),
  strengths: z.string(),
  concerns: z.string(),
  recommendation: reviewRecommendationSchema,
  createdAt: z.string(),
})
export type PeerReview = z.infer<typeof peerReviewSchema>

export const opportunityKindSchema = z.enum([
  "visiting_student",
  "internship",
  "collaboration",
  "call_for_papers",
])
export type OpportunityKind = z.infer<typeof opportunityKindSchema>

export const opportunityModeSchema = z.enum(["remote", "onsite", "hybrid"])
export type OpportunityMode = z.infer<typeof opportunityModeSchema>

export const opportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  organization: z.string(),
  kind: opportunityKindSchema,
  mode: opportunityModeSchema,
  location: z.string(),
  summary: z.string(),
  topics: z.array(topicSchema),
  url: z.string().nullable(),
  matchReasons: z.array(z.string()),
})
export type Opportunity = z.infer<typeof opportunitySchema>

export const housingListingKindSchema = z.enum([
  "apartment",
  "shared_flat",
  "studio",
  "sublet",
  "temporary",
])
export type HousingListingKind = z.infer<typeof housingListingKindSchema>

export const housingListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: housingListingKindSchema,
  neighborhood: z.string(),
  city: z.string(),
  monthlyRentChf: z.number().int().nonnegative(),
  availableFrom: z.string(),
  availableUntil: z.string().nullable(),
  summary: z.string(),
  rooms: z.number().nonnegative(),
  furnished: z.boolean(),
  url: z.string().nullable(),
  postedAt: z.string(),
})
export type HousingListing = z.infer<typeof housingListingSchema>

export const dailyDigestSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  items: z.array(z.string()),
})
export type DailyDigestSection = z.infer<typeof dailyDigestSectionSchema>

export const dailyDigestSchema = z.object({
  id: z.string(),
  title: z.string(),
  intro: z.string(),
  generatedAt: z.string(),
  sections: z.array(dailyDigestSectionSchema),
})
export type DailyDigest = z.infer<typeof dailyDigestSchema>

export function serializePublicPaper(paper: Paper): PublicPaper {
  if (paper.visibilityMode === "blind") {
    return {
      ...paper,
      ownerId: null,
      publicAuthorProfile: null,
      comments: undefined,
    } as PublicPaper
  }

  return {
    ...paper,
    ownerId: null,
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const updateViewerProfileInputSchema = z.object({
  headline: z.string().max(160),
  bio: z.string().max(2000),
  affiliation: z.string().max(160),
  interestLabels: z.array(z.string().min(2).max(80)).max(12),
})
export type UpdateViewerProfileInput = z.infer<typeof updateViewerProfileInputSchema>

export const submitPaperToConferenceInputSchema = z.object({
  conferenceSlug: z.string().min(1),
  paperSlug: z.string().min(1),
})
export type SubmitPaperToConferenceInput = z.infer<typeof submitPaperToConferenceInputSchema>

export const createPeerReviewInputSchema = z.object({
  conferenceSlug: z.string().min(1),
  submissionId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  confidence: z.number().int().min(1).max(5),
  summary: z.string().min(12).max(800),
  strengths: z.string().min(12).max(2000),
  concerns: z.string().min(12).max(2000),
  recommendation: reviewRecommendationSchema,
})
export type CreatePeerReviewInput = z.infer<typeof createPeerReviewInputSchema>
