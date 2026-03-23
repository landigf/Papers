import { createRepository } from "@papers/db"
import { ConferenceCard } from "../../components/conference-card"

const repository = createRepository()

export default async function ConferencesPage() {
  const conferences = await repository.listConferences()

  return (
    <div className="content-columns">
      <div className="content-main">
        <div className="feed-stack">
          {conferences.map((conference) => (
            <ConferenceCard conference={conference} key={conference.id} />
          ))}
        </div>
      </div>
    </div>
  )
}
