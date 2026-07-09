import Anthropic from '@anthropic-ai/sdk'
import type { ModelId } from './keyStore'

// SDK-using code. Imported dynamically from AiIdeas so @anthropic-ai/sdk is a
// separate chunk fetched only when the user generates — not in the main bundle.
//
// BYO key: the user's key is read from localStorage and the call goes DIRECTLY
// from their browser to Anthropic (dangerouslyAllowBrowser) — never sent to
// this app's origin or any server we control.

export interface GenerateParams {
  apiKey: string
  model: ModelId
  layers: string[]
  problem?: string
}

const SYSTEM = `You are a product ideation partner for builders learning the Agentic SDLC.
Given a set of "layers" (agentic primitives) the user wants to practise with, invent
concrete, non-trivial agentic APP IDEAS that genuinely exercise MOST of those layers.
Avoid toy examples (no "1+1=2"). Prefer ideas a real person would actually use.

For EACH idea return, in Markdown:
- ### A short catchy name
- **Pitch:** one sentence on the real problem it solves.
- **Layers used:** a bullet per layer, mapping the layer to what it concretely does here.
- **End-to-end trace:** a short fenced block: intent -> command/skill -> rules -> MCP -> sub-agent -> hook/automation.
- **Why it's non-trivial:** one sentence.

Return 2-3 ideas. Be concrete and specific; no preamble, no closing remarks.`

export async function generateIdeas({ apiKey, model, layers, problem }: GenerateParams): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const prompt = [
    problem?.trim()
      ? `Problem the user cares about: "${problem.trim()}".`
      : 'No specific problem given — you pick real, useful problems.',
    `Layers to exercise: ${layers.join(', ')}.`,
    'Invent agentic app ideas that use MOST of these layers well.',
  ].join('\n')

  const resp = await client.messages.create({
    model,
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
}

export function describeError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'Invalid API key (401). Check the key and try again.'
  if (e instanceof Anthropic.PermissionDeniedError) return 'Key lacks permission for this model (403).'
  if (e instanceof Anthropic.RateLimitError) return 'Rate limited (429). Wait a moment and retry.'
  if (e instanceof Anthropic.APIError) return `API error ${e.status ?? ''}: ${e.message}`
  if (e instanceof Error) return e.message
  return 'Something went wrong. Check your key and network.'
}
