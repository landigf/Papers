import { createRepository } from "@papers/db"
import { Pill, SectionCard } from "@papers/ui"
import Link from "next/link"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function SubmissionsPage() {
  const viewerHandle = await getViewerHandleFromCookies()
  const submissions = await repository.getViewerSubmissions(viewerHandle)

  const grouped = {
    active: submissions.filter(
      (entry) => entry.status === "submitted" || entry.status === "under_review",
    ),
    decided: submissions.filter(
      (entry) =>
        entry.status === "accepted" || entry.status === "waitlist" || entry.status === "rejected",
    ),
  }

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Submissions" title="Track your conference submissions">
          <p className="muted-copy">
            Papers you have submitted to conferences, with live status and review feedback.
          </p>
        </SectionCard>

        {submissions.length === 0 ? (
          <SectionCard eyebrow="Nothing yet" title="No submissions found">
            <p>
              Submit a paper to a conference to start tracking it here.{" "}
              <Link className="ghost-link" href="/conferences">
                Browse conferences
              </Link>
            </p>
          </SectionCard>
        ) : null}

        {grouped.active.length > 0 ? (
          <SectionCard
            eyebrow="In progress"
            title={`Active submissions (${grouped.active.length})`}
          >
            <div className="feed-stack">
              {grouped.active.map((entry) => (
                <div className="submission-card" key={entry.id}>
                  <div className="feed-card-meta">
                    <div>
                      <strong>
                        <Link href={`/papers/${entry.paper.slug}`}>{entry.paper.title}</Link>
                      </strong>
                      <p className="muted-copy">
                        Submitted to{" "}
                        <Link href={`/conferences/${entry.conference.slug}`}>
                          {entry.conference.name}
                        </Link>
                      </p>
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
                    Review deadline {entry.conference.reviewDeadline.slice(0, 10)}
                  </p>
                  {entry.reviews.length > 0 ? (
                    <div className="review-stack">
                      {entry.reviews.map((review) => (
                        <div className="review-card" key={review.id}>
                          <div className="feed-card-meta">
                            <strong>
                              {review.reviewerProfile?.displayName ?? "Anonymous reviewer"}
                            </strong>
                            <span>
                              {review.recommendation.replaceAll("_", " ")} · score {review.score}/5
                            </span>
                          </div>
                          <p>{review.summary}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {grouped.decided.length > 0 ? (
          <SectionCard
            eyebrow="Decisions"
            title={`Decided submissions (${grouped.decided.length})`}
          >
            <div className="feed-stack">
              {grouped.decided.map((entry) => (
                <div className="submission-card" key={entry.id}>
                  <div className="feed-card-meta">
                    <div>
                      <strong>
                        <Link href={`/papers/${entry.paper.slug}`}>{entry.paper.title}</Link>
                      </strong>
                      <p className="muted-copy">
                        <Link href={`/conferences/${entry.conference.slug}`}>
                          {entry.conference.name}
                        </Link>
                      </p>
                    </div>
                    <div className="pill-row">
                      <Pill>{entry.status.replaceAll("_", " ")}</Pill>
                      <Pill>{entry.averageScore ? `avg ${entry.averageScore}/5` : "no score"}</Pill>
                      <Pill>{entry.reviewCount} reviews</Pill>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </div>
  )
}
