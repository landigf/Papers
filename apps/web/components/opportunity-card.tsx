import type { Opportunity } from "@papers/contracts"
import { Pill, SectionCard } from "@papers/ui"
import Link from "next/link"

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <SectionCard eyebrow={opportunity.kind.replaceAll("_", " ")} title={opportunity.title}>
      <p>
        <strong>{opportunity.organization}</strong> · {opportunity.mode} · {opportunity.location}
      </p>
      <p>{opportunity.summary}</p>
      <div className="pill-row">
        {opportunity.topics.map((topic) => (
          <Pill key={topic.id}>{topic.label}</Pill>
        ))}
      </div>
      <ul className="reason-list">
        {opportunity.matchReasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      {opportunity.postedByProfile ? (
        <p className="ghost-link">
          Posted by{" "}
          <Link href={`/u/${opportunity.postedByProfile.handle}`}>
            {opportunity.postedByProfile.displayName}
          </Link>
          {opportunity.postedByProfile.affiliation
            ? ` · ${opportunity.postedByProfile.affiliation}`
            : null}
        </p>
      ) : null}
      {opportunity.url ? (
        <a className="ghost-link" href={opportunity.url} rel="noreferrer" target="_blank">
          Open opportunity
        </a>
      ) : null}
    </SectionCard>
  )
}
