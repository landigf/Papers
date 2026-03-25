import { createRepository } from "@papers/db"
import { NotificationCard } from "../../components/notification-card"
import { getViewerHandleFromCookies } from "../../lib/viewer"
import { markNotificationsReadAction } from "../actions"

const repository = createRepository()

export default async function NotificationsPage() {
  const viewerHandle = await getViewerHandleFromCookies()
  const notifications = await repository.getNotifications(viewerHandle)
  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div className="page-grid">
      <div className="section-card">
        <div className="notification-page-header">
          <div>
            <span className="section-eyebrow">Notification center</span>
            <h1>Notifications</h1>
            <p>
              Activity on your papers, profile, and conference submissions.
              {notifications.length === 0 ? " Nothing here yet." : ""}
            </p>
          </div>
          {hasUnread ? (
            <form action={markNotificationsReadAction}>
              <button className="secondary-link" type="submit">
                Mark all as read
              </button>
            </form>
          ) : null}
        </div>
      </div>
      <div className="notification-stack">
        {notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  )
}
