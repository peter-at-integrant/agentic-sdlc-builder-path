import Anthropic from '@anthropic-ai/sdk'
import type { ModelId } from './keyStore'

// SDK-using code. Imported dynamically from AiIdeas so @anthropic-ai/sdk is a
// separate chunk fetched only when the user generates — not in the main bundle.
//
// BYO key: the user's key is read from localStorage and the call goes DIRECTLY
// from their browser to Anthropic (dangerouslyAllowBrowser) — never sent to
// this app's origin or any server we control.

export interface LayerRef {
  id: string
  label: string
  role: string
}

export interface Idea {
  name: string
  pitch: string
  /** one-line problem statement the user can paste as their PoC problem */
  problem: string
  /** subset of the provided layer ids this idea uses */
  layers: string[]
  /** markdown: per-layer mapping + trace + why non-trivial */
  details: string
}

export interface GenerateParams {
  apiKey: string
  model: ModelId
  layers: LayerRef[]
  problem?: string
}

const SYSTEM = `You are an ideation partner for people learning to build agentic solutions.

Agentic solutions can solve ANY real problem — NOT just software or DevOps. Lifestyle, travel,
health, learning, food, relationships, home, money, entertainment, and hobbies are all fair game,
and are often the most compelling examples. Lean toward including non-technical, everyday ideas.

Given a set of agentic "layers" (primitives) the user wants to practise with, invent concrete,
non-trivial ideas that genuinely exercise MOST of those layers. Avoid toy examples. Prefer ideas
a real person would actually use.

Crucially, map each layer to a concrete role IN THE IDEA'S OWN DOMAIN. Example — a "match me to a
travel destination" idea:
- skill/command: runs a short interview about mood, budget, season, interests
- sub-agent: an itinerary matcher that scores countries against the profile
- rules: budget cap, visa eligibility, travel-advisory safety, dietary/accessibility needs
- MCP: flight prices, weather/climate, tours & activities, maps, visa/advisory feeds
- hook: never recommend a destination above a travel-advisory level; verify cost <= budget
- routine/automation: weekly re-scan for price drops or new matching tours, then notify

Return STRICT JSON only — no prose, no markdown code fences around the whole thing.`

function extractJson(text: string): string {
  let t = text.trim()
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) t = fence[1].trim()
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start >= 0 && end > start) return t.slice(start, end + 1)
  return t
}

export async function generateIdeas({ apiKey, model, layers, problem }: GenerateParams): Promise<Idea[]> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const catalog = layers.map((l) => `- ${l.id}: ${l.label} — ${l.role}`).join('\n')
  const prompt = `${
    problem?.trim()
      ? `The user cares about this problem: "${problem.trim()}". Build ideas around it (you may broaden or reframe it).`
      : 'No specific problem given — invent real, useful problems across varied domains. Include at least one non-technical, lifestyle idea (e.g. travel, health, learning, food).'
  }

Target layers to exercise (use these exact ids in the "layers" array):
${catalog}

Return ONLY this JSON shape:
{"ideas":[{
  "name":"short catchy name",
  "pitch":"one sentence on the real problem it solves",
  "problem":"a one-line problem statement the user could paste as their PoC problem",
  "layers":["<subset of the ids above this idea actually uses>"],
  "details":"Markdown: a bullet per layer mapping the layer to what it concretely does here; then a short fenced end-to-end trace (intent -> ...); then one line 'Why it's non-trivial:'"
}]}
Provide 2-3 ideas. Each should cover MOST of the target layers.`

  const resp = await client.messages.create({
    model,
    max_tokens: 2600,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  const known = new Set(layers.map((l) => l.id))
  try {
    const parsed = JSON.parse(extractJson(raw))
    const ideas: Idea[] = Array.isArray(parsed?.ideas) ? parsed.ideas : []
    return ideas.map((i) => ({
      name: String(i.name ?? 'Idea'),
      pitch: String(i.pitch ?? ''),
      problem: String(i.problem ?? ''),
      layers: Array.isArray(i.layers) ? i.layers.filter((x: unknown) => typeof x === 'string' && known.has(x)) : [],
      details: String(i.details ?? ''),
    }))
  } catch {
    // Graceful fallback: show the raw text as a single non-selectable idea.
    return [{ name: 'Ideas', pitch: '', problem: '', layers: [], details: raw }]
  }
}

export interface SpecParams {
  apiKey: string
  model: ModelId
  problem: string
  layers: LayerRef[]
}

const SPEC_SYSTEM = `You are a product strategist helping someone flesh out an agentic-solution idea into a
business-level product spec — the kind a founder or PM sketches before building. The idea can be
ANY domain (travel, health, learning, food, DevOps, etc.), technical or not.

Give the product a short working name, then produce a business-FIRST Markdown spec with EXACTLY
these four sections and headings:

## 1. The one-liner & who it's for
A one-sentence value proposition as a Markdown blockquote, then a line starting "Users:".

## 2. End-to-end workflow
A numbered list of the steps the business imagines, phrased as a flow (intake → ... → learn/refine).

## 3. Feature list (grouped, MVP vs later)
Grouped into lettered areas (A, B, C, ...), each with a short title and bullet features. Tag EACH
bullet with (MVP) or (v2).

## 4. How the workflow maps to the agentic layers
A Markdown table with columns "Layer" and "In <ProductName>", one row per provided target layer,
describing that layer's concrete role in this product.

Keep it business-first and concrete; avoid deep technical implementation detail. No preamble and no
closing remarks — start directly at "## 1.".`

export async function generateSpec({ apiKey, model, problem, layers }: SpecParams): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const targetLayers = layers.length
    ? layers.map((l) => l.label).join(', ')
    : 'Skill/command, Sub-agents, Rules, MCP, Hook, Routine/automation, Composition'

  const prompt = `Idea / problem: "${problem.trim()}".
Target agentic layers to reflect in the section-4 mapping: ${targetLayers}.
Write the product spec.`

  const resp = await client.messages.create({
    model,
    max_tokens: 4000,
    system: SPEC_SYSTEM,
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
