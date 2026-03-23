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

export function serializePublicPaper(paper: Paper): PublicPaper {
  if (paper.visibilityMode === "blind") {
    return {
      ...paper,
      publicAuthorProfile: null,
      comments: undefined,
    } as PublicPaper
  }

  return paper
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
