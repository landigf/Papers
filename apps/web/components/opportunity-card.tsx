import type { Opportunity } from "@papers/contracts"
import { Pill, SectionCard } from "@papers/ui"

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
      {opportunity.url ? (
        <a className="ghost-link" href={opportunity.url} rel="noreferrer" target="_blank">
          Open opportunity
        </a>
      ) : null}
    </SectionCard>
  )
}
