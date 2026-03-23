import { createRepository } from "@papers/db"
import { ActionButton, SectionCard } from "@papers/ui"
import { notFound } from "next/navigation"
import { getViewerHandleFromCookies } from "../../../lib/viewer"
import { toggleFollowAction } from "../../actions"

const repository = createRepository()

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const detail = await repository.getProfileByHandle(handle, await getViewerHandleFromCookies())

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
        </SectionCard>
      </div>
    </div>
  )
}
