import { createRepository } from "@papers/db"
import { ActionButton, Pill, SectionCard } from "@papers/ui"
import { notFound } from "next/navigation"
import { ConferenceCard } from "../../../components/conference-card"
import { getPublicFileUrl } from "../../../lib/storage"
import { getViewerHandleFromCookies } from "../../../lib/viewer"
import { createCommentAction, toggleStarAction } from "../../actions"

const repository = createRepository()

export default async function PaperPage({ params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params
  const viewerHandle = await getViewerHandleFromCookies()
  const [detail, conferences] = await Promise.all([
    repository.getPaperBySlug(paperId, viewerHandle),
    repository.listConferences(),
  ])

  if (!detail) {
    notFound()
  }

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard
          eyebrow={detail.paper.visibilityMode === "blind" ? "Blind post" : "Paper"}
          title={detail.paper.title}
        >
          <div className="paper-meta">
            <div>
              {detail.paper.publicAuthorProfile ? (
                <span>
                  by <strong>{detail.paper.publicAuthorProfile.displayName}</strong>
                </span>
              ) : (
                <span>Identity hidden for blind review</span>
              )}
            </div>
            <form action={toggleStarAction}>
              <input name="paperSlug" type="hidden" value={detail.paper.slug} />
              <ActionButton type="submit">
                {detail.paper.isStarredByViewer ? "Unstar" : "Star"} {detail.paper.starCount}
              </ActionButton>
            </form>
          </div>
          <p className="paper-abstract">{detail.paper.abstract}</p>
          <div className="pill-row">
            {detail.paper.topics.map((topic) => (
              <Pill key={topic.id}>{topic.label}</Pill>
            ))}
          </div>
          <article className="markdown-body">
            {detail.paper.bodyMarkdown.split("\n").map((line) => (
              <p key={`${detail.paper.id}-${line}`}>{line}</p>
            ))}
          </article>
        </SectionCard>

        {detail.paper.assets.length > 0 && (
          <SectionCard eyebrow="PDF" title="Full paper">
            {detail.paper.assets
              .filter((asset) => asset.mimeType === "application/pdf")
              .map((asset) => (
                <div key={asset.id} style={{ marginBottom: "1rem" }}>
                  <p className="field-note" style={{ marginBottom: "0.5rem" }}>
                    {asset.fileName} ({Math.round(asset.fileSizeBytes / 1024)} KB)
                  </p>
                  <iframe
                    src={getPublicFileUrl(asset.storageKey)}
                    style={{
                      width: "100%",
                      height: "80vh",
                      border: "1px solid var(--color-border, #ddd)",
                      borderRadius: "4px",
                    }}
                    title={`PDF: ${asset.fileName}`}
                  />
                </div>
              ))}
          </SectionCard>
        )}

        <SectionCard eyebrow="Discussion" title={`Comments (${detail.comments.length})`}>
          <form action={createCommentAction} className="stacked-form">
            <input name="paperId" type="hidden" value={detail.paper.slug} />
            <label>
              Add a comment
              <textarea
                name="body"
                placeholder="Ask for clarification, point to related work, or suggest a collaborator angle."
                required
                rows={4}
              />
            </label>
            <ActionButton type="submit">Post comment</ActionButton>
          </form>

          <div className="comment-stack">
            {detail.comments.map((comment) => (
              <article className="comment-card" key={comment.id}>
                <div className="comment-author">
                  {comment.authorProfile ? comment.authorProfile.displayName : "Blind participant"}
                </div>
                <p>{comment.body}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Conferences" title="Where this work could get feedback next">
          <div className="feed-stack">
            {conferences.slice(0, 2).map((conference) => (
              <ConferenceCard conference={conference} key={conference.id} />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
