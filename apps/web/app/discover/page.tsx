import { createRepository } from "@papers/db"
import { Pill, SectionCard } from "@papers/ui"
import Link from "next/link"
import { FeedCard } from "../../components/feed-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function DiscoverPage() {
  const viewerHandle = await getViewerHandleFromCookies()

  const [trending, recentResult, popularResult] = await Promise.all([
    repository.getTrendingTopics(8),
    repository.searchPapers({ sort: "recent", limit: 5 }, viewerHandle),
    repository.searchPapers({ sort: "popular", limit: 5 }, viewerHandle),
  ])

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Discover" title="Explore research by topic and trend">
          {trending.length > 0 ? (
            <>
              <h3>Trending topics</h3>
              <div className="pill-row">
                {trending.map((topic) => (
                  <Link href={`/feed?topic=${topic.slug}`} key={topic.id}>
                    <Pill>
                      {topic.label} ({topic.paperCount})
                    </Pill>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </SectionCard>

        <SectionCard eyebrow="Recent" title="Latest papers">
          <div className="feed-stack">
            {recentResult.entries.map((entry) => (
              <FeedCard entry={entry} key={entry.id} />
            ))}
          </div>
          <Link className="ghost-link" href="/feed?sort=recent">
            See all recent papers
          </Link>
        </SectionCard>

        <SectionCard eyebrow="Popular" title="Most discussed and starred">
          <div className="feed-stack">
            {popularResult.entries.map((entry) => (
              <FeedCard entry={entry} key={entry.id} />
            ))}
          </div>
          <Link className="ghost-link" href="/feed?sort=popular">
            See all popular papers
          </Link>
        </SectionCard>
      </div>
    </div>
  )
}
