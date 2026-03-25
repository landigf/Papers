import { ActionButton, SectionCard } from "@papers/ui"
import { createOpportunityAction } from "../../actions"

export default function NewOpportunityPage() {
  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="Post opportunity" title="Share a research position or collaboration">
          <form action={createOpportunityAction} className="stacked-form">
            <label>
              Title
              <input
                maxLength={200}
                minLength={8}
                name="title"
                placeholder="e.g. Postdoc in ML systems evaluation"
                required
              />
            </label>

            <label>
              Organization
              <input
                maxLength={160}
                minLength={2}
                name="organization"
                placeholder="e.g. MIT CSAIL"
                required
              />
            </label>

            <label>
              Type
              <select name="kind" required>
                <option value="open_position">Open position</option>
                <option value="visiting_researcher">Visiting researcher</option>
                <option value="visiting_student">Visiting student</option>
                <option value="internship">Internship</option>
                <option value="collaboration">Collaboration request</option>
                <option value="call_for_papers">Call for papers</option>
              </select>
            </label>

            <label>
              Mode
              <select name="mode" required>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>

            <label>
              Location
              <input
                maxLength={120}
                minLength={2}
                name="location"
                placeholder="e.g. Zurich, Cambridge MA, remote"
                required
              />
            </label>

            <label>
              Summary
              <textarea
                maxLength={2000}
                minLength={20}
                name="summary"
                placeholder="Describe the opportunity, expectations, and what kind of collaborator you are looking for."
                required
                rows={5}
              />
            </label>

            <label>
              Topics (comma-separated)
              <input
                name="topicLabels"
                placeholder="e.g. agents, evaluation, computational biology"
              />
              <span className="field-note">Up to 8 topic labels to help with matching.</span>
            </label>

            <label>
              External URL (optional)
              <input maxLength={500} name="url" placeholder="https://..." type="url" />
            </label>

            <ActionButton type="submit">Post opportunity</ActionButton>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}
