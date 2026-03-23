import { createRepository } from "@papers/db"
import { SectionCard } from "@papers/ui"
import { FeedCard } from "../../components/feed-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const viewerHandle = await getViewerHandleFromCookies()
  const feed = await repository.getFeed({
    viewerHandle,
    query: params.q,
  })

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
    </div>
  )
}
