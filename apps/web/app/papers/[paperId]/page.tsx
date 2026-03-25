import { createRepository } from "@papers/db"
import { ActionButton, Pill, SectionCard } from "@papers/ui"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ConferenceCard } from "../../../components/conference-card"
import { getViewerHandleFromCookies } from "../../../lib/viewer"
import { createCommentAction, toggleStarAction } from "../../actions"

const repository = createRepository()

export default async function PaperPage({ params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params
  const viewerHandle = await getViewerHandleFromCookies()
  const [detail, conferences, paperSubmissions] = await Promise.all([
    repository.getPaperBySlug(paperId, viewerHandle),
    repository.listConferences(),
    repository.getPaperSubmissions(paperId),
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

        {paperSubmissions.length > 0 ? (
          <SectionCard
            eyebrow="Submission status"
            title={`Submitted to ${paperSubmissions.length} conference${paperSubmissions.length > 1 ? "s" : ""}`}
          >
            <div className="feed-stack">
              {paperSubmissions.map((entry) => (
                <div className="submission-card" key={entry.id}>
                  <div className="feed-card-meta">
                    <div>
                      <strong>
                        <Link href={`/conferences/${entry.conference.slug}`}>
                          {entry.conference.name}
                        </Link>
                      </strong>
                    </div>
                    <div className="pill-row">
                      <Pill>{entry.status.replaceAll("_", " ")}</Pill>
                      <Pill>
                        {entry.averageScore ? `avg ${entry.averageScore}/5` : "no score yet"}
                      </Pill>
                      <Pill>{entry.reviewCount} reviews</Pill>
                    </div>
                  </div>
                  <p className="muted-copy">
                    Submitted {entry.submittedAt.slice(0, 10)} · review deadline{" "}
                    {entry.conference.reviewDeadline.slice(0, 10)}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        <SectionCard eyebrow="Conferences" title="Where this work could get feedback next">
          <div className="feed-stack">
            {conferences
              .filter(
                (conference) =>
                  conference.status === "open" &&
                  !paperSubmissions.some((entry) => entry.conferenceId === conference.id),
              )
              .slice(0, 2)
              .map((conference) => (
                <ConferenceCard conference={conference} key={conference.id} />
              ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
