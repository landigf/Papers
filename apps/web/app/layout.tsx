import { AppShell } from "@papers/ui"
import type { Metadata } from "next"
import { SiteHeader } from "../components/site-header"
import { getSessionContext } from "../lib/viewer"
import "./globals.css"

export const metadata: Metadata = {
  title: "Papers",
  description: "A web-first platform for real research sharing and collaboration.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSessionContext()

  return (
    <html lang="en">
      <body>
        <AppShell>
          <SiteHeader authMode={session.authMode} viewer={session.viewer} />
          <main className="page-shell">{children}</main>
        </AppShell>
      </body>
    </html>
  )
}
