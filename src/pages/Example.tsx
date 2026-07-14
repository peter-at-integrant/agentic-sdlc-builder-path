import { Link } from 'react-router-dom'
import Markdown from '../components/Markdown'

// A fixed, no-key-needed worked example of the whole PoC building process,
// using the "WanderMatch" travel-matcher idea. Study it, then build your own
// in the PoC Builder. Deliberately shows the process + each layer's role +
// a do-it-yourself task (no finished code — you write that).

const IDEA =
  'Recommend a country and a rough itinerary that matches my mood, budget, and constraints — from a short interview.'

const SPEC_MD = `> **WanderMatch** replaces hours of searching with a 5-minute conversation: tell it your mood, budget, and constraints, and it returns a ranked shortlist of destinations with itineraries that fit — then watches for deals and re-plans as things change.

**Users:** choice-overwhelmed travelers, busy professionals, couples/groups who can't agree, and "surprise me" spontaneous types.

### End-to-end workflow
1. Intake interview → 2. Build traveler profile → 3. Generate candidate destinations → 4. Rank + explain fit → 5. Sketch itinerary for the pick → 6. Validate (safety / budget / visa) → 7. Assemble booking → 8. Monitor prices & advisories, alert & re-plan → 9. Learn from choices, refine

### Feature list (MVP vs later)
- **A. Conversational intake** — guided MCQ interview (mood, budget band, dates, party, pace, interests) with an "Other / describe" free-text escape *(MVP)*; adaptive follow-ups *(MVP)*
- **B. Traveler profile** — synthesized, editable; hard constraints vs soft preferences separated *(MVP)*; saved profiles *(v2)*
- **C. Matching engine** — rank by mood, climate/season, budget, activities, travel time; shortlist of 3–5 with "why this fits you" *(MVP)*; "more/less like this" *(v2)*
- **D. Guardrails** — filter above a travel-advisory threshold, enforce budget ceiling, visa/dietary/accessibility *(MVP)*
- **E. Itinerary** — day-by-day matched to interests *(MVP)*; pace control + rainy-day alternates *(v2)*
- **F. Data** — weather, cost, tours, advisories, maps *(MVP: 2–3 sources)*; live flight/stay prices *(v2)*
- **G. Booking** — assemble a bookable plan + deep links *(MVP)*; assisted booking *(v2)*
- **H. Monitoring** — watch price drops / new tours / advisory changes → notify & re-plan *(v2)*
- **I. Personalization** — learn from accepted/rejected picks *(v2)*
- **J. Group & sharing** — shareable shortlist + group votes *(v2)*
- **K. Trust** — show *why* each recommendation; let users correct facts *(MVP)*`

const TRACE = `User intent: "Recommend a trip that matches my mood, budget, and constraints"
  -> skill/command : intake interview (MCQ + "Other") -> traveler profile
  -> rules         : budget ceiling, advisory threshold, visa/dietary/accessibility
  -> MCP           : weather, cost, tours, safety-advisory, maps
  -> sub-agents    : interviewer (parse free-text) + matcher (rank destinations)
  -> hook          : verify pick — not above advisory level, total cost <= budget
  -> routine       : weekly re-scan for deals / advisory changes -> notify & re-plan`

interface Step {
  moduleId: string
  moduleLabel: string
  layer: string
  role: string
  task: string
}

