import { createRepository } from "@papers/db"
import { HousingCard } from "../../components/housing-card"

const repository = createRepository()

export default async function HousingPage() {
  const listings = await repository.getHousingListings({ availableBy: "2026-08-31" })

  return (
    <div className="content-columns">
      <div className="content-main">
        <h1>Housing in Zürich</h1>
        <p className="section-intro">
          Apartments, sublets, and shared flats available from July — targeted at researchers
          relocating to the Zürich area.
        </p>
        <div className="feed-stack">
          {listings.map((listing) => (
            <HousingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  )
}
