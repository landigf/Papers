import type { DailyDigestSection } from "@papers/contracts"
import { SectionCard } from "@papers/ui"

export function DigestSectionCard({ section }: { section: DailyDigestSection }) {
  return (
    <SectionCard eyebrow="Daily digest" title={section.title}>
      <p>{section.summary}</p>
      <ul className="reason-list">
        {section.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </SectionCard>
  )
}
