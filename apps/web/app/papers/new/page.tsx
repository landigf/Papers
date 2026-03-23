import { SectionCard } from "@papers/ui"
import { PaperForm } from "../../../components/paper-form"

export default function NewPaperPage() {
  return (
    <div className="content-columns">
      <div className="content-main">
        <PaperForm />
      </div>
      <aside className="content-side">
        <SectionCard eyebrow="Safety" title="Blind mode rules">
          <ul className="reason-list">
            <li>No public author name or profile link.</li>
            <li>No ORCID exposure on the paper page or feed card.</li>
            <li>No comment-author identity on blind threads.</li>
            <li>No blind content is sent to Grok.</li>
          </ul>
        </SectionCard>
      </aside>
    </div>
  )
}
