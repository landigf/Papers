import { createRepository } from "@papers/db"
import { SectionCard } from "@papers/ui"
import Link from "next/link"
import { OpportunityCard } from "../../components/opportunity-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; mode?: string; location?: string }>
}) {
  const params = await searchParams
  const viewerHandle = await getViewerHandleFromCookies()
  const opportunities = await repository.getOpportunities(viewerHandle, {
    kind: params.kind,
    mode: params.mode,
    location: params.location,
  })

  const activeKind = params.kind ?? ""
  const activeMode = params.mode ?? ""

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Opportunity board" title="Open positions, visits, and collaborations">
          <p>
            Post and discover research opportunities — open positions, visiting researcher slots,
            internships, and collaboration requests. Filter by type, mode, or location.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
            <Link className="primary-link" href="/opportunities/new">
              Post an opportunity
            </Link>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Filters" title="Narrow results">
          <form className="stacked-form" method="GET">
            <label>
              Type
              <select defaultValue={activeKind} name="kind">
                <option value="">All types</option>
                <option value="open_position">Open position</option>
                <option value="visiting_researcher">Visiting researcher</option>
                <option value="visiting_student">Visiting student</option>
                <option value="internship">Internship</option>
                <option value="collaboration">Collaboration</option>
                <option value="call_for_papers">Call for papers</option>
              </select>
            </label>
            <label>
              Mode
              <select defaultValue={activeMode} name="mode">
                <option value="">All modes</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
            <label>
              Location
              <input
                defaultValue={params.location ?? ""}
                name="location"
                placeholder="e.g. Zurich, Cambridge, remote"
              />
            </label>
            <button className="action-button" type="submit">
              Apply filters
            </button>
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Results"
          title={`${opportunities.length} opportunit${opportunities.length === 1 ? "y" : "ies"}`}
        >
          <div className="feed-stack">
            {opportunities.length === 0 ? (
              <p>No opportunities match your filters. Try broadening your search.</p>
            ) : (
              opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
