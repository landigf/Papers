import { createRepository } from "@papers/db"
import { ActionButton, Pill, SectionCard } from "@papers/ui"
import { notFound } from "next/navigation"
import { OpportunityCard } from "../../../components/opportunity-card"
import { getViewerHandleFromCookies } from "../../../lib/viewer"
import { toggleFollowAction } from "../../actions"

const repository = createRepository()

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const viewerHandle = await getViewerHandleFromCookies()
  const [detail, opportunities] = await Promise.all([
    repository.getProfileByHandle(handle, viewerHandle),
    repository.getOpportunities(viewerHandle),
  ])

  if (!detail) {
    notFound()
  }

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Research profile" title={detail.profile.displayName}>
          <p>{detail.profile.headline ?? "No headline yet."}</p>
          <p>{detail.profile.bio ?? "No bio yet."}</p>
          <dl className="profile-grid">
            <div>
              <dt>Handle</dt>
              <dd>@{detail.profile.handle}</dd>
            </div>
            <div>
              <dt>Affiliation</dt>
              <dd>{detail.profile.affiliation ?? "Independent / not set"}</dd>
            </div>
            <div>
              <dt>ORCID</dt>
              <dd>{detail.profile.orcid ?? "Not linked"}</dd>
            </div>
          </dl>
          <div className="pill-row">
            {detail.profile.researchInterests.map((interest) => (
              <Pill key={interest}>{interest}</Pill>
            ))}
          </div>
          <form action={toggleFollowAction}>
            <input name="handle" type="hidden" value={detail.profile.handle} />
            <ActionButton type="submit">
              {detail.isFollowedByViewer ? "Unfollow" : "Follow"} researcher
            </ActionButton>
          </form>
        </SectionCard>

        <SectionCard eyebrow="Public work" title="Published posts">
          <div className="paper-link-stack">
            {detail.papers.map((paper) => (
              <a className="paper-link-card" href={`/papers/${paper.slug}`} key={paper.id}>
                <strong>{paper.title}</strong>
                <span>{paper.abstract}</span>
              </a>
            ))}
          </div>
          {detail.papers.length === 0 && <p className="muted-copy">No published papers yet.</p>}
        </SectionCard>

        <SectionCard eyebrow="Opportunity matches" title="Where this researcher could fit next">
          <div className="feed-stack">
            {opportunities.slice(0, 2).map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
          {opportunities.length === 0 && (
            <p className="muted-copy">No opportunity matches right now.</p>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
