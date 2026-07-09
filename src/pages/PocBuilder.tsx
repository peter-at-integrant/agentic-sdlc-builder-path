import { useMemo, useState } from 'react'
import AiIdeas from '../components/AiIdeas'

interface Layer {
  id: string
  label: string
  role: string
  gap: string
}

// canonical flow order
const LAYERS: Layer[] = [
  { id: 'skill', label: 'Skill / command', role: 'entry point — the procedure or shortcut the user invokes', gap: 'no repeatable trigger; back to ad-hoc prompts' },
  { id: 'rules', label: 'Rules', role: 'constraints the flow must obey', gap: 'wrong or unsafe actions slip through (platform, secrets, conventions)' },
  { id: 'mcp', label: 'MCP server', role: 'ground-truth data/actions from an external system', gap: 'stale or copy-pasted data; drift from the source of truth' },
  { id: 'subagent', label: 'Sub-agent', role: 'scoped worker that does the heavy step and returns a summary', gap: 'noise floods context; inconsistent results' },
  { id: 'hook', label: 'Hook', role: 'deterministic verification before/after a risky action', gap: 'a dangerous action or policy violation is not caught' },
  { id: 'routine', label: 'Routine / automation', role: 'runs the flow non-interactively on a trigger', gap: 'it only runs when someone remembers to' },
  { id: 'ci', label: 'CI pipeline', role: 'gates build/test/scan on repo events', gap: 'regressions ship unverified' },
  { id: 'plugin', label: 'Plugin + AGENTS.md', role: 'packages and routes the whole stack for reuse', gap: 'every repo drifts; no single source of truth' },
]

const PRESETS: Record<string, string> = {
  'DevOps: recurring CVE patch': 'Patch this cycle’s base-image CVEs across services',
  'Support: ticket triage': 'Triage incoming support tickets and draft first responses',
  'Personal: time-tracking watcher': 'Detect what I’m working on and log time into my tracker',
  'Content: weekly digest': 'Summarize the week’s activity into a shareable digest',
}

export default function PocBuilder() {
  const [problem, setProblem] = useState('')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  const chosen = LAYERS.filter((l) => selected[l.id])
  const enough = chosen.length >= 3 && problem.trim().length > 0

  const markdown = useMemo(() => {
    if (!enough) return ''
    const lines: string[] = []
    lines.push(`# Composition PoC — ${problem.trim()}`)
    lines.push('')
    lines.push(`**Layers used:** ${chosen.length} (minimum is 3)`)
    lines.push('')
    lines.push('## End-to-end trace')
    lines.push('```')
    lines.push(`User intent: "${problem.trim()}"`)
    chosen.forEach((l) => {
      lines.push(`  -> ${l.label.padEnd(22)}: ${l.role}`)
    })
    lines.push('```')
    lines.push('')
    lines.push('## Gap analysis (what breaks if a layer is missing)')
    lines.push('')
    lines.push('| Layer | If it’s missing… |')
    lines.push('|---|---|')
    chosen.forEach((l) => lines.push(`| ${l.label} | ${l.gap} |`))
    lines.push('')
    lines.push('## Demo checklist')
    lines.push('- [ ] Run the flow end-to-end once (agentic).')
    lines.push('- [ ] Run the same task manually once; record time / errors / consistency.')
    lines.push('- [ ] Note the quality delta (agentic vs manual baseline).')
    lines.push('- [ ] Walk a reviewer through the trace; answer why / when-not / quality / composition per layer.')
    return lines.join('\n')
  }, [enough, problem, chosen])

  const copy = () => {
    navigator.clipboard?.writeText(markdown).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'composition-poc.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">PoC Builder</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-300">
        The capstone: compose <strong>≥3 layers</strong> to solve a real problem, then export a trace
        and gap analysis you can demo.
      </p>

      {/* Step 1 */}
      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">1 · Pick a real problem</h2>
        <input
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="e.g. Patch this cycle’s base-image CVEs across services"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-900/40"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([label, val]) => (
            <button
              key={label}
              onClick={() => setProblem(val)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Step 2 */}
      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          2 · Select your layers <span className="normal-case text-slate-400">({chosen.length} chosen)</span>
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {LAYERS.map((l) => {
            const on = !!selected[l.id]
            return (
              <label
                key={l.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  on
                    ? 'border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-900/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1 accent-brand-600"
                  checked={on}
                  onChange={() => setSelected((s) => ({ ...s, [l.id]: !s[l.id] }))}
                />
                <span>
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{l.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{l.role}</span>
                </span>
              </label>
            )
          })}
        </div>
        {!enough && (
          <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
            {problem.trim() ? '' : 'Name a problem. '}
            {chosen.length < 3 ? `Select ${3 - chosen.length} more layer(s) to reach the minimum.` : ''}
          </p>
        )}
      </section>

      {/* Optional: AI brainstorm (bring your own key) */}
      <section className="mt-6">
        <AiIdeas layers={chosen.map((l) => l.label)} problem={problem} />
      </section>

      {/* Step 3 */}
      {enough && (
        <section className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">3 · Your PoC blueprint</h2>
            <div className="flex gap-2">
              <button onClick={copy} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                {copied ? 'Copied ✓' : 'Copy Markdown'}
              </button>
              <button onClick={download} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                Download .md
              </button>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-[13px] leading-6 text-slate-100 dark:bg-black/60">
            {markdown}
          </pre>
        </section>
      )}
    </div>
  )
}
