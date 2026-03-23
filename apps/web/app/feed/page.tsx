import type { DiscoverySortMode } from "@papers/contracts"
import { createRepository } from "@papers/db"
import { Pill, SectionCard } from "@papers/ui"
import Link from "next/link"
import { FeedCard } from "../../components/feed-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

const SORT_OPTIONS: { value: DiscoverySortMode; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Popular" },
]

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; topic?: string | string[]; sort?: string }>
}) {
  const params = await searchParams
  const viewerHandle = await getViewerHandleFromCookies()

  const topicSlugs = params.topic
    ? Array.isArray(params.topic)
      ? params.topic
      : [params.topic]
    : undefined

  const sort = SORT_OPTIONS.find((o) => o.value === params.sort)?.value ?? "relevance"

  const result = await repository.searchPapers(
    {
      query: params.q || undefined,
      filters: topicSlugs ? { topicSlugs } : undefined,
      sort,
    },
    viewerHandle,
  )

  function buildUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string> = {}
    if (params.q) base.q = params.q
    if (params.sort) base.sort = params.sort
    if (topicSlugs?.length) base.topic = topicSlugs[0] ?? ""
    const merged = { ...base, ...overrides }
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) {
      if (v) qs.set(k, v)
    }
    const str = qs.toString()
    return str ? `/feed?${str}` : "/feed"
  }

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
            {topicSlugs?.map((slug) => (
              <input key={slug} name="topic" type="hidden" value={slug} />
            ))}
            {sort !== "relevance" ? <input name="sort" type="hidden" value={sort} /> : null}
            <button type="submit">Search</button>
          </form>

          <div className="pill-row" style={{ marginTop: "0.5rem" }}>
            {SORT_OPTIONS.map((option) => (
              <Link
                className={`ghost-link${sort === option.value ? " pill-active" : ""}`}
                href={buildUrl({ sort: option.value === "relevance" ? undefined : option.value })}
                key={option.value}
              >
                {option.label}
              </Link>
            ))}
          </div>

          {result.availableTopics.length > 0 ? (
            <div className="pill-row" style={{ marginTop: "0.5rem" }}>
              {topicSlugs?.length ? (
                <Link className="ghost-link" href={buildUrl({ topic: undefined })}>
                  All topics
                </Link>
              ) : null}
              {result.availableTopics.map((topic) => {
                const isActive = topicSlugs?.includes(topic.slug)
                return (
                  <Link
                    className={`ghost-link${isActive ? " pill-active" : ""}`}
                    href={buildUrl({
                      topic: isActive ? undefined : topic.slug,
                    })}
                    key={topic.id}
                  >
                    <Pill>{topic.label}</Pill>
                  </Link>
                )
              })}
            </div>
          ) : null}

          <div className="feed-stack">
            {result.entries.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No papers match your search.</p>
            ) : null}
            {result.entries.map((entry) => (
              <FeedCard entry={entry} key={entry.id} />
            ))}
          </div>

          {result.total > result.entries.length ? (
            <p style={{ opacity: 0.6, marginTop: "0.5rem" }}>
              Showing {result.entries.length} of {result.total} results
            </p>
          ) : null}
        </SectionCard>
      </div>
    </div>
  )
}
