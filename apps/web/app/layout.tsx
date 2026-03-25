import { createRepository } from "@papers/db"
import { AppShell } from "@papers/ui"
import type { Metadata } from "next"
import { SiteHeader } from "../components/site-header"
import { getSessionContext, getViewerHandleFromCookies } from "../lib/viewer"
import "./globals.css"

export const metadata: Metadata = {
  title: "Papers",
  description: "A web-first platform for real research sharing and collaboration.",
}

const repository = createRepository()

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSessionContext()
  const viewerHandle = await getViewerHandleFromCookies()
  const unreadNotificationCount = await repository.getUnreadNotificationCount(viewerHandle)

  return (
    <html lang="en">
      <body>
        <AppShell>
          <SiteHeader
            authMode={session.authMode}
            viewer={session.viewer}
            unreadNotificationCount={unreadNotificationCount}
          />
          <main className="page-shell">{children}</main>
        </AppShell>
      </body>
    </html>
  )
}
