import { createRepository } from "@papers/db"
import { ActionButton, Pill, SectionCard } from "@papers/ui"
import { getViewerHandleFromCookies } from "../../lib/viewer"
import { createPeerReviewAction } from "../actions"

const repository = createRepository()

export default async function ReviewsPage() {
  const viewerHandle = await getViewerHandleFromCookies()
  const assignments = await repository.getViewerReviewAssignments(viewerHandle)

  const pending = assignments.filter(
    (assignment) => assignment.status === "pending" || assignment.status === "accepted",
  )
  const completed = assignments.filter((assignment) => assignment.status === "completed")

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Reviews" title="Your review assignments">
          {pending.length === 0 && completed.length === 0 ? (
            <p className="muted-copy">
              No review assignments yet. You will see papers here when a conference organizer
              assigns you as a reviewer.
            </p>
          ) : null}

          {pending.length > 0 ? (
            <>
              <h3>Pending ({pending.length})</h3>
              <div className="feed-stack">
                {pending.map((assignment) => {
                  const conference = assignment.conferenceName
                  return (
                    <div className="submission-card" key={assignment.id}>
                      <div className="feed-card-meta">
                        <div>
                          <strong>{assignment.paperTitle}</strong>
                          <p className="muted-copy">
                            {conference} · assigned {assignment.assignedAt.slice(0, 10)}
                          </p>
                        </div>
                        <Pill>{assignment.status}</Pill>
                      </div>
                      <form action={createPeerReviewAction} className="stacked-form">
                        <input
                          name="conferenceSlug"
                          type="hidden"
                          value={assignment.conferenceSlug}
                        />
                        <input name="submissionId" type="hidden" value={assignment.submissionId} />
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
                  )
                })}
              </div>
            </>
          ) : null}

          {completed.length > 0 ? (
            <>
              <h3>Completed ({completed.length})</h3>
              <div className="feed-stack">
                {completed.map((assignment) => (
                  <div className="submission-card" key={assignment.id}>
                    <div className="feed-card-meta">
                      <div>
                        <strong>{assignment.paperTitle}</strong>
                        <p className="muted-copy">
                          {assignment.conferenceName} · reviewed{" "}
                          {assignment.assignedAt.slice(0, 10)}
                        </p>
                      </div>
                      <Pill>completed</Pill>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </SectionCard>
      </div>
    </div>
  )
}
