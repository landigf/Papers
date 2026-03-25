import type { Group } from "@papers/contracts"
import { Pill, SectionCard } from "@papers/ui"
import Link from "next/link"

export function GroupCard({ group }: { group: Group }) {
  return (
    <SectionCard
      eyebrow={group.visibility === "private" ? "Private group" : "Group"}
      title={group.name}
    >
      <p>{group.description}</p>
      <div className="inline-stats">
        <span>{group.memberCount} members</span>
        <span>{group.paperCount} papers</span>
        <span>{group.announcementCount} announcements</span>
      </div>
      {group.topics.length > 0 && (
        <div className="pill-row">
          {group.topics.map((topic) => (
            <Pill key={topic.id}>{topic.label}</Pill>
          ))}
        </div>
      )}
      <Link className="ghost-link" href={`/groups/${group.slug}`}>
        Open group
      </Link>
    </SectionCard>
  )
}
