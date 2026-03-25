import { createRepository } from "@papers/db"
import { SectionCard } from "@papers/ui"
import Link from "next/link"
import { getViewerHandleFromCookies } from "../../lib/viewer"

const repository = createRepository()

export default async function MessagesPage() {
  const viewerHandle = await getViewerHandleFromCookies()
  const conversations = await repository.listConversations(viewerHandle)

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Messages" title="Conversations">
          {conversations.length === 0 ? (
            <p>No conversations yet. Visit a researcher's profile to start a conversation.</p>
          ) : (
            <div className="feed-stack">
              {conversations.map((conversation) => {
                const otherParticipants = conversation.participantProfiles.filter(
                  (profile) => profile.handle !== viewerHandle,
                )
                const displayName =
                  otherParticipants.map((profile) => profile.displayName).join(", ") || "Unknown"
                const displayHandle =
                  otherParticipants.map((profile) => `@${profile.handle}`).join(", ") || ""

                return (
                  <Link
                    className="conversation-card"
                    href={`/messages/${conversation.id}`}
                    key={conversation.id}
                  >
                    <div className="conversation-card-header">
                      <strong>{displayName}</strong>
                      <span className="conversation-handle">{displayHandle}</span>
                      {conversation.unreadCount > 0 ? (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                      ) : null}
                    </div>
                    {conversation.lastMessage ? (
                      <p className="conversation-preview">{conversation.lastMessage.body}</p>
                    ) : (
                      <p className="conversation-preview">No messages yet</p>
                    )}
                    <time className="conversation-time">
                      {new Date(conversation.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </Link>
                )
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
