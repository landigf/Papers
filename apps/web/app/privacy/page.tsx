import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy — Papers",
}

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <h1>Privacy Policy</h1>
      <p>
        Papers is built with privacy as a first-class feature. We believe research sharing should
        not require surveillance. Here is exactly what we collect and what we do not.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong> — When you sign up, we store your name, email, and
          optional ORCID identifier. This is required for authentication.
        </li>
        <li>
          <strong>Content you create</strong> — Papers, comments, group posts, and profile
          information you choose to share.
        </li>
        <li>
          <strong>Anonymous view counts</strong> — When a paper page is loaded, we record a
          one-way hash of the visitor's IP address and user agent. This lets us show approximate
          view counts without identifying individual visitors. The raw IP and user agent are never
          stored.
        </li>
      </ul>

      <h2>What we do NOT collect</h2>
      <ul>
        <li>No tracking cookies</li>
        <li>No third-party analytics (no Google Analytics, no Mixpanel, no Plausible)</li>
        <li>No advertising pixels or trackers</li>
        <li>No fingerprinting</li>
        <li>No cross-site tracking</li>
        <li>No selling or sharing of data with third parties</li>
      </ul>

      <h2>Blind submissions</h2>
      <p>
        Papers published in "blind" mode have their author identity stripped from all public views.
        The system ensures blind content is never sent to external AI services, and comments on
        blind papers do not reveal participant identities.
      </p>

      <h2>Data storage</h2>
      <p>
        All data is stored in a PostgreSQL database. There is no cloud analytics pipeline. View
        count hashes are not reversible — they cannot be used to reconstruct IP addresses.
      </p>

      <h2>Your rights</h2>
      <ul>
        <li>You can delete your account and all associated data at any time</li>
        <li>You can export your papers and profile data</li>
        <li>You can publish anonymously using blind mode</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Reach out to the platform operator directly.
      </p>
    </div>
  )
}
