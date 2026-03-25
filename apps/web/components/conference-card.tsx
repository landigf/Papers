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
      <div className="inline-stats">
        <span>{conference.status.replaceAll("_", " ")}</span>
        <span>{conference.submissionCount} submissions</span>
        <span>{conference.reviewCount} reviews</span>
      </div>
      <p className="field-note">
        Deadline {conference.submissionDeadline.slice(0, 10)} · Review by{" "}
        {conference.reviewDeadline.slice(0, 10)}
      </p>
      {conference.topics.length > 0 && (
        <div className="pill-row">
          {conference.topics.map((topic) => (
            <Pill key={topic.id}>{topic.label}</Pill>
          ))}
        </div>
      )}
      <Link className="ghost-link" href={`/conferences/${conference.slug}`}>
        Open conference
      </Link>
    </SectionCard>
  )
}
