import { SectionCard } from "@papers/ui"

export default function FeedLoading() {
  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Feed" title="Research you may actually care about">
          <div className="skeleton-block" style={{ height: 40 }} />
          <div className="feed-stack">
            <div className="skeleton-block" style={{ height: 96 }} />
            <div className="skeleton-block" style={{ height: 96 }} />
            <div className="skeleton-block" style={{ height: 96 }} />
            <div className="skeleton-block" style={{ height: 96 }} />
          </div>
        </SectionCard>
      </div>
      <aside className="content-side">
        <SectionCard eyebrow="Trending" title="Momentum right now">
          <div className="feed-stack">
            <div className="skeleton-block" style={{ height: 64 }} />
            <div className="skeleton-block" style={{ height: 64 }} />
            <div className="skeleton-block" style={{ height: 64 }} />
          </div>
        </SectionCard>
      </aside>
    </div>
  )
}
