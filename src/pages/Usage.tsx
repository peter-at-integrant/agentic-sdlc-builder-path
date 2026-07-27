import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fmtCost } from '../wandermatch/pricing'
import {
  loadRuns,
  clearRuns,
  renameRun,
  deleteRun,
  getBudget,
  setBudget as persistBudget,
  getBaselineId,
  setBaselineId,
  type UsageRun,
} from '../wandermatch/usageStore'

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  )
}

function Delta({ n, fmt }: { n: number; fmt: (x: number) => string }) {
  if (n === 0) return <span className="text-slate-400">—</span>
  const up = n > 0
  return (
    <span className={up ? 'text-rose-500' : 'text-emerald-500'}>
      {up ? '▲' : '▼'} {fmt(Math.abs(n))}
    </span>
  )
}

export default function Usage() {
  const [runs, setRuns] = useState<UsageRun[]>(() => loadRuns())
  const [budget, setBudget] = useState(() => getBudget())
  const [baseline, setBaseline] = useState(() => getBaselineId())

  const totalCost = runs.reduce((a, r) => a + r.costUsd, 0)
  const totalTokens = runs.reduce((a, r) => a + r.totals.total, 0)
  const pct = budget > 0 ? Math.min(100, (totalCost / budget) * 100) : 0
  const base = runs.find((r) => r.id === baseline) ?? null

  const onBudget = (v: number) => {
    const n = v > 0 ? v : 5
    setBudget(n)
    persistBudget(n)
  }
  const onBaseline = (id: string) => {
    const next = baseline === id ? '' : id
    setBaseline(next)
    setBaselineId(next)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          token benchmark
        </span>
        <Link to="/wandermatch" className="underline hover:text-slate-600 dark:hover:text-slate-300">
          ← back to WanderMatch
        </Link>
      </div>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Usage benchmark</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        A per-browser ledger of WanderMatch runs — the baseline for measuring token-usage optimizations.
        Set a run as <strong>baseline</strong>, apply an optimization (prompt caching, fewer round-trips, leaner
        tool results…), then re-run and read the <strong>delta</strong>. Costs are estimates, not Anthropic billing.
      </p>

      {runs.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No runs yet. Run a match on{' '}
          <Link to="/wandermatch" className="underline">
            WanderMatch
          </Link>{' '}
          and it will appear here.
        </div>
      ) : (
        <>
          {/* Cumulative */}
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <Stat label="runs" value={String(runs.length)} />
            <Stat label="≈ total cost" value={fmtCost(totalCost)} sub="estimate" />
            <Stat label="total tokens" value={totalTokens.toLocaleString()} />
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-400">
                <span>budget</span>
                <span>
                  $
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => onBudget(Number(e.target.value))}
                    className="w-16 rounded border border-slate-300 bg-transparent px-1 text-right text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  />
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : 'bg-brand-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-400">{pct.toFixed(1)}% used · editable · estimate</div>
            </div>
          </div>

          {/* Ledger */}
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="p-2 font-medium">baseline</th>
                  <th className="p-2 font-medium">label</th>
                  <th className="p-2 font-medium">model</th>
                  <th className="p-2 font-medium">rounds</th>
                  <th className="p-2 font-medium">tools</th>
                  <th className="p-2 font-medium">tokens (in/out)</th>
                  <th className="p-2 font-medium">cache</th>
                  <th className="p-2 font-medium">time</th>
                  <th className="p-2 font-medium">≈ cost</th>
                  <th className="p-2 font-medium">Δ vs base</th>
                  <th className="p-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-300">
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/50">
                    <td className="p-2">
                      <input
                        type="radio"
                        checked={baseline === r.id}
                        onChange={() => onBaseline(r.id)}
                        title="Set as baseline"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        defaultValue={r.label}
                        onBlur={(e) => e.target.value !== r.label && setRuns(renameRun(r.id, e.target.value))}
                        className="w-36 rounded border border-transparent bg-transparent px-1 hover:border-slate-300 focus:border-brand-400 dark:hover:border-slate-700"
                      />
                      <div className="px-1 text-[10px] text-slate-400">{new Date(r.at).toLocaleString()}</div>
                    </td>
                    <td className="p-2 font-mono">{r.model.replace('claude-', '')}</td>
                    <td className="p-2 font-mono">{r.rounds}</td>
                    <td className="p-2 font-mono">{r.toolCalls}</td>
                    <td className="p-2 font-mono">
                      {r.totals.total_input.toLocaleString()} / {r.totals.output.toLocaleString()}
                    </td>
                    <td className="p-2 font-mono">{(r.cacheHitRate * 100).toFixed(0)}%</td>
                    <td className="p-2 font-mono">{(r.durationMs / 1000).toFixed(1)}s</td>
                    <td className="p-2 font-mono">{fmtCost(r.costUsd)}</td>
                    <td className="p-2 font-mono">
                      {base && base.id !== r.id ? (
                        <div className="space-y-0.5">
                          <Delta n={r.costUsd - base.costUsd} fmt={fmtCost} />
                          <div className="text-[10px]">
                            <Delta n={r.totals.total - base.totals.total} fmt={(x) => `${x.toLocaleString()} tok`} />
                          </div>
                        </div>
                      ) : base && base.id === r.id ? (
                        <span className="text-[10px] uppercase text-brand-500">baseline</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">set a baseline</span>
                      )}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => setRuns(deleteRun(r.id))}
                        className="text-slate-300 hover:text-rose-500"
                        title="Delete run"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => {
                clearRuns()
                setRuns([])
                setBaseline('')
                setBaselineId('')
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Reset ledger
            </button>
            <span className="text-xs text-slate-400">
              Stored locally in this browser only. See{' '}
              <a href="https://github.com/peter-at-integrant/agentic-sdlc-builder-path/blob/main/docs/USAGE-BENCHMARK.md" className="underline">
                the benchmark spec
              </a>{' '}
              for the optimization backlog.
            </span>
          </div>
        </>
      )}
    </div>
  )
}
