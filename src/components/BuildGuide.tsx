import { Link } from 'react-router-dom'
import { useStore } from '../state'
import type { LayerRef } from '../lib/anthropic'

// Maps a PoC-builder layer to the module that teaches it + a do-it-yourself
// task (scoped to the user's problem) + done-criteria they tick off. The user
// writes the code in their own repo; this guide sequences and tracks it.
interface BuildSpec {
  moduleId: string
  moduleLabel: string
  task: (problem: string) => string
  done: string[]
}

const BUILD: Record<string, BuildSpec> = {
  skill: {
    moduleId: 'skills',
    moduleLabel: 'Skills',
    task: (p) => `Create the entry-point skill for "${p}" — a SKILL.md with a trigger-word description, the core steps, and allowed-tools.`,
    done: ['SKILL.md exists with a discoverable, trigger-word description', 'Runs the core procedure end-to-end', 'Invocable by name (and listed in AGENTS.md)'],
  },
  rules: {
    moduleId: 'rules',
    moduleLabel: 'Rules',
    task: (p) => `Write the always-on constraints "${p}" must obey (budget, safety, format, non-negotiables).`,
    done: ['Constraints captured as rules (CLAUDE.md or .claude/rules/)', 'Scoped correctly (global vs path)', 'No conflicts; precedence noted'],
  },
  mcp: {
    moduleId: 'mcp',
    moduleLabel: 'MCP servers',
    task: (p) => `Give the agent ground-truth data/actions for "${p}" via an MCP server (a documented stub is fine for the PoC).`,
    done: ['At least one MCP tool with a typed input/output schema', 'Auth via env vars — no hardcoded secrets', 'One write/destructive op gated'],
  },
  subagent: {
    moduleId: 'subagents',
    moduleLabel: 'Sub-agents',
    task: (p) => `Define a scoped sub-agent that does the heavy step for "${p}" and returns a summary.`,
    done: ['Agent file with a narrow goal + explicit inputs/outputs', 'Stop conditions / maxTurns set', 'Minimal tools (least privilege)'],
  },
  hook: {
    moduleId: 'hooks',
    moduleLabel: 'Hooks',
    task: (p) => `Add a deterministic guardrail that must always fire for "${p}" (e.g. block an unsafe action, verify a constraint).`,
    done: ['Hook configured on the right lifecycle event', 'Blocks a bad input (exit 2) and passes a good one', 'Documented: trigger + behavior'],
  },
  routine: {
    moduleId: 'routines',
    moduleLabel: 'Routines & tiers',
    task: (p) => `Make it run without you — schedule or trigger the flow for "${p}" non-interactively.`,
    done: ['Routine/automation created with a trigger', 'It runs; you read the transcript (green ≠ success)', 'Secrets handled safely'],
  },
  ci: {
    moduleId: 'routines',
    moduleLabel: 'Routines & tiers',
    task: (p) => `Gate build/test/scan for "${p}" on repo events via a CI pipeline step.`,
    done: ['A pipeline step runs the check', 'Fails on a bad change', 'Runs on the right trigger'],
  },
  plugin: {
    moduleId: 'plugins',
    moduleLabel: 'Plugins & marketplace',
    task: (p) => `Bundle your "${p}" stack into a versioned plugin others can install.`,
    done: ['Manifest with semver + contents list', 'Clean-profile install works', 'README with install/uninstall'],
  },
}

export default function BuildGuide({ problem, layers }: { problem: string; layers: LayerRef[] }) {
  const { state, toggleBuildStep } = useStore()

  // Build steps for the chosen layers (in the order given) + a final compose step.
  const steps = layers.filter((l) => BUILD[l.id]).map((l) => ({ layer: l, spec: BUILD[l.id] }))

  const allKeys: string[] = [
    ...steps.flatMap((s) => s.spec.done.map((_, i) => `${s.layer.id}#${i}`)),
    ...['run', 'baseline', 'demo'].map((k) => `compose#${k}`),
  ]
  const doneCount = allKeys.filter((k) => state.buildSteps[k]).length
  const pct = allKeys.length ? Math.round((doneCount / allKeys.length) * 100) : 0

  const Check = ({ k, label }: { k: string; label: string }) => (
    <label className="flex cursor-pointer items-start gap-2 text-sm">
      <input
        type="checkbox"
        className="mt-0.5 accent-emerald-600"
        checked={!!state.buildSteps[k]}
        onChange={() => toggleBuildStep(k)}
      />
      <span className={state.buildSteps[k] ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}>{label}</span>
    </label>
  )

  return (
    <section id="poc-build" className="mt-10">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">4 · Build it (you drive)</h2>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{doneCount}/{allKeys.length} done · {pct}%</span>
      </div>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        Build each layer in your own repo, in order. Each card links the module that teaches it and gives you a concrete
        task for <strong>your</strong> idea. Tick the criteria as you go — this is your hands-on PoC.
      </p>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ol className="space-y-3">
        {steps.map(({ layer, spec }, i) => (
          <li key={layer.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {i + 1}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{layer.label}</span>
              <Link
                to={`/module/${spec.moduleId}`}
                className="ml-auto rounded-lg bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700 hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-300"
              >
                Learn: {spec.moduleLabel} →
              </Link>
            </div>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
              <strong>Task:</strong> {spec.task(problem.trim() || 'your idea')}
            </p>
            <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 dark:border-slate-800">
              {spec.done.map((d, di) => (
                <Check key={di} k={`${layer.id}#${di}`} label={d} />
              ))}
            </div>
          </li>
        ))}

        {/* Final: compose & demo */}
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
            <strong>Task:</strong> wire the layers into one flow, then prove it.
          </p>
          <div className="mt-2 space-y-1 border-t border-brand-200/60 pt-2 dark:border-brand-800/60">
            <Check k="compose#run" label="Run the full flow end-to-end once (agentic)" />
            <Check k="compose#baseline" label="Do the same task manually once; record time / errors / consistency" />
            <Check k="compose#demo" label="Walk a reviewer through the trace + the agentic-vs-manual comparison" />
          </div>
        </li>
      </ol>

      {pct === 100 && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          🎉 PoC complete — every layer built and the composition demoed. That's the capstone.
        </p>
      )}
    </section>
  )
}
