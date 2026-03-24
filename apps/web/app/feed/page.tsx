import { createRepository } from "@papers/db"
import { SectionCard } from "@papers/ui"
import { ConferenceCard } from "../../components/conference-card"
import { FeedCard } from "../../components/feed-card"
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
  const [feed, trending, recommendations, conferences, opportunities] = await Promise.all([
    repository.getFeed({
      viewerHandle,
      query: params.q,
    }),
    repository.listTrendingPapers({
      viewerHandle,
      limit: 3,
    }),
    repository.getRecommendations(viewerHandle),
    repository.listConferences(),
    repository.getOpportunities(viewerHandle),
  ])

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Feed" title="Research you may actually care about">
          <form className="search-form" method="GET">
            <input
              defaultValue={params.q ?? ""}
              name="q"
              placeholder="Search by topic, abstract, or title"
            />
            <button type="submit">Search</button>
          </form>
          <div className="feed-stack">
            {feed.map((entry) => (
              <FeedCard entry={entry} key={entry.id} />
            ))}
          </div>
        </SectionCard>
      </div>
      <aside className="content-side">
        <SectionCard eyebrow="Trending" title="Momentum right now">
          <div className="feed-stack">
            {trending.map((entry) => (
              <FeedCard entry={entry} key={entry.id} />
            ))}
          </div>
        </SectionCard>
        {recommendations.length > 0 && (
          <SectionCard eyebrow="Recommended" title="Based on your network">
            <div className="feed-stack">
              {recommendations.map((entry) => (
                <FeedCard entry={entry} key={entry.id} />
              ))}
            </div>
          </SectionCard>
        )}
        <SectionCard eyebrow="Conferences" title="Where feedback is happening">
          <div className="feed-stack">
            {conferences.slice(0, 2).map((conference) => (
              <ConferenceCard conference={conference} key={conference.id} />
            ))}
          </div>
        </SectionCard>
        <SectionCard eyebrow="Opportunities" title="Keep some serendipity">
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
