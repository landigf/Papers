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
  const unreadMessageCount = session.viewer
    ? await repository.getUnreadMessageCount(viewerHandle)
    : 0

  return (
    <html lang="en">
      <body>
        <AppShell>
          <SiteHeader
            authMode={session.authMode}
            unreadMessageCount={unreadMessageCount}
            viewer={session.viewer}
          />
          <main className="page-shell">{children}</main>
        </AppShell>
      </body>
    </html>
  )
}
