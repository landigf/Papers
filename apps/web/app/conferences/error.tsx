"use client"

import { SectionCard } from "@papers/ui"

export default function ConferencesError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Conferences" title="Something went wrong">
          <p>We couldn't load conferences right now.</p>
          <button className="action-button" onClick={reset} type="button">
            Try again
          </button>
        </SectionCard>
      </div>
    </div>
  )
}
