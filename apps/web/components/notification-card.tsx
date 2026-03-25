import type { Notification } from "@papers/contracts"
import Link from "next/link"

const kindLabels: Record<Notification["kind"], string> = {
  new_follower: "Follower",
  comment: "Comment",
  citation: "Citation",
  group_invite: "Group invite",
  review_request: "Review request",
  peer_review_received: "Peer review",
  paper_starred: "Star",
}

export function NotificationCard({ notification }: { notification: Notification }) {
  const timeLabel = new Date(notification.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className={`notification-card ${notification.isRead ? "" : "notification-unread"}`}>
      <div className="notification-card-header">
        <span className="notification-kind-chip">{kindLabels[notification.kind]}</span>
        <span className="notification-time">{timeLabel}</span>
      </div>
      <p className="notification-title">{notification.title}</p>
      <p className="notification-body">{notification.body}</p>
      {notification.linkHref ? (
        <Link className="notification-link" href={notification.linkHref}>
          View details
        </Link>
      ) : null}
    </div>
  )
}
