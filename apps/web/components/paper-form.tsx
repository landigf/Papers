import { ActionButton, SectionCard } from "@papers/ui"
import { createPaperAction } from "../app/actions"

export function PaperForm() {
  return (
    <SectionCard eyebrow="Publish" title="Share a paper or research note">
      <form action={createPaperAction} className="stacked-form">
        <label>
          Title
          <input
            name="title"
            placeholder="A clear title for the paper or open research note"
            required
          />
        </label>
        <label>
          Abstract
          <textarea
            name="abstract"
            placeholder="A public summary that makes the contribution, tension, or open problem clear."
            required
            rows={5}
          />
        </label>
        <label>
          Body
          <textarea
            name="bodyMarkdown"
            placeholder="Use markdown. Explain the idea, the setup, the result, or the open question."
            required
            rows={12}
          />
        </label>
        <label>
          Topic labels
          <input
            name="topicLabels"
            placeholder="agents, distributed systems, reproducibility"
            required
          />
        </label>
        <label>
          Visibility
          <select defaultValue="public" name="visibilityMode">
            <option value="public">Standard post</option>
            <option value="blind">Blind post</option>
          </select>
        </label>
        <p className="field-note">
          Blind posts hide public identity on feed cards, paper pages, and comments. In this slice,
          file uploads stay out of the execution path until the managed storage boundary is fully
          configured.
        </p>
        <ActionButton type="submit">Publish to Papers</ActionButton>
      </form>
    </SectionCard>
  )
}
