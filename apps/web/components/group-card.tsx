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
      <div className="pill-row">
        <Pill>{group.memberCount} members</Pill>
        <Pill>{group.paperCount} papers</Pill>
        <Pill>{group.announcementCount} announcements</Pill>
      </div>
      <div className="pill-row">
        {group.topics.map((topic) => (
          <Pill key={topic.id}>{topic.label}</Pill>
        ))}
      </div>
      <Link className="ghost-link" href={`/groups/${group.slug}`}>
        Open group
      </Link>
    </SectionCard>
  )
}
