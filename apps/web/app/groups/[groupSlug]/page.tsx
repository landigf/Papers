import { createRepository } from "@papers/db"
import { Pill, SectionCard } from "@papers/ui"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FeedCard } from "../../../components/feed-card"
import { getViewerHandleFromCookies } from "../../../lib/viewer"
import {
  addToGroupReadingListAction,
  createGroupAnnouncementAction,
  toggleGroupMembershipAction,
} from "../../actions"

const repository = createRepository()

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupSlug: string }>
}) {
  const { groupSlug } = await params
  const viewerHandle = await getViewerHandleFromCookies()
  const detail = await repository.getGroupBySlug(groupSlug, viewerHandle)

  if (!detail) {
    notFound()
  }

  const { group, members, announcements, readingList } = detail
  const viewerPapers = viewerHandle
    ? await repository
        .getFeed({ viewerHandle })
        .then((feed) => feed.filter((entry) => entry.paper.ownerId === null || true).slice(0, 10))
    : []

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard
          eyebrow={group.visibility === "private" ? "Private group" : "Group"}
          title={group.name}
        >
          <p>{group.description}</p>
          <div className="pill-row">
            <Pill>{group.memberCount} members</Pill>
            <Pill>{group.paperCount} papers</Pill>
            {group.topics.map((topic) => (
              <Pill key={topic.id}>{topic.label}</Pill>
            ))}
          </div>
          {viewerHandle && !group.isViewerMember && group.visibility === "public" && (
            <form action={toggleGroupMembershipAction}>
              <input name="groupSlug" type="hidden" value={group.slug} />
              <button type="submit">Join group</button>
            </form>
          )}
          {viewerHandle && group.isViewerMember && (
            <p className="muted-copy">You are a member of this group.</p>
          )}
        </SectionCard>

        <SectionCard eyebrow="Announcements" title="Group announcements">
          {announcements.length === 0 && <p className="muted-copy">No announcements yet.</p>}
          {announcements.map((announcement) => (
            <div className="section-card" key={announcement.id}>
              <h3>{announcement.title}</h3>
              <p>{announcement.body}</p>
              <p className="muted-copy">
                {announcement.authorProfile ? `${announcement.authorProfile.displayName} — ` : ""}
                {announcement.createdAt.slice(0, 10)}
              </p>
            </div>
          ))}
          {group.isViewerMember && (
            <details>
              <summary>Post an announcement</summary>
              <form action={createGroupAnnouncementAction} className="form-stack">
                <input name="groupSlug" type="hidden" value={group.slug} />
                <label htmlFor="ann-title">
                  Title
                  <input
                    id="ann-title"
                    maxLength={200}
                    minLength={3}
                    name="title"
                    required
                    type="text"
                  />
                </label>
                <label htmlFor="ann-body">
                  Body
                  <textarea
                    id="ann-body"
                    maxLength={4000}
                    minLength={10}
                    name="body"
                    required
                    rows={4}
                  />
                </label>
                <button type="submit">Post announcement</button>
              </form>
            </details>
          )}
        </SectionCard>

        <SectionCard eyebrow="Reading list" title="Shared papers">
          {readingList.length === 0 && (
            <p className="muted-copy">No papers in the reading list yet.</p>
          )}
          <div className="feed-stack">
            {readingList.map((item) => (
              <div key={item.id}>
                <FeedCard
                  entry={{
                    id: `grli_${item.id}`,
                    paper: item.paper,
                    score: 0,
                    reasons: item.note ? [item.note] : [],
                  }}
                />
                {item.addedBy && (
                  <p className="muted-copy">
                    Added by {item.addedBy.displayName}
                    {item.note ? ` — "${item.note}"` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
          {group.isViewerMember && viewerPapers.length > 0 && (
            <details>
              <summary>Add a paper to the reading list</summary>
              <form action={addToGroupReadingListAction} className="form-stack">
                <input name="groupSlug" type="hidden" value={group.slug} />
                <label htmlFor="rl-paperSlug">
                  Paper slug
                  <input
                    id="rl-paperSlug"
                    name="paperSlug"
                    placeholder="Enter a paper slug"
                    required
                    type="text"
                  />
                </label>
                <label htmlFor="rl-note">
                  Note (optional)
                  <input id="rl-note" maxLength={500} name="note" type="text" />
                </label>
                <button type="submit">Add to reading list</button>
              </form>
            </details>
          )}
        </SectionCard>
      </div>
      <aside className="content-side">
        <SectionCard eyebrow="Members" title={`${members.length} members`}>
          <div className="feed-stack">
            {members.map((member) => (
              <div key={member.id}>
                <Link className="ghost-link" href={`/u/${member.profile.handle}`}>
                  {member.profile.displayName}
                </Link>
                <span className="muted-copy"> — {member.role}</span>
                {member.profile.affiliation && (
                  <span className="muted-copy"> ({member.profile.affiliation})</span>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </aside>
    </div>
  )
}
