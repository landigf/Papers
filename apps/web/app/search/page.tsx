import { createRepository } from "@papers/db"
import { Pill, SectionCard } from "@papers/ui"
import Link from "next/link"
import { ConferenceCard } from "../../components/conference-card"
import { FeedCard } from "../../components/feed-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const viewerHandle = await getViewerHandleFromCookies()
  const query = params.q?.trim() ?? ""
  const results = query ? await repository.search(query, viewerHandle) : null

  const totalCount = results
    ? results.papers.length +
      results.researchers.length +
      results.topics.length +
      results.conferences.length
    : 0

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Search" title="Find papers, researchers, topics, and conferences">
          <form className="search-form" method="GET">
            <input defaultValue={query} name="q" placeholder="Search across Papers" />
            <button type="submit">Search</button>
          </form>

          {results && totalCount === 0 ? (
            <p>
              No results found for &ldquo;{query}&rdquo;. Try a broader term or browse{" "}
              <Link href="/discover">Discover</Link>.
            </p>
          ) : null}

          {results && results.papers.length > 0 ? (
            <div>
              <h3>Papers ({results.papers.length})</h3>
              <div className="feed-stack">
                {results.papers.map((entry) => (
                  <FeedCard entry={entry} key={entry.id} />
                ))}
              </div>
            </div>
          ) : null}

          {results && results.conferences.length > 0 ? (
            <div>
              <h3>Conferences ({results.conferences.length})</h3>
              <div className="feed-stack">
                {results.conferences.map((conference) => (
                  <ConferenceCard conference={conference} key={conference.id} />
                ))}
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>

      <aside className="content-side">
        {results && results.researchers.length > 0 ? (
          <SectionCard
            eyebrow="Researchers"
            title={`${results.researchers.length} match${results.researchers.length === 1 ? "" : "es"}`}
          >
            <div className="feed-stack">
              {results.researchers.map((profile) => (
                <div className="section-card" key={profile.id}>
                  <Link href={`/u/${profile.handle}`}>
                    <strong>{profile.displayName}</strong>
                  </Link>
                  {profile.affiliation ? <p>{profile.affiliation}</p> : null}
                  <div className="pill-row">
                    {profile.researchInterests.slice(0, 4).map((interest) => (
                      <Pill key={interest}>{interest}</Pill>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {results && results.topics.length > 0 ? (
          <SectionCard
            eyebrow="Topics"
            title={`${results.topics.length} matching topic${results.topics.length === 1 ? "" : "s"}`}
          >
            <div className="feed-stack">
              {results.topics.map((topic) => (
                <div className="section-card" key={topic.id}>
                  <Link href={`/search?q=${encodeURIComponent(topic.label)}`}>
                    <strong>{topic.label}</strong>
                  </Link>
                  <p>
                    {topic.paperCount} paper{topic.paperCount === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {!results ? (
          <SectionCard eyebrow="Discover" title="Not sure what to search?">
            <p>Browse topics, trending researchers, and cross-disciplinary picks.</p>
            <Link className="ghost-link" href="/discover">
              Open Discover
            </Link>
          </SectionCard>
        ) : null}
      </aside>
    </div>
  )
}
