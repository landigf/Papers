import { createRepository } from "@papers/db"
import { ActionButton, Pill, SectionCard } from "@papers/ui"
import Link from "next/link"
import { FeedCard } from "../components/feed-card"
import { getSessionContext } from "../lib/viewer"
import { saveInterestAction } from "./actions"

const repository = createRepository()

export default async function HomePage() {
  const session = await getSessionContext()
  const [roadmap, feed] = await Promise.all([
    repository.getRoadmap(),
    repository.getFeed({
      viewerHandle: session.viewer?.handle,
    }),
  ])

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-kicker">Research, without LinkedIn cosplay</span>
          <h1>Share papers, ask for collaborators, and follow ideas while they are still alive.</h1>
          <p>
            Papers starts with a public feed, paper-first publishing, blind-mode safety, comments,
            and interest-driven discovery. The next layer is already visible: groups, direct
            messages, open problems, collaborator calls, and research opportunities.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/feed">
              Explore the feed
            </Link>
            <Link className="secondary-link" href="/papers/new">
              Publish a paper
            </Link>
          </div>
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
            </div>
          </SectionCard>
        </div>
      </section>

      <div className="content-columns">
        <div className="content-main">
          <SectionCard eyebrow="Why this product" title="The first slice">
            <ul className="reason-list">
              <li>Paper-first publishing with public and blind visibility modes.</li>
              <li>Feed ranking from interests, topics, recency, and active discussion.</li>
              <li>
                Profiles, comments, follows, stars, and saved interests as the baseline graph.
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
        </div>

        <aside className="content-side">
          <SectionCard eyebrow="Saved interests" title="Teach Papers what matters">
            <form action={saveInterestAction} className="stacked-form">
              <label>
                Add an interest
                <input name="label" placeholder="agent evaluation" required />
              </label>
              <ActionButton type="submit">Save interest</ActionButton>
            </form>
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
