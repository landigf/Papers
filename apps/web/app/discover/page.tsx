import { createRepository } from "@papers/db"
import { Pill, SectionCard } from "@papers/ui"
import Link from "next/link"
import { FeedCard } from "../../components/feed-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function DiscoverPage() {
  const viewerHandle = await getViewerHandleFromCookies()
  const sections = await repository.getDiscoverSections(viewerHandle)

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Discover" title="Browse topics across Papers">
          <form className="search-form" method="GET" action="/search">
            <input name="q" placeholder="Search papers, researchers, topics" />
            <button type="submit">Search</button>
          </form>
          <div className="feed-stack">
            {sections.trendingTopics.map((group) => (
              <div className="section-card" key={group.topic.id}>
                <div className="section-eyebrow">
                  {group.paperCount} paper{group.paperCount === 1 ? "" : "s"}
                </div>
                <h3>
                  <Link href={`/search?q=${encodeURIComponent(group.topic.label)}`}>
                    {group.topic.label}
                  </Link>
                </h3>
                {group.recentPapers.length > 0 ? (
                  <ul className="reason-list">
                    {group.recentPapers.map((paper) => (
                      <li key={paper.slug}>
                        <Link href={`/papers/${paper.slug}`}>{paper.title}</Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>

        {sections.crossDisciplinaryPicks.length > 0 ? (
          <SectionCard eyebrow="Cross-disciplinary" title="Outside your usual lane">
            <p>
              Papers from topics you haven&rsquo;t explored yet, chosen to keep discovery expansive.
            </p>
            <div className="feed-stack">
              {sections.crossDisciplinaryPicks.map((entry) => (
                <FeedCard entry={entry} key={entry.id} />
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>

      <aside className="content-side">
        <SectionCard eyebrow="Active researchers" title="Publishing on Papers">
          <div className="feed-stack">
            {sections.activeResearchers.map((researcher) => (
              <div className="section-card" key={researcher.id}>
                <Link href={`/u/${researcher.handle}`}>
                  <strong>{researcher.displayName}</strong>
                </Link>
                {researcher.affiliation ? <p>{researcher.affiliation}</p> : null}
                <p>
                  {researcher.recentPaperCount} public paper
                  {researcher.recentPaperCount === 1 ? "" : "s"}
                </p>
                <div className="pill-row">
                  {researcher.researchInterests.slice(0, 4).map((interest) => (
                    <Pill key={interest}>{interest}</Pill>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Quick search" title="Jump to a topic">
          <div className="pill-row">
            {sections.trendingTopics.map((group) => (
              <Link
                href={`/search?q=${encodeURIComponent(group.topic.label)}`}
                key={group.topic.id}
              >
                <Pill>{group.topic.label}</Pill>
              </Link>
            ))}
          </div>
        </SectionCard>
      </aside>
    </div>
  )
}
