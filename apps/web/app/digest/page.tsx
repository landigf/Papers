import { createRepository } from "@papers/db"
import { Pill, SectionCard } from "@papers/ui"
import { DigestSectionCard } from "../../components/digest-section-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function DigestPage() {
  const digest = await repository.getDailyDigest(await getViewerHandleFromCookies())

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Daily briefing" title={digest.title}>
          <p>{digest.intro}</p>
          <div className="pill-row">
            <Pill>{digest.generatedAt.slice(0, 10)}</Pill>
            <Pill>{digest.sections.length} sections</Pill>
          </div>
        </SectionCard>
        <div className="feed-stack">
          {digest.sections.map((section) => (
            <DigestSectionCard key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  )
}
