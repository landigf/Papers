import { createRepository } from "@papers/db"
import { ActionButton, Pill, SectionCard } from "@papers/ui"
import { notFound } from "next/navigation"
import { ConferenceCard } from "../../../components/conference-card"
import { getViewerHandleFromCookies } from "../../../lib/viewer"
import { createCommentAction, submitRevisionAction, toggleStarAction } from "../../actions"

const repository = createRepository()

export default async function PaperPage({ params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params
  const viewerHandle = await getViewerHandleFromCookies()
  const [detail, conferences, reviewSummary, viewer] = await Promise.all([
    repository.getPaperBySlug(paperId, viewerHandle),
    repository.listConferences(),
    repository.getPaperReviewSummary(paperId),
    repository.getViewer(viewerHandle),
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

        {reviewSummary.length > 0 ? (
          <SectionCard eyebrow="Peer review" title="Review status across conferences">
            <div className="feed-stack">
              {reviewSummary.map((entry) => (
                <div className="submission-card" key={entry.conferenceName}>
                  <div className="feed-card-meta">
                    <strong>{entry.conferenceName}</strong>
                    <div className="pill-row">
                      <Pill>{entry.submissionStatus.replaceAll("_", " ")}</Pill>
                      <Pill>
                        {entry.reviews.length} review{entry.reviews.length === 1 ? "" : "s"}
                      </Pill>
                      {entry.revisionCount > 0 ? (
                        <Pill>
                          {entry.revisionCount} revision{entry.revisionCount === 1 ? "" : "s"}
                        </Pill>
                      ) : null}
                    </div>
                  </div>
                  {entry.reviews.map((review) => (
                    <div className="review-card" key={review.id}>
                      <div className="feed-card-meta">
                        <strong>
                          {review.reviewerProfile?.displayName ?? "Anonymous reviewer"}
                        </strong>
                        <span>
                          {review.recommendation.replaceAll("_", " ")} · score {review.score}/5 ·
                          confidence {review.confidence}/5
                        </span>
                      </div>
                      <p>{review.summary}</p>
                      <p>
                        <strong>Strengths:</strong> {review.strengths}
                      </p>
                      <p>
                        <strong>Concerns:</strong> {review.concerns}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {viewer && detail.paper.ownerId === viewer.id ? (
          <SectionCard eyebrow="Revision" title="Submit a revised version">
            <form action={submitRevisionAction} className="stacked-form">
              <input name="paperSlug" type="hidden" value={detail.paper.slug} />
              <label>
                Title
                <input defaultValue={detail.paper.title} name="title" required type="text" />
              </label>
              <label>
                Abstract
                <textarea defaultValue={detail.paper.abstract} name="abstract" required rows={4} />
              </label>
              <label>
                Body (Markdown)
                <textarea
                  defaultValue={detail.paper.bodyMarkdown}
                  name="bodyMarkdown"
                  required
                  rows={10}
                />
              </label>
              <ActionButton type="submit">Submit revision</ActionButton>
            </form>
          </SectionCard>
        ) : null}

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
