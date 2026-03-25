import { SectionCard } from "@papers/ui"
import { createGroupAction } from "../../actions"

export default function NewGroupPage() {
  return (
    <div className="content-columns">
      <div className="content-main">
        <SectionCard eyebrow="New group" title="Start a research group or lab circle">
          <form action={createGroupAction} className="form-stack">
            <label htmlFor="name">
              Group name
              <input id="name" maxLength={120} minLength={3} name="name" required type="text" />
            </label>
            <label htmlFor="description">
              Description
              <textarea
                id="description"
                maxLength={2000}
                minLength={10}
                name="description"
                required
                rows={4}
              />
            </label>
            <label htmlFor="visibility">
              Visibility
              <select id="visibility" name="visibility">
                <option value="public">Public — anyone can discover and join</option>
                <option value="private">Private — visible only to members</option>
              </select>
            </label>
            <label htmlFor="topicLabels">
              Topics (comma-separated)
              <input
                id="topicLabels"
                name="topicLabels"
                placeholder="e.g. agents, evaluation, fuzzy logic"
                type="text"
              />
            </label>
            <button type="submit">Create group</button>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}
