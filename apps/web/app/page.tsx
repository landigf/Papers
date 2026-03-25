import { createRepository } from "@papers/db"
import { ActionButton, Pill, SectionCard } from "@papers/ui"
import Link from "next/link"
import { ConferenceCard } from "../components/conference-card"
import { DigestSectionCard } from "../components/digest-section-card"
import { FeedCard } from "../components/feed-card"
import { OpportunityCard } from "../components/opportunity-card"
import { getSessionContext } from "../lib/viewer"
import { saveInterestAction } from "./actions"

const repository = createRepository()

export default async function HomePage() {
  const session = await getSessionContext()
  const [roadmap, feed, allTrending, conferences, digest, opportunities] = await Promise.all([
    repository.getRoadmap(),
    repository.getFeed({
      viewerHandle: session.viewer?.handle,
    }),
    repository.listTrendingPapers({
      viewerHandle: session.viewer?.handle,
      limit: 6,
    }),
    repository.listConferences(),
    repository.getDailyDigest(session.viewer?.handle),
    repository.getOpportunities(session.viewer?.handle),
  ])

  const feedPaperIds = new Set(feed.map((entry) => entry.paper.id))
  const trending = allTrending.filter((entry) => !feedPaperIds.has(entry.paper.id)).slice(0, 3)

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-kicker">Research sharing, without the noise</span>
          <h1>Publish. Review. Discover. Collaborate.</h1>
          <p>
            Papers combines the best of arXiv (preprint hosting, BibTeX citations, categories),
            LinkedIn (professional profiles, social feed, connections), and GitHub (stars,
            discussions, version history) — purpose-built for researchers.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/feed">
              Explore the feed
            </Link>
            <Link className="secondary-link" href="/papers/new">
              Publish a paper
            </Link>
            <Link className="secondary-link" href="/conferences">
              Conferences
            </Link>
          </div>
          {session.viewer ? (
            <div className="pill-row" style={{ marginTop: "14px" }}>
              {session.viewer.profile.researchInterests.map((interest) => (
                <Pill key={interest}>{interest}</Pill>
              ))}
            </div>
          ) : null}
        </div>
        <div className="hero-side">
          <SectionCard
            eyebrow="Session"
            title={session.viewer ? session.viewer.profile.displayName : "Guest"}
          >
            <p>
              {session.viewer
                ? `${session.viewer.profile.headline ?? "Research profile ready."}`
                : "Sign in to follow researchers, save interests, and publish on Papers."}
            </p>
            <div className="pill-row">
              <Pill>{session.authMode} mode</Pill>
              <Pill>{session.orcid.configured ? "ORCID ready" : "ORCID pending config"}</Pill>
              <Pill>
                {conferences.filter((conference) => conference.status === "open").length} open calls
              </Pill>
            </div>
          </SectionCard>
        </div>
      </section>

      <div className="content-columns">
        <div className="content-main">
          <SectionCard eyebrow="Latest" title="Recent papers">
            <div className="feed-stack">
              {feed.slice(0, 3).map((entry) => (
                <FeedCard entry={entry} key={entry.id} />
              ))}
            </div>
            <Link className="ghost-link" href="/feed" style={{ marginTop: "12px", display: "inline-block" }}>
              View full feed →
            </Link>
          </SectionCard>

          {trending.length > 0 && (
            <SectionCard eyebrow="Trending" title="Gaining momentum">
              <div className="feed-stack">
                {trending.map((entry) => (
                  <FeedCard entry={entry} key={entry.id} />
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard eyebrow="Conferences" title="Calls for papers">
            <div className="feed-stack">
              {conferences.slice(0, 2).map((conference) => (
                <ConferenceCard conference={conference} key={conference.id} />
              ))}
            </div>
            <Link className="ghost-link" href="/conferences" style={{ marginTop: "12px", display: "inline-block" }}>
              Browse all conferences →
            </Link>
          </SectionCard>
        </div>

        <aside className="content-side">
          <SectionCard eyebrow="Interests" title="Personalize your feed">
            <form action={saveInterestAction} className="stacked-form">
              <input name="redirectTo" type="hidden" value="/" />
              <label>
                Add an interest
                <input name="label" placeholder="e.g. agent evaluation" required />
              </label>
              <ActionButton type="submit">Save interest</ActionButton>
            </form>
          </SectionCard>

          <SectionCard eyebrow="Daily briefing" title={digest.title}>
            <p>{digest.intro}</p>
            <div className="digest-preview-stack">
              {digest.sections.slice(0, 2).map((section) => (
                <DigestSectionCard key={section.id} section={section} />
              ))}
            </div>
            <Link className="ghost-link" href="/digest">
              Open full digest →
            </Link>
          </SectionCard>

          <SectionCard eyebrow="Opportunities" title="Research positions">
            <div className="feed-stack">
              {opportunities.slice(0, 2).map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
            <Link className="ghost-link" href="/opportunities">
              Browse all →
            </Link>
          </SectionCard>

          <SectionCard eyebrow="Platform" title="What comes next">
            <h3>Now</h3>
            <ul className="reason-list">
              {roadmap.now.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3>Tonight</h3>
            <ul className="reason-list">
              {roadmap.tonight.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </SectionCard>
        </aside>
      </div>
    </div>
  )
}
