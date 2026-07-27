import { Link } from 'react-router-dom'
import Markdown from '../components/Markdown'

// A fixed, no-key-needed worked example of the whole PoC building process,
// using the real "WanderMatch" travel-matcher PoC. Study it, then build your
// own in the PoC Builder.

const REPO = 'https://github.com/peter-at-integrant/wandermatch-poc'

const IDEA =
  'Recommend a country that matches my mood, budget, and constraints — from a short interview, safety- and budget-checked.'

const SPEC_MD = `> **WanderMatch** replaces hours of searching with a short conversation: tell it your mood, budget, and constraints, and it returns a ranked, safety- and budget-checked shortlist of destinations.

**Users:** choice-overwhelmed travelers, busy professionals, couples/groups who can't agree, and "surprise me" spontaneous types.

### End-to-end workflow
1. Intake interview → 2. Traveler profile → 3. Propose candidates → 4. Enrich with real data → 5. Apply rules → 6. Rank into ✓ Recommended / ⚠ Alternatives → 7. Finalize (hook-validated) → 8. Weekly re-scan

### Feature list (MVP vs later)
- **A. Conversational intake** — 3-step interview: chips for the enums, typed for user-specific logistics, "Something else" to type *(MVP)*
- **B. Traveler profile** — structured object; hard constraints vs soft preferences separated *(MVP)*
- **C. Matching engine** — rank by mood, climate, budget, interests; ✓/⚠ tiers with "why it fits" *(MVP)*
- **D. Guardrails** — advisory ≥3 excluded, budget (total) enforced *(MVP)*
- **E. Data** — real climate + seeded cost/fare/advisory stubs *(MVP)*; live pricing *(v2)*
- **F. Monitoring** — weekly re-scan for changes *(MVP: headless)*; cloud Routine *(v2)*
- **G. Trust** — show *why*; flag stub vs real data; never fabricate *(MVP)*`

const TRACE = `User intent: "plan a trip that matches my mood / budget / constraints"
  -> skill  plan-my-trip     : 3-step interview (chips + stepped logistics) -> traveler profile
  -> rules  CLAUDE.md         : budget total, advisory >=3 excluded, transparency
  -> MCP    wandermatch-data  : get_climate (REAL, open-meteo) + get_cost/get_fare/get_advisory (stubs)
  -> agent  matcher           : propose ~8 -> enrich -> apply rules -> rank -> Recommended / Alternatives
  -> finalize -> hook         : blocks advisory>=3 / unknown-as-recommended / over-budget
  -> routine rescan.sh        : non-interactive weekly re-scan (cloud Routine promotion documented)`

interface Step {
  moduleId: string
  moduleLabel: string
  layer: string
  role: string
  built: string
}

const BUILD: Step[] = [
  {
    moduleId: 'skills',
    moduleLabel: 'Skills',
    layer: 'Skill — plan-my-trip',
    role: 'entry point — the interview → a structured profile',
    built: '3 grouped steps: chip questions for the enums (mood/party/pace/climate/dates/interests), a stepped typed group for user-specific logistics (budget/trip-length/origin) with no invented samples, and "Something else" to type.',
  },
  {
    moduleId: 'rules',
    moduleLabel: 'Rules',
    layer: 'Rules — CLAUDE.md',
    role: 'always-on non-negotiables',
    built: 'Budget as a TOTAL (airfare + on-ground); a documented 1–4 advisory scale with ≥3 excluded; transparency. Safety is absolute; budget degrades gracefully.',
  },
  {
    moduleId: 'mcp',
    moduleLabel: 'MCP servers',
    layer: 'MCP — wandermatch-data',
    role: 'ground-truth data (the "many factors")',
    built: '4 read-only tools. get_climate is REAL (open-meteo, keyless → no secrets); get_cost/get_fare/get_advisory are honest stubs (flag source, return null for unknown; fares only from the modeled origin).',
  },
  {
    moduleId: 'subagents',
    moduleLabel: 'Sub-agents',
    layer: 'Sub-agent — matcher',
    role: 'scoped, read-only ranker; returns a summary',
    built: 'Proposes ~8, enriches via the MCP tools, applies the rules, returns a two-tier ✓ Recommended / ⚠ Alternatives shortlist. Least-privilege tools, maxTurns stop, never fabricates.',
  },
  {
    moduleId: 'hooks',
    moduleLabel: 'Hooks',
    layer: 'Hook — validate-recommendation',
    role: 'deterministic backstop at finalize',
    built: 'A PreToolUse hook on the finalize write blocks advisory ≥3, unknown-advisory-as-Recommended, or a ✓ pick over budget. Keeps unknown ≠ excluded. Unit-tested across block/allow cases.',
  },
  {
    moduleId: 'routines',
    moduleLabel: 'Routines & tiers',
    layer: 'Routine — rescan.sh',
    role: 'the non-interactive tier',
    built: 'Headless re-scan over a saved profile (the interview stays interactive; only the re-scan is automated). Cloud Claude Routine promotion + a tier matrix are documented.',
  },
]

