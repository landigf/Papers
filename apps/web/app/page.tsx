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
  const [roadmap, feed, trending, conferences, digest, opportunities] = await Promise.all([
    repository.getRoadmap(),
    repository.getFeed({
      viewerHandle: session.viewer?.handle,
    }),
    repository.listTrendingPapers({
      viewerHandle: session.viewer?.handle,
      limit: 3,
    }),
    repository.listConferences(),
    repository.getDailyDigest(session.viewer?.handle),
    repository.getOpportunities(session.viewer?.handle),
  ])

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-kicker">Research, without dumb scrolling</span>
          <h1>
            One place to publish, review, discover, and collaborate before the paper goes cold.
          </h1>
          <p>
            Papers is built to accelerate research, not personal branding. It starts with a
            research-first feed, paper publishing, blind-safe submissions, conference workflows,
            peer review, trending work, and a daily briefing tuned to interests without sealing you
            into them forever.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/feed">
              Explore the feed
            </Link>
            <Link className="secondary-link" href="/conferences">
              Join a conference call
            </Link>
            <Link className="secondary-link" href="/papers/new">
              Publish a paper
            </Link>
          </div>
          {session.viewer ? (
            <div className="pill-row">
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
          <SectionCard eyebrow="Why this product" title="The first slice">
            <ul className="reason-list">
              <li>Paper-first publishing with public and blind visibility modes.</li>
              <li>
                Feed ranking from interests, topics, recency, active discussion, and review signal.
              </li>
              <li>
                Profiles, comments, follows, stars, saved interests, and conference review loops.
              </li>
              <li>
                Grok is server-side only, and blind/private content never crosses that boundary.
              </li>
            </ul>
          </SectionCard>

          <SectionCard eyebrow="Feed preview" title="What researchers will actually see">
            <div className="feed-stack">
              {feed.slice(0, 2).map((entry) => (
                <FeedCard entry={entry} key={entry.id} />
              ))}
            </div>
          </SectionCard>

          {trending.length > 0 && (
            <SectionCard eyebrow="Trending" title="What is moving right now">
              <div className="feed-stack">
                {trending.map((entry) => (
                  <FeedCard entry={entry} key={entry.id} />
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard
            eyebrow="Conference flow"
            title="Competition and peer review live in-product"
          >
            <div className="feed-stack">
              {conferences.slice(0, 2).map((conference) => (
                <ConferenceCard conference={conference} key={conference.id} />
              ))}
            </div>
          </SectionCard>
        </div>

        <aside className="content-side">
          <SectionCard eyebrow="Saved interests" title="Teach Papers what matters">
            <form action={saveInterestAction} className="stacked-form">
              <input name="redirectTo" type="hidden" value="/" />
              <label>
                Add an interest
                <input name="label" placeholder="agent evaluation" required />
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
              Open full digest
            </Link>
          </SectionCard>

          <SectionCard eyebrow="Matched opportunities" title="Not just inside your current lane">
            <div className="feed-stack">
              {opportunities.slice(0, 2).map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
            <Link className="ghost-link" href="/opportunities">
              Browse all opportunities
            </Link>
          </SectionCard>

          <SectionCard eyebrow="Jarvis roadmap" title="What comes next">
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
            <h3>Proposed by Jarvis</h3>
            <ul className="reason-list">
              {roadmap.proposedByJarvis.map((idea) => (
                <li key={idea.id}>
                  <strong>{idea.label}</strong>: {idea.summary}
                </li>
              ))}
            </ul>
          </SectionCard>
        </aside>
      </div>
    </div>
  )
}
