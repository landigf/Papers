import { ActionButton, SectionCard } from "@papers/ui"
import Link from "next/link"
import { getSessionContext } from "../../../lib/viewer"
import { linkOrcidAction, unlinkOrcidAction } from "../../actions"

export default async function IdentitySettingsPage() {
  const session = await getSessionContext()
  const viewer = session.viewer
  const linkedOrcid = viewer?.profile.orcid ?? null
  const isVerified = viewer?.profile.isVerifiedResearcher ?? false

  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Identity" title="ORCID and credibility">
          <p>
            Papers starts with email authentication and optional ORCID linking. Publishing does not
            require ORCID, but linked ORCID improves profile credibility and makes collaboration
            easier.
          </p>
          <ul className="reason-list">
            <li>Blind posts always suppress ORCID publicly.</li>
            <li>Blind-mode content never crosses the external AI boundary.</li>
          </ul>
        </SectionCard>

        {viewer ? (
          <SectionCard eyebrow="ORCID" title={linkedOrcid ? "ORCID linked" : "Link your ORCID"}>
            {linkedOrcid ? (
              <>
                <dl className="profile-grid">
                  <div>
                    <dt>ORCID iD</dt>
                    <dd>{linkedOrcid}</dd>
                  </div>
                  <div>
                    <dt>Verified researcher</dt>
                    <dd>{isVerified ? "Yes" : "No"}</dd>
                  </div>
                </dl>
                <p>
                  Your ORCID iD is visible on your{" "}
                  <Link href={`/u/${viewer.handle}`}>public profile</Link> for non-blind content.
                </p>
                <form action={unlinkOrcidAction}>
                  <ActionButton type="submit">Unlink ORCID</ActionButton>
                </form>
              </>
            ) : (
              <>
                <p>
                  No ORCID iD is linked to your account. Link one to improve profile credibility and
                  make it easier for collaborators to find your published work.
                </p>
                {session.authMode === "demo" ? (
                  <form action={linkOrcidAction} className="stacked-form">
                    <label>
                      ORCID iD
                      <input
                        name="orcidId"
                        pattern="\d{4}-\d{4}-\d{4}-\d{3}[\dX]"
                        placeholder="0000-0001-2345-6789"
                        required
                        title="Enter a valid ORCID iD (e.g. 0000-0001-2345-6789)"
                      />
                    </label>
                    <ActionButton type="submit">Link ORCID</ActionButton>
                  </form>
                ) : session.orcid.configured ? (
                  <p>
                    <a href="/api/auth/signin/orcid">Sign in with ORCID to link your account</a>
                  </p>
                ) : (
                  <p>
                    ORCID OAuth is not yet configured on this instance. Set{" "}
                    <code>PAPERS_ORCID_CLIENT_ID</code> and <code>PAPERS_ORCID_CLIENT_SECRET</code>{" "}
                    to enable ORCID linking.
                  </p>
                )}
              </>
            )}
          </SectionCard>
        ) : (
          <SectionCard eyebrow="ORCID" title="Link your ORCID">
            <p>
              <Link href="/sign-in">Sign in</Link> to link an ORCID iD to your account.
            </p>
          </SectionCard>
        )}
      </div>
    </div>
  )
}