const PROOF = [
  { d: 'Istanbul, Türkiye', tier: '✓ Recommended', adv: '2', total: '$665', note: 'cold match, in budget' },
  { d: 'Tbilisi, Georgia', tier: '✓ (after +$10)', adv: '2', total: '$710', note: 'best cold match; at ceiling' },
  { d: 'Amman, Jordan', tier: '⚠ Alternative', adv: '2', total: '$620', note: 'mild, not cold' },
]

const EVIDENCE = [
  ['Unreachable ✓ branch', 'Budget was defined as a total incl. airfare, but there was no fare tool → nothing could ever qualify. Added get_fare (a Layer 2/3 gap, closed).'],
  ['Silent safety failure', 'A stale MCP build returned null for a level-4 country, collapsing "excluded" into "unknown". This is why the hook exists — a backstop independent of the matcher and data freshness. Kept unknown ≠ excluded.'],
  ['Geocoding mismatch', '"Cappadocia" resolved to Italy. Fixed with tolerant country matching (Türkiye↔Turkey) that flags genuine mismatches instead of using them.'],
  ['Empty-results UX', 'Strict filters returned nothing. Switched to a two-tier output — always show the 3 best, alternatives clearly flagged.'],
  ['Hardcoded "flying-from"', 'Origin defaulted to Cairo. Made origin a typed, user-specific field; get_fare returns null (unverified) for any origin it doesn\'t model.'],
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
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">worked example</span>
        <span>real, built PoC · no API key needed to read</span>
      </div>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
        WanderMatch — a PoC built end-to-end
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        A real 6-layer agentic PoC — a non-technical (travel) idea, to show an agentic solution can be{' '}
        <strong>anything</strong>. Study the finished build, then{' '}
        <Link to="/poc" className="text-brand-600 underline dark:text-brand-400">
          build your own in the PoC Builder
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={REPO}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Browse the full repo on GitHub →
        </a>
        <Link
          to="/wandermatch"
          className="inline-block rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Try it live (real AI) →
        </Link>
      </div>

      <Section n="1" title="The idea">
        <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
          {IDEA}
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          A lifestyle problem — yet it exercises six layers. That's the whole point.
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
          Six layers, each earning its place. Remove one and something breaks — no data (MCP), no safety (hook), no
          "runs itself" (routine).
        </p>
      </Section>

      <Section n="4" title="What each layer became (with links to learn it)">
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
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{s.built}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section n="5" title="What it produced (a real run)">
        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
          Profile: <em>solo · relax + culture · cold · $700 · 5–6 days · from Cairo</em>. Raising the budget by $10
          re-computed everything and flipped Tbilisi to Recommended — the hook then validated and allowed the finalize.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-1 pr-3">Destination</th>
                <th className="py-1 pr-3">Tier</th>
                <th className="py-1 pr-3">Advisory</th>
                <th className="py-1 pr-3">Total</th>
                <th className="py-1">Note</th>
              </tr>
            </thead>
            <tbody>
              {PROOF.map((p) => (
                <tr key={p.d} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-1.5 pr-3 font-medium text-slate-800 dark:text-slate-100">{p.d}</td>
                  <td className="py-1.5 pr-3">{p.tier}</td>
                  <td className="py-1.5 pr-3">{p.adv}</td>
                  <td className="py-1.5 pr-3">{p.total}</td>
                  <td className="py-1.5 text-slate-500 dark:text-slate-400">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="6" title="What testing caught (iterate-on-evidence)">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          The most instructive part: real testing surfaced real bugs, and each fix improved a layer. This trail is the
          quality story a reviewer wants.
        </p>
        <ul className="space-y-2">
          {EVIDENCE.map(([title, body]) => (
            <li key={title} className="rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{title}.</span>{' '}
              <span className="text-slate-600 dark:text-slate-300">{body}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section n="7" title="Honest limitations (name them)">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Cost / fare / advisory are seeded stubs (flagged); only climate is real. Fares model one origin (others →
          unverified). Climate is season-dependent but the stubs aren't (a representative winter month is used for
          "cold", flagged). Some place names geocode imperfectly (flagged, not worked around). Stating limits plainly is
          part of the quality bar.
        </p>
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
