import { SectionCard } from "@papers/ui"
import Link from "next/link"
import { SignOutButton } from "../../../components/auth-forms"
import { getSessionContext } from "../../../lib/viewer"

export default async function AccountSettingsPage() {
  const session = await getSessionContext()

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Account" title="Account settings">
          {session.viewer ? (
            <>
              <p>
                Signed in as <strong>{session.viewer.profile.displayName}</strong> (
                {session.viewer.email}).
              </p>
              <p>
                Current mode: {session.authMode}. Managed auth activates automatically when the real
                auth stack is configured.
              </p>
              <SignOutButton />
            </>
          ) : (
            <>
              <p>No active viewer session.</p>
              <p>
                <Link href="/sign-in">Sign in</Link> or{" "}
                <Link href="/sign-up">create an account</Link>.
              </p>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
