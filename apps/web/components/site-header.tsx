import type { User } from "@papers/contracts"
import Link from "next/link"

export function SiteHeader({
  viewer,
  authMode,
  unreadNotificationCount,
}: {
  viewer: User | null
  authMode: "demo" | "managed"
  unreadNotificationCount: number
}) {
  return (
    <header className="site-header">
      <div className="brand-block">
        <Link className="brand-mark" href="/">
          Papers
        </Link>
        <p className="brand-copy">
          A place where research is shared, discussed, and improved before it gets flattened into
          professional theatre.
        </p>
      </div>
      <nav className="site-nav">
        <Link href="/feed">Feed</Link>
        <Link href="/conferences">Conferences</Link>
        <Link href="/digest">Digest</Link>
        <Link href="/opportunities">Opportunities</Link>
        <Link href="/notifications" className="nav-notifications">
          Notifications
          {unreadNotificationCount > 0 ? (
            <span className="unread-badge">{unreadNotificationCount}</span>
          ) : null}
        </Link>
        <Link href="/papers/new">New post</Link>
        {viewer ? <Link href={`/u/${viewer.handle}`}>Profile</Link> : null}
        <Link href="/settings/account">Account</Link>
        <span className={`mode-chip mode-chip-${authMode}`}>{authMode} mode</span>
      </nav>
    </header>
  )
}
