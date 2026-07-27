import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MODELS, type ModelId, getApiKey, setApiKey, clearApiKey } from '../lib/keyStore'
import type { Pick, TraceEntry, UsageSummary } from '../wandermatch/matcher'
import { costOf, fmtCost } from '../wandermatch/pricing'
import { appendRun, runFromSummary } from '../wandermatch/usageStore'

function Chips({
  options,
  value,
  multi,
  onChange,
}: {
  options: string[]
  value: string[]
  multi?: boolean
  onChange: (v: string[]) => void
}) {
  const toggle = (o: string) =>
    multi ? onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]) : onChange([o])
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o)
        return (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              on
                ? 'border-brand-400 bg-brand-50 font-medium text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-300'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div>
      {children}
    </div>
  )
}

const input =
  'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900'

export default function WanderMatch() {
  // interview state
  const [mood, setMood] = useState<string[]>([])
  const [moodOther, setMoodOther] = useState('')
  const [party, setParty] = useState<string[]>([])
  const [pace, setPace] = useState<string[]>([])
  const [climate, setClimate] = useState<string[]>([])
  const [dates, setDates] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [interestsOther, setInterestsOther] = useState('')
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [tripMin, setTripMin] = useState('')
  const [tripMax, setTripMax] = useState('')
  const [origin, setOrigin] = useState('')
  const [windowText, setWindowText] = useState('')

  // key + run state
  const [key, setKey] = useState(() => getApiKey())
  const [saved, setSaved] = useState(() => !!getApiKey())
  const [model, setModel] = useState<ModelId>('claude-opus-4-8')
  const [cache, setCache] = useState(true)
  const [running, setRunning] = useState(false)
  const [trace, setTrace] = useState<TraceEntry[]>([])
  const [showDebug, setShowDebug] = useState(false)
  const [showUsage, setShowUsage] = useState(false)
  const [usage, setUsage] = useState<UsageSummary | null>(null)
  const [runLabel, setRunLabel] = useState('')
  const [error, setError] = useState('')
  const [picks, setPicks] = useState<Pick[] | null>(null)
  const [actions, setActions] = useState<string[]>([])
  const [raw, setRaw] = useState('')

  const canRun = saved && key && origin.trim() && Number(budget) > 0 && Number(tripMin) > 0 && !running

  const run = async () => {
    setError('')
    setPicks(null)
    setActions([])
    setRaw('')
    setTrace([])
    setUsage(null)
    setRunning(true)
    const { runMatcher, describeError } = await import('../wandermatch/matcher')
    const { enforce } = await import('../wandermatch/validate')
    try {
      const profile = {
        mood: [...mood, ...(moodOther.trim() ? [moodOther.trim()] : [])],
        budget_ceiling: { amount: Number(budget), currency },
        dates_flexibility: dates[0] ?? 'flexible',
        target_window: windowText.trim(),
        party: party[0] ?? '',
        interests: [...interests, ...(interestsOther.trim() ? [interestsOther.trim()] : [])],
        pace: pace[0] ?? '',
        climate: climate[0] ?? '',
        origin: origin.trim(),
        trip_length_days: { min: Number(tripMin), max: Number(tripMax || tripMin) },
      }
      const r = await runMatcher({ apiKey: key.trim(), model, profile, cache, onEvent: (e) => setTrace((t) => [...t, e]) })
      const enforced = enforce(r.picks)
      setPicks(enforced.picks)
      setActions(enforced.actions)
      if (!enforced.picks.length) setRaw(r.raw)
      setUsage(r.usage)
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const label = `${runLabel.trim()} [cache ${cache ? 'on' : 'off'}]`.trim()
      appendRun(runFromSummary(r.usage, id, Date.now(), label))
    } catch (e) {
      setError(describeError(e))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">live demo · real AI</span>
        <Link to="/example" className="underline hover:text-slate-600 dark:hover:text-slate-300">
          see how it was built →
        </Link>
      </div>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">WanderMatch — try it live</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        The real agentic flow in your browser: answer a short interview, and a Claude-powered matcher calls live data
        tools (real climate + seeded cost/fare/advisory), applies the rules, and a deterministic backstop enforces
        safety/budget before you see the shortlist. Bring your own Anthropic key.
      </p>

      {/* Key */}
      {!saved ? (
        <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/40 p-4 dark:border-brand-900/50 dark:bg-brand-900/10">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Your Anthropic API key</div>
          <div className="mt-1 flex gap-2">
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-..." className={`min-w-0 flex-1 ${input}`} />
            <button
              onClick={() => {
                setApiKey(key.trim())
                setSaved(!!key.trim())
              }}
              disabled={!key.trim()}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              Save
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            🔒 Stored only in this browser, sent directly to Anthropic — never to any server. Get one at{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="underline">
              console.anthropic.com
            </a>
            . You pay Anthropic for your own usage (this runs a multi-step tool-use loop, so it costs a bit more than a single call).
          </p>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">key saved</span>
          <select value={model} onChange={(e) => setModel(e.target.value as ModelId)} className={`text-xs ${input}`}>
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} · {m.note}
              </option>
            ))}
          </select>
          <label
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
            title="Lever #1 — cache the tools+system prefix. Toggle off to capture a pre-caching baseline for the benchmark."
          >
            <input type="checkbox" checked={cache} onChange={(e) => setCache(e.target.checked)} />
            prompt caching
          </label>
          <button
            onClick={() => {
              clearApiKey()
              setKey('')
              setSaved(false)
            }}
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            Forget key
          </button>
        </div>
      )}

      {/* Interview */}
      <div className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mood (pick any)">
            <Chips multi options={['relax', 'adventure', 'culture', 'nature']} value={mood} onChange={setMood} />
            <input value={moodOther} onChange={(e) => setMoodOther(e.target.value)} placeholder="something else…" className={`mt-2 w-full ${input}`} />
          </Field>
          <Field label="Party">
            <Chips options={['solo', 'couple', 'family', 'friends']} value={party} onChange={setParty} />
          </Field>
          <Field label="Pace">
            <Chips options={['chill', 'balanced', 'packed']} value={pace} onChange={setPace} />
          </Field>
          <Field label="Climate">
            <Chips options={['warm', 'mild', 'cold', 'no preference']} value={climate} onChange={setClimate} />
          </Field>
          <Field label="Dates">
            <Chips options={['fixed dates', 'flexible ± weeks', 'anytime']} value={dates} onChange={setDates} />
          </Field>
          <Field label="Interests (pick any)">
            <Chips multi options={['history', 'food', 'nature & outdoors', 'museums & art']} value={interests} onChange={setInterests} />
            <input value={interestsOther} onChange={(e) => setInterestsOther(e.target.value)} placeholder="something else…" className={`mt-2 w-full ${input}`} />
          </Field>
        </div>

        <div className="grid gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2">
          <Field label="Budget ceiling (total)">
            <div className="flex items-center gap-2">
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 800" className={`w-28 ${input}`} />
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={`w-20 ${input}`} />
            </div>
            <input
              type="range"
              min={200}
              max={5000}
              step={50}
              value={Math.min(5000, Math.max(200, Number(budget) || 200))}
              onChange={(e) => setBudget(e.target.value)}
              className="mt-2 w-full accent-brand-600"
              aria-label="Budget slider"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$200</span>
              <span className="font-medium text-slate-500 dark:text-slate-300">{budget ? `${currency} ${Number(budget).toLocaleString()}` : 'drag or type'}</span>
              <span>$5,000+</span>
            </div>
          </Field>
          <Field label="Trip length (days)">
            <div className="flex items-center gap-2 text-sm">
              <input type="number" value={tripMin} onChange={(e) => setTripMin(e.target.value)} placeholder="min" className={`w-20 ${input}`} />
              <span className="text-slate-400">to</span>
              <input type="number" value={tripMax} onChange={(e) => setTripMax(e.target.value)} placeholder="max" className={`w-20 ${input}`} />
            </div>
          </Field>
          <Field label="Origin (home city / airport)">
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Cairo (CAI)" className={`w-full ${input}`} />
          </Field>
          <Field label="Target window (optional)">
            <input value={windowText} onChange={(e) => setWindowText(e.target.value)} placeholder="e.g. late Dec – early Jan" className={`w-full ${input}`} />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={run}
            disabled={!canRun}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            {running ? 'Matching…' : 'Match destinations'}
          </button>
          <input
            value={runLabel}
            onChange={(e) => setRunLabel(e.target.value)}
            placeholder="benchmark label (e.g. baseline)"
            title="Names this run in the usage benchmark ledger"
            className={`w-52 ${input}`}
          />
          {!saved && <span className="text-xs text-amber-600 dark:text-amber-400">Add your API key above first.</span>}
          {saved && !canRun && !running && <span className="text-xs text-slate-400">Fill origin, budget, and trip length.</span>}
        </div>
      </div>

      {/* Progress */}
      {running && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <div className="mb-1 font-medium text-slate-600 dark:text-slate-300">Agent working (tool-use loop)…</div>
          <ul className="space-y-0.5 font-mono">
            {trace
              .filter((e) => e.kind === 'tool_use')
              .slice(-8)
              .map((e, i) => (
                <li key={i}>→ {e.label}({(e.detail ?? '').replace(/\s+/g, ' ').slice(0, 50)})</li>
              ))}
          </ul>
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">{error}</p>}

      {/* Hook actions */}
      {actions.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/60 p-3 text-sm dark:border-amber-800 dark:bg-amber-900/20">
          <div className="font-medium text-amber-800 dark:text-amber-300">⚙ Safety/budget backstop adjusted the result:</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-amber-700 dark:text-amber-300/90">
            {actions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Results */}
      {picks && picks.length > 0 && (
        <div className="mt-4 space-y-3">
          {picks.map((p, i) => {
            const rec = p.tier === 'recommended'
            return (
              <div key={i} className={`rounded-xl border p-4 ${rec ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-900/10' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{p.destination}</span>
                  <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${rec ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {rec ? '✓ Recommended' : '⚠ Alternative'}
                  </span>
                  {typeof p.total_usd === 'number' && <span className="ml-auto text-xs text-slate-400">~${p.total_usd}{p.days ? ` · ${p.days}d` : ''}{typeof p.advisory_level === 'number' ? ` · adv ${p.advisory_level}` : ''}</span>}
                </div>
                {p.why && <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{p.why}</p>}
                {p.facts && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.facts}</p>}
                {!rec && p.gap && <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">Gap: {p.gap}</p>}
              </div>
            )
          })}
        </div>
      )}

      {picks && picks.length === 0 && raw && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-1 text-xs text-slate-400">Couldn't parse a structured shortlist — raw output:</div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">{raw}</pre>
        </div>
      )}

      {/* Usage benchmark — collapsible, collapsed by default so it stays out of the main flow */}
      {usage && (
        <div className="mt-4">
          <button
            onClick={() => setShowUsage((s) => !s)}
            className="text-xs font-medium text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {showUsage ? 'Hide' : 'Show'} usage benchmark — {usage.rounds} round-trips ·{' '}
            {usage.totals.total.toLocaleString()} tokens · ≈{fmtCost(costOf(usage.totals, usage.model))}
          </button>
          {showUsage && (
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['≈ cost', fmtCost(costOf(usage.totals, usage.model))],
                  ['round-trips', String(usage.rounds)],
                  ['tool calls', String(usage.toolCalls)],
                  ['wall-clock', `${(usage.durationMs / 1000).toFixed(1)}s`],
                  ['input (total)', usage.totals.total_input.toLocaleString()],
                  ['output', usage.totals.output.toLocaleString()],
                  ['cache-hit rate', `${(usage.cacheHitRate * 100).toFixed(0)}%`],
                  ['model', usage.model.replace('claude-', '')],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">{k}</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="text-slate-400">
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="py-1 pr-3 font-medium">#</th>
                      <th className="py-1 pr-3 font-medium">uncached in</th>
                      <th className="py-1 pr-3 font-medium">cache read</th>
                      <th className="py-1 pr-3 font-medium">cache write</th>
                      <th className="py-1 pr-3 font-medium">output</th>
                      <th className="py-1 font-medium">≈ cost</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-slate-600 dark:text-slate-300">
                    {usage.perMessage.map((m) => (
                      <tr key={m.round} className="border-b border-slate-50 last:border-0 dark:border-slate-800/50">
                        <td className="py-1 pr-3">{m.round}</td>
                        <td className="py-1 pr-3">{m.uncached_input.toLocaleString()}</td>
                        <td className="py-1 pr-3">{m.cache_read.toLocaleString()}</td>
                        <td className="py-1 pr-3">{m.cache_creation.toLocaleString()}</td>
                        <td className="py-1 pr-3">{m.output.toLocaleString()}</td>
                        <td className="py-1">{fmtCost(costOf(m, usage.model))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Saved to the <Link to="/usage" className="underline">usage benchmark ledger</Link>. ≈ estimate
                (token counts × published prices), not Anthropic billing.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Debug panel — the raw AI conversation + tool-use loop */}
      {trace.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowDebug((s) => !s)}
            className="text-xs font-medium text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {showDebug ? 'Hide' : 'Show'} debug log — AI messages &amp; tool calls ({trace.length} events)
          </button>
          {showDebug && (
            <div className="mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3">
              {trace.map((e, i) => {
                const head =
                  e.kind === 'assistant'
                    ? '🤖 assistant'
                    : e.kind === 'tool_use'
                      ? `🔧 tool_use · ${e.label}`
                      : e.kind === 'tool_result'
                        ? `📊 ${e.label}`
                        : `✅ ${e.label}`
                const color =
                  e.kind === 'tool_use'
                    ? 'text-sky-400'
                    : e.kind === 'tool_result'
                      ? 'text-emerald-400'
                      : e.kind === 'final'
                        ? 'text-amber-400'
                        : 'text-slate-200'
                return (
                  <div key={i} className="mb-2 border-b border-slate-800/60 pb-2 last:mb-0 last:border-0">
                    <div className={`font-mono text-[11px] font-semibold ${color}`}>{head}</div>
                    {e.detail && (
                      <pre className="mt-0.5 whitespace-pre-wrap font-mono text-[11px] leading-4 text-slate-400">{e.detail}</pre>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
