import { getPapersConfig } from "@papers/config"
import { type ProviderTaskKind, type SafeAiPayload, safeAiPayloadSchema } from "@papers/contracts"

const TASK_SYSTEM_PROMPTS: Record<ProviderTaskKind, string> = {
  "tag-extraction":
    "Extract 3-8 concise topic tags from the given research title and abstract. Return only a comma-separated list of lowercase tags. Never infer hidden identity. Example output: machine learning, evaluation, reproducibility",
  "summary-refinement":
    "Rewrite the given research abstract to be clearer and more concise while preserving the original meaning. Return only the improved abstract. Never infer hidden identity.",
  "interest-explanation":
    "Given a researcher's interests and a paper's topics, explain in 1-2 sentences why this paper is relevant to them. Be specific about the overlap. Never infer hidden identity.",
  "opportunity-summary":
    "Summarize this research opportunity in 1-2 sentences, highlighting what makes it distinctive and who would benefit most. Never infer hidden identity.",
}

export class GrokProvider {
  readonly #config = getPapersConfig()

  get enabled(): boolean {
    return Boolean(this.#config.PAPERS_XAI_API_KEY)
  }

  assertSafe(payload: SafeAiPayload): void {
    const parsed = safeAiPayloadSchema.parse(payload)

    if (parsed.isBlindContent || parsed.containsPrivateDraft) {
      throw new Error("Blind or private content cannot be sent to Grok.")
    }
  }

  async complete(task: ProviderTaskKind, text: string): Promise<string> {
    this.assertSafe({
      task,
      isBlindContent: false,
      containsPrivateDraft: false,
      text,
    })

    if (!this.enabled || !this.#config.PAPERS_XAI_API_KEY) {
      return ""
    }

    const systemPrompt = TASK_SYSTEM_PROMPTS[task]

    const response = await fetch(`${this.#config.PAPERS_XAI_BASE_URL}/responses`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.#config.PAPERS_XAI_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.#config.PAPERS_XAI_MODEL,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: systemPrompt,
              },
            ],
          },
          {
            role: "user",
            content: [{ type: "input_text", text }],
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Grok request failed with ${response.status}`)
    }

    const payload = (await response.json()) as { output_text?: string }
    return payload.output_text ?? ""
  }
}