const BUILD: Step[] = [
  {
    moduleId: 'skills',
    moduleLabel: 'Skills',
    layer: 'Skill / command',
    role: 'the entry point — runs the interview and produces a traveler profile',
    task: 'Build the intake skill: a guided MCQ interview (mood, budget band, dates flexibility, party, pace, interests) with an "Other / describe" free-text escape, ending in a clean profile object.',
  },
  {
    moduleId: 'rules',
    moduleLabel: 'Rules',
    layer: 'Rules',
    role: 'the non-negotiables every recommendation must respect',
    task: 'Encode the constraints: budget ceiling, travel-advisory threshold, visa feasibility, dietary & accessibility needs.',
  },
  {
    moduleId: 'mcp',
    moduleLabel: 'MCP servers',
    layer: 'MCP',
    role: 'ground-truth data behind the "many factors"',
    task: 'Connect the data: weather/season, cost-of-travel, tours/activities, safety advisories, maps (a documented stub is fine for the PoC).',
  },
  {
    moduleId: 'subagents',
    moduleLabel: 'Sub-agents',
    layer: 'Sub-agents',
    role: 'scoped workers that do the heavy thinking',
    task: 'Add a matcher sub-agent that scores destinations against the profile and returns a ranked shortlist with "why it fits"; and an interviewer sub-agent that turns "Other" free-text into structured profile signals.',
  },
  {
    moduleId: 'hooks',
    moduleLabel: 'Hooks',
    layer: 'Hook',
    role: 'a deterministic guardrail that always fires',
    task: 'Verify every recommendation before finalizing: reject any destination above the advisory threshold, and confirm total cost ≤ budget.',
  },
  {
    moduleId: 'routines',
    moduleLabel: 'Routines & tiers',
    layer: 'Routine / automation',
    role: 'runs without anyone at the keyboard',
    task: 'Schedule a weekly re-scan for price drops, new matching tours, or advisory changes on a saved trip → notify and re-plan.',
  },
]

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {n} · {title}
      </h2>
      {children}
    </section>
  )
}

export default function Example() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">worked example</span>
        <span>no API key needed</span>
      </div>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
        WanderMatch — a PoC built end-to-end
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        One complete pass through the PoC building process, using a non-technical idea (travel) to show that an agentic
        solution can be <strong>anything</strong>. Study the flow, then{' '}
        <Link to="/poc" className="text-brand-600 underline dark:text-brand-400">
          build your own in the PoC Builder
        </Link>
        .
      </p>

      <Section n="1" title="The idea">
        <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
          {IDEA}
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          It's a lifestyle problem — yet it exercises six layers. That's the whole point.
        </p>
      </Section>

      <Section n="2" title="Spec it as a product (business view)">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Markdown>{SPEC_MD}</Markdown>
        </div>
      </Section>

      <Section n="3" title="Compose the layers (end-to-end trace)">
        <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-[13px] leading-6 text-slate-100 dark:bg-black/60">
          {TRACE}
        </pre>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Six layers, each earning its place. If any is missing, something breaks — no data (MCP), no safety (hook), no
          "runs itself" (routine).
        </p>
      </Section>

      <Section n="4" title="Build it, layer by layer (you drive)">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          For your own PoC these become tickable tasks in the{' '}
          <Link to="/poc" className="text-brand-600 underline dark:text-brand-400">
            Build Guide
          </Link>
          . Here's what each layer looks like for WanderMatch:
        </p>
        <ol className="space-y-3">
          {BUILD.map((s, i) => (
            <li key={s.layer} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {i + 1}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{s.layer}</span>
                <Link
                  to={`/module/${s.moduleId}`}
                  className="ml-auto rounded-lg bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700 hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-300"
                >
                  Learn: {s.moduleLabel} →
                </Link>
              </div>
              <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">{s.role}</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                <strong>Task:</strong> {s.task}
              </p>
            </li>
          ))}
          <li className="rounded-xl border border-brand-300 bg-brand-50/50 p-4 dark:border-brand-700 dark:bg-brand-900/10">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">★</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Compose &amp; demo</span>
              <Link
                to="/module/composition"
                className="ml-auto rounded-lg bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700 hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-300"
              >
                Learn: Composition →
              </Link>
            </div>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
              <strong>Task:</strong> wire the layers into one flow, run it end-to-end, then compare against researching a
              trip by hand (time, errors, consistency) and walk a reviewer through it.
            </p>
          </li>
        </ol>
      </Section>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">Your turn</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Pick any problem you care about and run the same process.</div>
        </div>
        <Link to="/poc" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Open the PoC Builder →
        </Link>
      </div>
    </div>
  )
}
