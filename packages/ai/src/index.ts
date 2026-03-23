import { getPapersConfig } from "@papers/config"
import { type ProviderTaskKind, type SafeAiPayload, safeAiPayloadSchema } from "@papers/contracts"

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

  async complete(
    task: ProviderTaskKind,
    text: string,
    flags: { isBlindContent: boolean; containsPrivateDraft: boolean },
  ): Promise<string> {
    this.assertSafe({
      task,
      isBlindContent: flags.isBlindContent,
      containsPrivateDraft: flags.containsPrivateDraft,
      text,
    })

    if (!this.enabled || !this.#config.PAPERS_XAI_API_KEY) {
      return ""
    }

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
                text: "Return concise structured text for a public research product. Never infer hidden identity.",
              },
            ],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: `${task}\n\n${text}` }],
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
