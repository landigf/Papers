import { createRepository } from "@papers/db"
import { SectionCard } from "@papers/ui"
import { ConferenceCard } from "../../components/conference-card"
import { FeedCard } from "../../components/feed-card"
import { GroupCard } from "../../components/group-card"
import { OpportunityCard } from "../../components/opportunity-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const viewerHandle = await getViewerHandleFromCookies()
  const [feed, allTrending, conferences, opportunities, groups] = await Promise.all([
    repository.getFeed({
      viewerHandle,
      query: params.q,
    }),
    repository.listTrendingPapers({
      viewerHandle,
      limit: 6,
    }),
    repository.listConferences(),
    repository.getOpportunities(viewerHandle),
    repository.listGroups(viewerHandle),
  ])

  const feedPaperIds = new Set(feed.map((entry) => entry.paper.id))
  const trending = allTrending.filter((entry) => !feedPaperIds.has(entry.paper.id)).slice(0, 3)

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Feed" title="Research you care about">
          <form className="search-form" method="GET">
            <input
              defaultValue={params.q ?? ""}
              name="q"
              placeholder="Search by topic, abstract, or title…"
            />
            <button type="submit">Search</button>
          </form>
        </SectionCard>

        {feed.length === 0 ? (
          <div className="empty-state">
            <p>No papers match your search. Try broadening your terms or explore trending work.</p>
          </div>
        ) : (
          <div className="feed-stack">
            {feed.map((entry) => (
              <FeedCard entry={entry} key={entry.id} />
            ))}
          </div>
        )}
      </div>

      <aside className="content-side">
        {trending.length > 0 && (
          <SectionCard eyebrow="Trending" title="Momentum right now">
            <div className="feed-stack">
              {trending.map((entry) => (
                <FeedCard entry={entry} key={entry.id} />
              ))}
            </div>
          </SectionCard>
        )}
        <SectionCard eyebrow="Conferences" title="Open calls">
          <div className="feed-stack">
            {conferences.slice(0, 2).map((conference) => (
              <ConferenceCard conference={conference} key={conference.id} />
            ))}
          </div>
        </SectionCard>
        {groups.length > 0 && (
          <SectionCard eyebrow="Groups" title="Your circles">
            <div className="feed-stack">
              {groups.slice(0, 2).map((group) => (
                <GroupCard group={group} key={group.id} />
              ))}
            </div>
          </SectionCard>
        )}
        <SectionCard eyebrow="Opportunities" title="Serendipity">
          <div className="feed-stack">
            {opportunities.slice(0, 2).map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </SectionCard>
      </aside>
    </div>
  )
}
