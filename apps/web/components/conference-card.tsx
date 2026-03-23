import type { Conference } from "@papers/contracts"
import { Pill, SectionCard } from "@papers/ui"
import Link from "next/link"

export function ConferenceCard({ conference }: { conference: Conference }) {
  return (
    <SectionCard
      eyebrow={conference.featured ? "Featured conference" : "Conference"}
      title={conference.name}
    >
      <p>{conference.summary}</p>
      <div className="pill-row">
        <Pill>{conference.status.replaceAll("_", " ")}</Pill>
        <Pill>{conference.submissionCount} submissions</Pill>
        <Pill>{conference.reviewCount} reviews</Pill>
      </div>
      <p className="muted-copy">
        Submission deadline {conference.submissionDeadline.slice(0, 10)}. Review deadline{" "}
        {conference.reviewDeadline.slice(0, 10)}.
      </p>
      <div className="pill-row">
        {conference.topics.map((topic) => (
          <Pill key={topic.id}>{topic.label}</Pill>
        ))}
      </div>
      <Link className="ghost-link" href={`/conferences/${conference.slug}`}>
        Open conference
      </Link>
    </SectionCard>
  )
}
