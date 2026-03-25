import { createRepository } from "@papers/db"
import { ActionButton, Avatar, Pill, SectionCard, StatBadge } from "@papers/ui"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ConferenceCard } from "../../../components/conference-card"
import { getPublicFileUrl } from "../../../lib/storage"
import { getViewerHandleFromCookies } from "../../../lib/viewer"
import { createCommentAction, toggleStarAction } from "../../actions"

const repository = createRepository()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function generateBibtex(paper: {
  slug: string
  title: string
  publicAuthorProfile: { displayName: string } | null
  createdAt: string
}): string {
  const author = paper.publicAuthorProfile?.displayName ?? "Anonymous"
  const year = new Date(paper.createdAt).getFullYear()
  const key = `${author.split(" ").pop()?.toLowerCase() ?? "anon"}${year}${paper.slug.slice(0, 8)}`
  return `@article{${key},
  title   = {${paper.title}},
  author  = {${author}},
  year    = {${year}},
  journal = {Papers},
  url     = {/papers/${paper.slug}}
}`
}

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

  const paper = detail.paper
  const isBlind = paper.visibilityMode === "blind"
  const author = paper.publicAuthorProfile
  const bibtex = generateBibtex(paper)

  return (
    <div className="content-columns">
      <div className="content-main">
        {/* Main paper section */}
        <SectionCard
          eyebrow={isBlind ? "Blind submission" : "Paper"}
          title={paper.title}
        >
          {/* arXiv-style metadata block */}
          <dl className="paper-metadata">
            <dt>Authors</dt>
            <dd>
              {isBlind ? (
                "Identity hidden for blind review"
              ) : author ? (
                <Link href={`/u/${author.handle}`}>
                  <strong>{author.displayName}</strong>
                </Link>
              ) : (
                "Unknown"
              )}
            </dd>
            <dt>Submitted</dt>
            <dd>{formatDate(paper.createdAt)}</dd>
            {paper.updatedAt !== paper.createdAt && (
              <>
                <dt>Last revised</dt>
                <dd>{formatDate(paper.updatedAt)}</dd>
              </>
            )}
            <dt>Categories</dt>
            <dd>
              <div className="pill-row">
                {paper.topics.map((topic) => (
                  <Pill key={topic.id}>{topic.label}</Pill>
                ))}
              </div>
            </dd>
          </dl>

          {/* GitHub-style star/stats bar */}
          <div className="paper-meta">
            <form action={toggleStarAction}>
              <input name="paperSlug" type="hidden" value={paper.slug} />
              <ActionButton type="submit">
                {paper.isStarredByViewer ? "★ Starred" : "☆ Star"} ({paper.starCount})
              </ActionButton>
            </form>
            <StatBadge icon="💬" value={detail.comments.length} />
            <StatBadge icon="👥" value={paper.followerCount} />
          </div>

          {/* Abstract */}
          <h3>Abstract</h3>
          <p className="paper-abstract">{paper.abstract}</p>

          {/* Full text */}
          <article className="markdown-body">
            {paper.bodyMarkdown.split("\n").map((line, i) => (
              <p key={`line-${i}`}>{line}</p>
            ))}
          </article>
        </SectionCard>

        {/* PDF viewer */}
        {paper.assets.length > 0 && (
          <SectionCard eyebrow="Attachment" title="Full paper (PDF)">
            {paper.assets
              .filter((asset) => asset.mimeType === "application/pdf")
              .map((asset) => (
                <div key={asset.id} style={{ marginBottom: "1rem" }}>
                  <p className="field-note" style={{ marginBottom: "0.5rem" }}>
                    {asset.fileName} ({Math.round(asset.fileSizeBytes / 1024)} KB)
                    {asset.isMetadataScrubbed && " · Metadata scrubbed"}
                  </p>
                  <iframe
                    src={getPublicFileUrl(asset.storageKey)}
                    style={{
                      width: "100%",
                      height: "80vh",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    title={`PDF: ${asset.fileName}`}
                  />
                </div>
              ))}
          </SectionCard>
        )}

        {/* BibTeX citation (arXiv-style) */}
        <SectionCard eyebrow="Citation" title="BibTeX">
          <div className="bibtex-block">{bibtex}</div>
        </SectionCard>

        {/* Discussion (GitHub-style) */}
        <SectionCard eyebrow="Discussion" title={`Comments (${detail.comments.length})`}>
          <form action={createCommentAction} className="stacked-form" id="comments">
            <input name="paperId" type="hidden" value={paper.slug} />
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
                <div className="comment-header">
                  <Avatar
                    name={comment.authorProfile?.displayName ?? "?"}
                    size="sm"
                  />
                  <span className="comment-author">
                    {comment.authorProfile ? (
                      <Link href={`/u/${comment.authorProfile.handle}`}>
                        {comment.authorProfile.displayName}
                      </Link>
                    ) : (
                      "Anonymous"
                    )}
                  </span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="comment-body">{comment.body}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Sidebar */}
      <aside className="content-side">
        {/* Version history (GitHub-style timeline) */}
        <SectionCard eyebrow="History" title="Version timeline">
          <div className="version-timeline">
            <div className="version-entry">
              <div className="version-date">{formatDate(paper.updatedAt)}</div>
              <div className="version-title">Current version</div>
            </div>
            {paper.latestVersion && paper.latestVersion.createdAt !== paper.createdAt && (
              <div className="version-entry">
                <div className="version-date">{formatDate(paper.latestVersion.createdAt)}</div>
                <div className="version-title">{paper.latestVersion.title}</div>
              </div>
            )}
            <div className="version-entry">
              <div className="version-date">{formatDate(paper.createdAt)}</div>
              <div className="version-title">Initial submission</div>
            </div>
          </div>
        </SectionCard>

        {/* Author card (LinkedIn-style) */}
        {!isBlind && author && (
          <SectionCard eyebrow="Author" title={author.displayName}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
              <Avatar name={author.displayName} />
              <div>
                <div style={{ fontWeight: 600 }}>{author.displayName}</div>
                {author.affiliation && (
                  <div style={{ fontSize: "0.85rem", color: "var(--dim)" }}>
                    {author.affiliation}
                  </div>
                )}
              </div>
            </div>
            <Link className="ghost-link" href={`/u/${author.handle}`}>
              View full profile →
            </Link>
          </SectionCard>
        )}

        {/* Related conferences */}
        <SectionCard eyebrow="Conferences" title="Submit this work">
          <div className="feed-stack">
            {conferences.slice(0, 2).map((conference) => (
              <ConferenceCard conference={conference} key={conference.id} />
            ))}
          </div>
        </SectionCard>
      </aside>
    </div>
  )
}
