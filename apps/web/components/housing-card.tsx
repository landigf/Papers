import type { HousingListing } from "@papers/contracts"
import { SectionCard } from "@papers/ui"

export function HousingCard({ listing }: { listing: HousingListing }) {
  const kindLabel = listing.kind.replaceAll("_", " ")
  const dateRange = listing.availableUntil
    ? `${listing.availableFrom} → ${listing.availableUntil}`
    : `from ${listing.availableFrom}`

  return (
    <SectionCard eyebrow={kindLabel} title={listing.title}>
      <p>
        <strong>{listing.neighborhood}</strong>, {listing.city} · {listing.rooms} room
        {listing.rooms !== 1 ? "s" : ""} · {listing.furnished ? "furnished" : "unfurnished"}
      </p>
      <p className="rent-highlight">CHF {listing.monthlyRentChf}/month</p>
      <p>{listing.summary}</p>
      <p className="date-range">{dateRange}</p>
      {listing.url ? (
        <a className="ghost-link" href={listing.url} rel="noreferrer" target="_blank">
          View listing
        </a>
      ) : null}
    </SectionCard>
  )
}
