import type { FeedEntry } from "@papers/contracts"
import { ActionButton, Pill, SectionCard } from "@papers/ui"
import Link from "next/link"
import { toggleStarAction } from "../app/actions"

export function FeedCard({ entry }: { entry: FeedEntry }) {
  return (
    <SectionCard
      eyebrow={entry.paper.visibilityMode === "blind" ? "Blind post" : "Public post"}
      title={entry.paper.title}
    >
      <div className="feed-card-meta">
        <div className="feed-card-author">
          {entry.paper.publicAuthorProfile ? (
            <Link href={`/u/${entry.paper.publicAuthorProfile.handle}`}>
              {entry.paper.publicAuthorProfile.displayName}
            </Link>
          ) : (
            <span>Blind submission</span>
          )}
        </div>
        <div className="feed-card-actions">
          <form action={toggleStarAction}>
            <input name="paperSlug" type="hidden" value={entry.paper.slug} />
            <ActionButton type="submit">
              {entry.paper.isStarredByViewer ? "Unstar" : "Star"} {entry.paper.starCount}
            </ActionButton>
          </form>
          <Link className="ghost-link" href={`/papers/${entry.paper.slug}`}>
            Open
          </Link>
        </div>
      </div>
      <p>{entry.paper.abstract}</p>
      <div className="pill-row">
        {entry.paper.topics.map((topic) => (
          <Pill key={topic.id}>{topic.label}</Pill>
        ))}
      </div>
      <ul className="reason-list">
        {entry.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </SectionCard>
  )
}
