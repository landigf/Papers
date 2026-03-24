"use client"

import { SectionCard } from "@papers/ui"

export default function SearchError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Search" title="Something went wrong">
          <p>We couldn't load search results right now.</p>
          <button className="action-button" onClick={reset} type="button">
            Try again
          </button>
        </SectionCard>
      </div>
    </div>
  )
}
