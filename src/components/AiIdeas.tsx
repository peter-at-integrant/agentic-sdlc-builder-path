import { useState } from 'react'
import Markdown from './Markdown'
import { MODELS, type ModelId, getApiKey, setApiKey, clearApiKey } from '../lib/keyStore'
import type { Idea, LayerRef } from '../lib/anthropic'

export default function AiIdeas({
  layers,
  problem,
  onUse,
}: {
  layers: LayerRef[]
  problem: string
  onUse: (problem: string, layerIds: string[]) => void
}) {
  const [key, setKey] = useState(() => getApiKey())
  const [saved, setSaved] = useState(() => !!getApiKey())
  const [model, setModel] = useState<ModelId>('claude-opus-4-8')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>([])

  const canGenerate = saved && key && layers.length >= 1 && !loading

  const save = () => {
    setApiKey(key.trim())
    setSaved(!!key.trim())
    setError('')
  }
  const forget = () => {
    clearApiKey()
    setKey('')
    setSaved(false)
    setIdeas([])
  }

  const run = async () => {
    setLoading(true)
    setError('')
    setIdeas([])
    const { generateIdeas, describeError } = await import('../lib/anthropic')
    try {
      const result = await generateIdeas({ apiKey: key.trim(), model, layers, problem })
      setIdeas(result)
    } catch (e) {
      setError(describeError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 dark:border-brand-900/50 dark:bg-brand-900/10">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">✨ Brainstorm with AI</h3>
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          bring your own key
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Stuck on what to build? Claude invents agentic ideas — in <strong>any domain</strong>, technical or not — that
        use your selected layers. Pick one to auto-fill the builder.
      </p>

      {/* Key management */}
      {!saved ? (
        <div className="mt-3">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Your Anthropic API key</label>
          <div className="mt-1 flex gap-2">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-ant-..."
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              onClick={save}
              disabled={!key.trim()}
              className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              Save
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            🔒 Stored <strong>only in this browser</strong> and sent <strong>directly to Anthropic</strong> — never to this
            site's servers (there are none). Get a key at{' '}
            <a href="https://console.anthropic.com/settings/keys" className="underline" target="_blank" rel="noreferrer">
              console.anthropic.com
            </a>
            . You pay Anthropic for your own usage. Use a limited key and clear it when done.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            key saved (this browser)
          </span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as ModelId)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} · {m.note}
              </option>
            ))}
          </select>
          <button
            onClick={run}
            disabled={!canGenerate}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            {loading ? 'Generating…' : ideas.length ? 'Regenerate' : 'Generate ideas'}
          </button>
          <button
            onClick={forget}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Forget key
          </button>
        </div>
      )}

      {saved && layers.length < 1 && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Select at least one layer above first.</p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </p>
      )}

      {ideas.length > 0 && (
        <div className="mt-3 space-y-3">
          {ideas.map((idea, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">{idea.name}</h4>
                  {idea.pitch && <p className="text-sm text-slate-600 dark:text-slate-300">{idea.pitch}</p>}
                </div>
                {idea.problem && (
                  <button
                    onClick={() => onUse(idea.problem, idea.layers)}
                    className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Use this idea →
                  </button>
                )}
              </div>
              {idea.details && (
                <div className="mt-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                  <Markdown>{idea.details}</Markdown>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
