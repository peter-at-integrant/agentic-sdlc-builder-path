import Anthropic from '@anthropic-ai/sdk'
import type { ModelId } from '../lib/keyStore'
import { TOOL_DEFS, runTool } from './tools'

// The live matcher — a real tool-use loop in the browser (BYO key). Claude
// proposes candidates, calls the data tools itself, applies the rules, and
// returns a two-tier shortlist. Dynamically imported so the SDK stays out of
// the main bundle. Emits a full trace for the debug panel.

export interface Pick {
  destination: string
  tier: 'recommended' | 'alternative'
  advisory_level: number | null
  days?: number
  total_usd?: number | null
  budget_usd?: number
  why?: string
  facts?: string
  gap?: string | null
}

export interface Profile {
  mood: string[]
  budget_ceiling: { amount: number; currency: string }
  dates_flexibility: string
  target_window?: string
  party: string
  interests: string[]
  pace: string
  climate: string
  origin: string
  trip_length_days: { min: number; max: number }
}

export interface TraceEntry {
  kind: 'assistant' | 'tool_use' | 'tool_result' | 'final'
  label: string
  detail?: string
}

const SYSTEM = `You are the WanderMatch matcher. Given a traveler profile, return 3 destinations ranked by fit.
You are READ-ONLY: propose and explain; never book.

Process:
1. Propose ~8 candidate destinations from your own knowledge, biased to mood, interests, climate, origin.
2. Enrich each with the tools — never guess these values:
   - get_climate(location, country, month): pass country to disambiguate; use the month implied by the window (or a representative winter month if the user wants "cold" but gave no month).
   - get_cost(city), get_fare(origin, city), get_advisory(country). Map city -> country yourself.
3. Safety gate (absolute): advisory level >= 3 is EXCLUDED entirely — never shown, not even as an alternative.
4. Budget (total): total = fare.mid + daily_cost.mid * days, using the shortest in-range days that fits. If get_fare is null, the total is unverifiable -> alternative only. Never fabricate a fare.
5. Rank; split into ✓ Recommended (passes everything: advisory<=2 known, climate matches, total<=budget) and ⚠ Alternatives (fill to 3), each flagged with its gap.

When done, output ONLY this JSON (no prose, no code fence):
{"picks":[{"destination":"City, Country","tier":"recommended|alternative","advisory_level":<number|null>,"days":<n>,"total_usd":<n|null>,"budget_usd":<n>,"why":"...","facts":"climate + cost/fare breakdown","gap":"<reason if alternative, else null>"}]}
Provide 3 picks. Never fabricate climate/cost/fare/advisory; if a tool returns unknown, flag it.`

function extractJson(text: string): string {
  let t = text.trim()
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) t = fence[1].trim()
  const s = t.indexOf('{')
  const e = t.lastIndexOf('}')
  return s >= 0 && e > s ? t.slice(s, e + 1) : t
}

export interface RunResult {
  picks: Pick[]
  trace: TraceEntry[]
  raw: string
}

export async function runMatcher(opts: {
  apiKey: string
  model: ModelId
  profile: Profile
  onEvent?: (e: TraceEntry) => void
}): Promise<RunResult> {
  const { apiKey, model, profile, onEvent } = opts
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const trace: TraceEntry[] = []
  const emit = (e: TraceEntry) => {
    trace.push(e)
    onEvent?.(e)
  }

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: `Traveler profile:\n${JSON.stringify(profile, null, 2)}\n\nProduce the shortlist.` },
  ]

  for (let i = 0; i < 14; i++) {
    const resp = await client.messages.create({
      model,
      max_tokens: 2500,
      system: SYSTEM,
      tools: TOOL_DEFS as unknown as Anthropic.Tool[],
      messages,
    })

    if (resp.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: resp.content })
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const block of resp.content) {
        if (block.type === 'text' && block.text.trim()) {
          emit({ kind: 'assistant', label: 'assistant', detail: block.text.trim() })
        } else if (block.type === 'tool_use') {
          emit({ kind: 'tool_use', label: block.name, detail: JSON.stringify(block.input, null, 2) })
          const out = await runTool(block.name, block.input as any)
          emit({ kind: 'tool_result', label: `${block.name} → result`, detail: JSON.stringify(out, null, 2) })
          results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(out) })
        }
      }
      messages.push({ role: 'user', content: results })
      continue
    }

    const raw = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
    emit({ kind: 'final', label: 'final output', detail: raw })
    try {
      const parsed = JSON.parse(extractJson(raw))
      const picks: Pick[] = Array.isArray(parsed?.picks) ? parsed.picks : []
      return { picks, trace, raw }
    } catch {
      return { picks: [], trace, raw }
    }
  }
  throw new Error('Matcher did not converge (too many tool rounds).')
}

export function describeError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'Invalid API key (401).'
  if (e instanceof Anthropic.RateLimitError) return 'Rate limited (429) — wait and retry.'
  if (e instanceof Anthropic.APIError) return `API error ${e.status ?? ''}: ${e.message}`
  if (e instanceof Error) return e.message
  return 'Something went wrong.'
}
