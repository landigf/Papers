export default function NewPaperLoading() {
  return (
    <div className="content-columns">
      <div className="content-main">
        <div className="section-card">
          <div className="skeleton skeleton-eyebrow" />
          <div className="skeleton skeleton-heading" />
          <div className="section-content" style={{ display: "grid", gap: 14 }}>
            <div className="skeleton skeleton-input" />
            <div className="skeleton skeleton-textarea-sm" />
            <div className="skeleton skeleton-textarea-lg" />
            <div className="skeleton skeleton-input" />
            <div className="skeleton skeleton-input" style={{ maxWidth: 220 }} />
            <div className="skeleton skeleton-text" style={{ maxWidth: 400 }} />
            <div className="skeleton skeleton-button" />
          </div>
        </div>
      </div>
      <aside className="content-side">
        <div className="section-card">
          <div className="skeleton skeleton-eyebrow" />
          <div className="skeleton skeleton-heading" />
          <div className="section-content" style={{ display: "grid", gap: 10 }}>
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" style={{ maxWidth: "85%" }} />
            <div className="skeleton skeleton-text" style={{ maxWidth: "90%" }} />
            <div className="skeleton skeleton-text" style={{ maxWidth: "70%" }} />
          </div>
        </div>
      </aside>
    </div>
  )
}
