import { SectionCard } from "@papers/ui"

export default function NewPaperLoading() {
  return (
    <div className="content-columns">
      <div className="content-main">
        <div className="skeleton-block" style={{ height: 400 }} />
      </div>
      <aside className="content-side">
        <SectionCard eyebrow="Safety" title="Blind mode rules">
          <ul className="reason-list">
            <li>No public author name or profile link.</li>
            <li>No ORCID exposure on the paper page or feed card.</li>
            <li>No comment-author identity on blind threads.</li>
            <li>No blind content is sent to Grok.</li>
          </ul>
        </SectionCard>
      </aside>
    </div>
  )
}
