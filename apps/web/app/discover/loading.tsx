import { SectionCard } from "@papers/ui"

export default function DiscoverLoading() {
  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Discover" title="Explore trending research">
          <div className="feed-stack">
            <div className="skeleton-block" style={{ height: 96 }} />
            <div className="skeleton-block" style={{ height: 96 }} />
            <div className="skeleton-block" style={{ height: 96 }} />
            <div className="skeleton-block" style={{ height: 96 }} />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
