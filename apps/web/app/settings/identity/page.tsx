import { SectionCard } from "@papers/ui"
import { getSessionContext } from "../../../lib/viewer"

export default async function IdentitySettingsPage() {
  const session = await getSessionContext()

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
            <li>ORCID configured: {session.orcid.configured ? "yes" : "not yet"}</li>
            <li>Discovery URL: {session.orcid.discoveryUrl}</li>
            <li>Blind posts always suppress ORCID publicly.</li>
            <li>Blind-mode content never crosses the external AI boundary.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}
