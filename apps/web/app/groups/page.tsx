import { createRepository } from "@papers/db"
import { SectionCard } from "@papers/ui"
import Link from "next/link"
import { GroupCard } from "../../components/group-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function GroupsPage() {
  const viewerHandle = await getViewerHandleFromCookies()
  const groups = await repository.listGroups(viewerHandle)

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Groups" title="Research groups and lab circles">
          <p className="muted-copy">
            Groups let researchers organize around shared interests, labs, or conference tracks.
            Share reading lists, post announcements, and build a focused feed together.
          </p>
          <Link className="ghost-link" href="/groups/new">
            Create a new group
          </Link>
          <div className="feed-stack">
            {groups.map((group) => (
              <GroupCard group={group} key={group.id} />
            ))}
            {groups.length === 0 && (
              <p className="muted-copy">No groups yet. Create the first one.</p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
