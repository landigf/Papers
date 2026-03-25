import type { FeedEntry } from "@papers/contracts"
import { Avatar, Pill, StatBadge } from "@papers/ui"
import Link from "next/link"
import { toggleStarAction } from "../app/actions"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function FeedCard({ entry }: { entry: FeedEntry }) {
  const author = entry.paper.publicAuthorProfile
  const isBlind = entry.paper.visibilityMode === "blind"

  return (
    <div className="feed-card">
      {/* LinkedIn-style author header */}
      <div className="feed-card-header">
        {isBlind ? (
          <Avatar name="?" size="sm" />
        ) : author ? (
          <Link href={`/u/${author.handle}`}>
            <Avatar name={author.displayName} size="sm" />
          </Link>
        ) : null}
        <div className="feed-card-author-info">
          <span className="feed-card-author-name">
            {isBlind ? (
              "Anonymous (blind review)"
            ) : author ? (
              <Link href={`/u/${author.handle}`}>{author.displayName}</Link>
            ) : (
              "Unknown"
            )}
          </span>
          <span className="feed-card-author-detail">
            {!isBlind && author?.affiliation ? `${author.affiliation} · ` : ""}
            {timeAgo(entry.paper.createdAt)}
          </span>
        </div>
      </div>

      {/* Paper content */}
      <div className="feed-card-title">
        <Link href={`/papers/${entry.paper.slug}`}>{entry.paper.title}</Link>
      </div>
      <div className="feed-card-abstract">{entry.paper.abstract}</div>

      {entry.paper.topics.length > 0 && (
        <div className="pill-row">
          {entry.paper.topics.map((topic) => (
            <Pill key={topic.id}>{topic.label}</Pill>
          ))}
        </div>
      )}

      {/* Social bar (LinkedIn-style) */}
      <div className="social-bar">
        <form action={toggleStarAction}>
          <input name="paperSlug" type="hidden" value={entry.paper.slug} />
          <button
            className={`social-bar-item ${entry.paper.isStarredByViewer ? "active" : ""}`}
            type="submit"
          >
            {entry.paper.isStarredByViewer ? "★" : "☆"} {entry.paper.starCount}
          </button>
        </form>
        <Link className="social-bar-item" href={`/papers/${entry.paper.slug}#comments`}>
          💬 {entry.paper.commentCount}
        </Link>
        <div className="social-bar-spacer" />
        <Link className="social-bar-item" href={`/papers/${entry.paper.slug}`}>
          Open →
        </Link>
      </div>
    </div>
  )
}
