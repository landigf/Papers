import type { User } from "@papers/contracts"
import Link from "next/link"

export function SiteHeader({
  viewer,
  authMode,
}: {
  viewer: User | null
  authMode: "demo" | "managed"
}) {
  return (
    <header className="site-header">
      <div className="brand-block">
        <Link className="brand-mark" href="/">
          Papers
        </Link>
      </div>
      <nav className="site-nav">
        <Link href="/feed">Feed</Link>
        <Link href="/papers/new">Publish</Link>
        <Link href="/conferences">Conferences</Link>
        <Link href="/groups">Groups</Link>
        <Link href="/digest">Digest</Link>
        <Link href="/opportunities">Jobs</Link>
        {viewer ? (
          <Link href={`/u/${viewer.handle}`}>
            {viewer.profile.displayName}
          </Link>
        ) : (
          <Link href="/sign-in">Sign in</Link>
        )}
        <Link href="/settings/account">Settings</Link>
        <Link href="/privacy">Privacy</Link>
        <span className={`mode-chip mode-chip-${authMode}`}>{authMode}</span>
      </nav>
    </header>
  )
}
