import { SectionCard } from "@papers/ui"

export default function SearchLoading() {
  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Search" title="Find papers, authors, and topics">
          <div className="skeleton-block" style={{ height: 40 }} />
          <div className="feed-stack">
            <div className="skeleton-block" style={{ height: 96 }} />
            <div className="skeleton-block" style={{ height: 96 }} />
            <div className="skeleton-block" style={{ height: 96 }} />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
