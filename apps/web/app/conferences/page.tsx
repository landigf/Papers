import { createRepository } from "@papers/db"
import { Pill, SectionCard } from "@papers/ui"
import Link from "next/link"
import { ConferenceCard } from "../../components/conference-card"

const repository = createRepository()

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

function deadlineLabel(iso: string): string {
  const days = daysUntil(iso)
  if (days < 0) return "deadline passed"
  if (days === 0) return "closes today"
  if (days === 1) return "closes tomorrow"
  if (days <= 7) return `${days} days left`
  return `${days} days left`
}

export default async function ConferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const conferences = await repository.listConferences()
  const statusFilter = params.status ?? "all"

  const filtered =
    statusFilter === "all"
      ? conferences
      : conferences.filter((conference) => conference.status === statusFilter)

  const openCount = conferences.filter((c) => c.status === "open").length
  const reviewingCount = conferences.filter((c) => c.status === "reviewing").length
  const closedCount = conferences.filter((c) => c.status === "closed").length

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Conferences" title="Browse conferences and open calls">
          <p className="muted-copy">
            Submit papers, track deadlines, and participate in peer review across active
            conferences.
          </p>
          <nav className="pill-row">
            <Link
              className={`filter-pill ${statusFilter === "all" ? "filter-pill-active" : ""}`}
              href="/conferences?status=all"
            >
              All ({conferences.length})
            </Link>
            <Link
              className={`filter-pill ${statusFilter === "open" ? "filter-pill-active" : ""}`}
              href="/conferences?status=open"
            >
              Open ({openCount})
            </Link>
            <Link
              className={`filter-pill ${statusFilter === "reviewing" ? "filter-pill-active" : ""}`}
              href="/conferences?status=reviewing"
            >
              Reviewing ({reviewingCount})
            </Link>
            <Link
              className={`filter-pill ${statusFilter === "closed" ? "filter-pill-active" : ""}`}
              href="/conferences?status=closed"
            >
              Closed ({closedCount})
            </Link>
          </nav>
        </SectionCard>

        {filtered.length === 0 ? (
          <SectionCard eyebrow="No results" title={`No ${statusFilter} conferences`}>
            <p>
              <Link className="ghost-link" href="/conferences?status=all">
                Show all conferences
              </Link>
            </p>
          </SectionCard>
        ) : null}

        <div className="feed-stack">
          {filtered.map((conference) => {
            const days = daysUntil(conference.submissionDeadline)
            const urgent = conference.status === "open" && days >= 0 && days <= 7
            return (
              <div key={conference.id}>
                {urgent ? (
                  <div className="deadline-urgency">
                    <Pill>{deadlineLabel(conference.submissionDeadline)}</Pill>
                  </div>
                ) : null}
                <ConferenceCard conference={conference} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
