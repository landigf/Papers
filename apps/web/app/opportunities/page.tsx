import { createRepository } from "@papers/db"
import { OpportunityCard } from "../../components/opportunity-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function OpportunitiesPage() {
  const opportunities = await repository.getOpportunities(await getViewerHandleFromCookies())

  return (
    <div className="content-columns">
      <div className="content-main">
        <div className="feed-stack">
          {opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
        {opportunities.length === 0 && (
          <p className="muted-copy">
            No opportunities matched yet. Save some interests to improve matches.
          </p>
        )}
      </div>
    </div>
  )
}
