import { createRepository } from "@papers/db"
import { DigestSectionCard } from "../../components/digest-section-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function DigestPage() {
  const digest = await repository.getDailyDigest(await getViewerHandleFromCookies())

  return (
    <div className="content-columns">
      <div className="content-main">
        <div className="feed-stack">
          {digest.sections.map((section) => (
            <DigestSectionCard key={section.id} section={section} />
          ))}
        </div>
        {digest.sections.length === 0 && (
          <p className="muted-copy">Nothing in today's digest yet. Check back later.</p>
        )}
      </div>
    </div>
  )
}
