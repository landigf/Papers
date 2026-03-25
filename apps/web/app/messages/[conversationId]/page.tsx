import { createRepository } from "@papers/db"
import { ActionButton, SectionCard } from "@papers/ui"
import { notFound } from "next/navigation"
import { getViewerHandleFromCookies } from "../../../lib/viewer"
import { markMessagesReadAction, sendDirectMessageAction } from "../../actions"

const repository = createRepository()

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const viewerHandle = await getViewerHandleFromCookies()
  const detail = await repository.getConversation(conversationId, viewerHandle)

  if (!detail) {
    notFound()
  }

  const otherParticipants = detail.conversation.participantProfiles.filter(
    (profile) => profile.handle !== viewerHandle,
  )
  const displayName =
    otherParticipants.map((profile) => profile.displayName).join(", ") || "Unknown"
  const recipientHandle = otherParticipants[0]?.handle ?? ""

  if (detail.conversation.unreadCount > 0) {
    const readForm = new FormData()
    readForm.set("conversationId", conversationId)
    await markMessagesReadAction(readForm)
  }

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow={`Conversation with ${displayName}`} title="Messages">
          <div className="message-thread">
            {detail.messages.map((message) => {
              const isOwn = message.senderProfile?.handle === viewerHandle
              return (
                <div
                  className={`message-bubble ${isOwn ? "message-own" : "message-other"}`}
                  key={message.id}
                >
                  <div className="message-meta">
                    <strong>{message.senderProfile?.displayName ?? "Unknown"}</strong>
                    <time>
                      {new Date(message.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    {isOwn && message.readAt ? <span className="read-receipt">Read</span> : null}
                  </div>
                  <p>{message.body}</p>
                </div>
              )
            })}
          </div>

          <form action={sendDirectMessageAction} className="message-compose">
            <input name="recipientHandle" type="hidden" value={recipientHandle} />
            <input name="redirectTo" type="hidden" value={`/messages/${conversationId}`} />
            <textarea name="body" placeholder={`Message ${displayName}...`} required rows={3} />
            <ActionButton type="submit">Send</ActionButton>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}
