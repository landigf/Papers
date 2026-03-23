import { SectionCard } from "@papers/ui"
import Link from "next/link"
import { SignOutButton } from "../../../components/auth-forms"
import { getSessionContext } from "../../../lib/viewer"
import { updateProfileAction } from "../../actions"

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
              <form action={updateProfileAction} className="stacked-form">
                <input name="redirectTo" type="hidden" value="/settings/account" />
                <label>
                  Headline
                  <input
                    defaultValue={session.viewer.profile.headline ?? ""}
                    name="headline"
                    placeholder="Building infrastructure for living research"
                  />
                </label>
                <label>
                  Bio
                  <textarea
                    defaultValue={session.viewer.profile.bio ?? ""}
                    name="bio"
                    placeholder="What are you trying to understand, build, or collaborate on?"
                    rows={5}
                  />
                </label>
                <label>
                  Affiliation
                  <input
                    defaultValue={session.viewer.profile.affiliation ?? ""}
                    name="affiliation"
                    placeholder="ETH Zurich"
                  />
                </label>
                <label>
                  Research interests
                  <input
                    defaultValue={session.viewer.profile.researchInterests.join(", ")}
                    name="interestLabels"
                    placeholder="agents, open review, fuzzy logic"
                  />
                </label>
                <button className="secondary-link" type="submit">
                  Update profile
                </button>
              </form>
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
