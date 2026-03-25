import { createRepository } from "@papers/db"
import { ActionButton, Pill, SectionCard } from "@papers/ui"
import { notFound } from "next/navigation"
import { getViewerHandleFromCookies } from "../../../lib/viewer"
import { createPeerReviewAction, submitPaperToConferenceAction } from "../../actions"

const repository = createRepository()

export default async function ConferencePage(props: { params: Promise<{ conferenceId: string }> }) {
  const params = await props.params
  const detail = await repository.getConferenceBySlug(
    params.conferenceId,
    await getViewerHandleFromCookies(),
  )

  if (!detail) {
    notFound()
  }

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Conference" title={detail.conference.name}>
          <p>{detail.conference.summary}</p>
          <p>{detail.conference.callForPapers}</p>
          <div className="inline-stats">
            <span>{detail.conference.status}</span>
            <span>{detail.conference.submissionCount} submissions</span>
            <span>{detail.conference.reviewCount} reviews</span>
          </div>
          <p className="field-note">
            Deadline {detail.conference.submissionDeadline.slice(0, 10)} · Review by{" "}
            {detail.conference.reviewDeadline.slice(0, 10)}
          </p>
          {detail.conference.topics.length > 0 && (
            <div className="pill-row">
              {detail.conference.topics.map((topic) => (
                <Pill key={topic.id}>{topic.label}</Pill>
              ))}
            </div>
          )}
        </SectionCard>

        {detail.viewerPapers.length > 0 && detail.conference.status === "open" ? (
          <SectionCard eyebrow="Submit" title="Add a paper to this conference">
            <form action={submitPaperToConferenceAction} className="stacked-form">
              <input name="conferenceSlug" type="hidden" value={detail.conference.slug} />
              <label>
                Choose one of your papers
                <select name="paperSlug" required>
                  {detail.viewerPapers.map((paper) => (
                    <option key={paper.id} value={paper.slug}>
                      {paper.title}
                    </option>
                  ))}
                </select>
              </label>
              <ActionButton type="submit">Submit to conference</ActionButton>
            </form>
          </SectionCard>
        ) : null}

        <SectionCard
          eyebrow="Submissions"
          title={`Peer review live (${detail.submissions.length})`}
        >
          <div className="feed-stack">
            {detail.submissions.map((submission) => (
              <div className="submission-card" key={submission.id}>
                <div className="feed-card-meta">
                  <div>
                    <strong>{submission.paper.title}</strong>
                    <p className="muted-copy">
                      {submission.paper.visibilityMode === "blind"
                        ? "Blind submission"
                        : (submission.paper.publicAuthorProfile?.displayName ?? "Public paper")}
                    </p>
                  </div>
                  <div className="inline-stats">
                    <span>{submission.status.replaceAll("_", " ")}</span>
                    <span>
                      {submission.averageScore ? `avg ${submission.averageScore}` : "no score yet"}
                    </span>
                    <span>{submission.reviewCount} reviews</span>
                  </div>
                </div>
                <p>{submission.paper.abstract}</p>

                {submission.reviews.length > 0 ? (
                  <div className="review-stack">
                    {submission.reviews.map((review) => (
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
                ) : null}

                <form action={createPeerReviewAction} className="stacked-form">
                  <input name="conferenceSlug" type="hidden" value={detail.conference.slug} />
                  <input name="submissionId" type="hidden" value={submission.id} />
                  <div className="review-grid">
                    <label>
                      Score
                      <select defaultValue="4" name="score">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </label>
                    <label>
                      Confidence
                      <select defaultValue="4" name="confidence">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </label>
                    <label>
                      Recommendation
                      <select defaultValue="borderline" name="recommendation">
                        <option value="accept">Accept</option>
                        <option value="weak_accept">Weak accept</option>
                        <option value="borderline">Borderline</option>
                        <option value="weak_reject">Weak reject</option>
                        <option value="reject">Reject</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Summary
                    <textarea
                      name="summary"
                      placeholder="Short reviewer summary"
                      required
                      rows={3}
                    />
                  </label>
                  <label>
                    Strengths
                    <textarea
                      name="strengths"
                      placeholder="What is strong here?"
                      required
                      rows={3}
                    />
                  </label>
                  <label>
                    Concerns
                    <textarea
                      name="concerns"
                      placeholder="What needs more evidence, clarity, or scope control?"
                      required
                      rows={3}
                    />
                  </label>
                  <ActionButton type="submit">Submit review</ActionButton>
                </form>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
