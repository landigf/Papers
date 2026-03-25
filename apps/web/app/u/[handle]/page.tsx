import { createRepository } from "@papers/db"
import { ActionButton, Avatar, Pill, SectionCard, StatBadge } from "@papers/ui"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getViewerHandleFromCookies } from "../../../lib/viewer"
import { toggleFollowAction } from "../../actions"

const repository = createRepository()

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const viewerHandle = await getViewerHandleFromCookies()
  const detail = await repository.getProfileByHandle(handle, viewerHandle)

  if (!detail) {
    notFound()
  }

  const profile = detail.profile

  return (
    <div className="content-columns">
      <div className="content-main">
        {/* LinkedIn-style profile banner */}
        <div className="profile-banner">
          <Avatar name={profile.displayName} size="lg" />
          <div className="profile-info">
            <h1 className="profile-name">{profile.displayName}</h1>
            <p className="profile-headline">{profile.headline ?? "Researcher on Papers"}</p>
            {profile.affiliation && (
              <p className="profile-affiliation">{profile.affiliation}</p>
            )}
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">{detail.papers.length}</span>
                <span className="profile-stat-label">Papers</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">
                  {detail.papers.reduce((sum, p) => sum + (p.starCount ?? 0), 0)}
                </span>
                <span className="profile-stat-label">Stars</span>
              </div>
            </div>
            <div className="profile-actions">
              <form action={toggleFollowAction}>
                <input name="handle" type="hidden" value={profile.handle} />
                <ActionButton type="submit">
                  {detail.isFollowedByViewer ? "Following ✓" : "Follow"}
                </ActionButton>
              </form>
            </div>
          </div>
        </div>

        {/* About section */}
        {profile.bio && (
          <SectionCard eyebrow="About" title="Bio">
            <p>{profile.bio}</p>
          </SectionCard>
        )}

        {/* Research interests */}
        {profile.researchInterests.length > 0 && (
          <SectionCard eyebrow="Interests" title="Research topics">
            <div className="pill-row">
              {profile.researchInterests.map((interest) => (
                <Pill key={interest}>{interest}</Pill>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Publications (GitHub-style repo list) */}
        <SectionCard eyebrow="Publications" title={`Papers (${detail.papers.length})`}>
          {detail.papers.length === 0 ? (
            <div className="empty-state">
              <p>No papers published yet.</p>
            </div>
          ) : (
            <div className="paper-link-stack">
              {detail.papers.map((paper) => (
                <Link className="paper-list-item" href={`/papers/${paper.slug}`} key={paper.id}>
                  <div className="paper-list-title">{paper.title}</div>
                  <div className="paper-list-abstract">{paper.abstract}</div>
                  <div className="paper-list-footer">
                    <span>★ {paper.starCount ?? 0}</span>
                    <span>💬 {paper.commentCount ?? 0}</span>
                    {paper.topics?.map((t) => (
                      <span key={t.id}>{t.label}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Sidebar */}
      <aside className="content-side">
        {/* Identity verification */}
        <SectionCard eyebrow="Identity" title="Verification">
          <div style={{ display: "grid", gap: "8px" }}>
            <div>
              <StatBadge
                accent={profile.isVerifiedResearcher}
                icon={profile.isVerifiedResearcher ? "✓" : "○"}
                value={profile.isVerifiedResearcher ? "Verified researcher" : "Unverified"}
              />
            </div>
            <div>
              <StatBadge
                accent={!!profile.orcid}
                icon="🔗"
                value={profile.orcid ? `ORCID ${profile.orcid}` : "No ORCID linked"}
              />
            </div>
          </div>
        </SectionCard>

        {/* Handle & details */}
        <SectionCard eyebrow="Details" title="Profile info">
          <dl className="profile-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div>
              <dt style={{ color: "var(--dim)", fontSize: "0.82rem" }}>Handle</dt>
              <dd>@{profile.handle}</dd>
            </div>
            {profile.affiliation && (
              <div>
                <dt style={{ color: "var(--dim)", fontSize: "0.82rem" }}>Affiliation</dt>
                <dd>{profile.affiliation}</dd>
              </div>
            )}
          </dl>
        </SectionCard>
      </aside>
    </div>
  )
}
