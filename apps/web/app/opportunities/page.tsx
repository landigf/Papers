import { createRepository } from "@papers/db"
import { SectionCard } from "@papers/ui"
import { OpportunityCard } from "../../components/opportunity-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function OpportunitiesPage() {
  const opportunities = await repository.getOpportunities(await getViewerHandleFromCookies())

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard
          eyebrow="Opportunities"
          title="Research positions, collaborations, and open calls"
        >
          <p>
            Matched to your declared interests. Includes deliberate adjacent bets so discovery stays
            expansive.
          </p>
        </SectionCard>
        <div className="feed-stack">
          {opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      </div>
    </div>
  )
}
