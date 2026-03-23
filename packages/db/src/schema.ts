import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const authUsers = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const authSessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
)

export const authAccounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("account_provider_account_idx").on(table.providerId, table.accountId),
    index("account_user_id_idx").on(table.userId),
  ],
)

export const authVerifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const profiles = pgTable(
  "profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    handle: text("handle").notNull(),
    displayName: text("display_name").notNull(),
    headline: text("headline"),
    bio: text("bio"),
    affiliation: text("affiliation"),
    researchInterests: text("research_interests").array().notNull().default([]),
    orcid: text("orcid"),
    isVerifiedResearcher: boolean("is_verified_researcher").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("profile_handle_idx").on(table.handle),
    uniqueIndex("profile_user_idx").on(table.userId),
  ],
)

export const topics = pgTable(
  "topic",
  {
    id: text("id").primaryKey(),
    label: text("label").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("topic_slug_idx").on(table.slug)],
)

export const papers = pgTable(
  "paper",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    abstract: text("abstract").notNull(),
    bodyMarkdown: text("body_markdown").notNull(),
    visibilityMode: text("visibility_mode").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("paper_slug_idx").on(table.slug),
    index("paper_owner_idx").on(table.ownerId),
  ],
)

export const paperVersions = pgTable(
  "paper_version",
  {
    id: text("id").primaryKey(),
    paperId: text("paper_id")
      .notNull()
      .references(() => papers.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    abstract: text("abstract").notNull(),
    bodyMarkdown: text("body_markdown").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("paper_version_paper_idx").on(table.paperId)],
)

export const paperAssets = pgTable(
  "paper_asset",
  {
    id: text("id").primaryKey(),
    paperId: text("paper_id")
      .notNull()
      .references(() => papers.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    isMetadataScrubbed: boolean("is_metadata_scrubbed").notNull().default(false),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("paper_asset_paper_idx").on(table.paperId)],
)

export const paperTopics = pgTable(
  "paper_topic",
  {
    paperId: text("paper_id")
      .notNull()
      .references(() => papers.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.paperId, table.topicId] })],
)

export const comments = pgTable(
  "comment",
  {
    id: text("id").primaryKey(),
    paperId: text("paper_id")
      .notNull()
      .references(() => papers.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("comment_paper_idx").on(table.paperId)],
)

export const follows = pgTable(
  "follow",
  {
    id: text("id").primaryKey(),
    followerId: text("follower_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    targetProfileId: text("target_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("follow_unique_idx").on(table.followerId, table.targetProfileId)],
)

export const stars = pgTable(
  "star",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    paperId: text("paper_id")
      .notNull()
      .references(() => papers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("star_unique_idx").on(table.userId, table.paperId)],
)

export const savedInterests = pgTable(
  "saved_interest",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("saved_interest_unique_idx").on(table.userId, table.label)],
)

export const moderationFlags = pgTable(
  "moderation_flag",
  {
    id: text("id").primaryKey(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    paperId: text("paper_id").references(() => papers.id, { onDelete: "cascade" }),
    commentId: text("comment_id").references(() => comments.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("moderation_flag_status_idx").on(table.status),
    index("moderation_flag_reporter_idx").on(table.reporterId),
  ],
)

export const conferences = pgTable(
  "conference",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    organizer: text("organizer").notNull(),
    summary: text("summary").notNull(),
    callForPapers: text("call_for_papers").notNull(),
    status: text("status").notNull(),
    submissionDeadline: timestamp("submission_deadline", { withTimezone: true }).notNull(),
    reviewDeadline: timestamp("review_deadline", { withTimezone: true }).notNull(),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("conference_slug_idx").on(table.slug)],
)

export const conferenceTopics = pgTable(
  "conference_topic",
  {
    conferenceId: text("conference_id")
      .notNull()
      .references(() => conferences.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.conferenceId, table.topicId] })],
)

export const conferenceSubmissions = pgTable(
  "conference_submission",
  {
    id: text("id").primaryKey(),
    conferenceId: text("conference_id")
      .notNull()
      .references(() => conferences.id, { onDelete: "cascade" }),
    paperId: text("paper_id")
      .notNull()
      .references(() => papers.id, { onDelete: "cascade" }),
    submitterId: text("submitter_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("submitted"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("conference_submission_unique_idx").on(table.conferenceId, table.paperId),
    index("conference_submission_conference_idx").on(table.conferenceId),
  ],
)

export const peerReviews = pgTable(
  "peer_review",
  {
    id: text("id").primaryKey(),
    conferenceId: text("conference_id")
      .notNull()
      .references(() => conferences.id, { onDelete: "cascade" }),
    submissionId: text("submission_id")
      .notNull()
      .references(() => conferenceSubmissions.id, { onDelete: "cascade" }),
    reviewerId: text("reviewer_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    confidence: integer("confidence").notNull(),
    summary: text("summary").notNull(),
    strengths: text("strengths").notNull(),
    concerns: text("concerns").notNull(),
    recommendation: text("recommendation").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("peer_review_submission_idx").on(table.submissionId)],
)

export const researchOpportunities = pgTable(
  "research_opportunity",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    organization: text("organization").notNull(),
    kind: text("kind").notNull(),
    mode: text("mode").notNull(),
    location: text("location").notNull(),
    summary: text("summary").notNull(),
    url: text("url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("research_opportunity_kind_idx").on(table.kind)],
)
