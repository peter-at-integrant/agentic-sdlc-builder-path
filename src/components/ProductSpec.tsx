import { useState } from 'react'
import Markdown from './Markdown'
import { MODELS, type ModelId, getApiKey } from '../lib/keyStore'
import type { LayerRef } from '../lib/anthropic'

// "Spec it out as a product" — deep-dives the chosen problem into a business
// spec (one-liner, users, workflow, MVP/v2 feature list, layer mapping).
// Reuses the key the user saved in the Brainstorm panel (BYO key).
export default function ProductSpec({ problem, layers }: { problem: string; layers: LayerRef[] }) {
  const [model, setModel] = useState<ModelId>('claude-opus-4-8')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [spec, setSpec] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    setError('')
    setSpec('')
    const key = getApiKey()
    if (!key) {
      setError('Add your Anthropic API key in the ✨ Brainstorm panel above first — this reuses it.')
      return
    }
    setLoading(true)
    const { generateSpec, describeError } = await import('../lib/anthropic')
    try {
      const text = await generateSpec({ apiKey: key, model, problem, layers })
      setSpec(text)
    } catch (e) {
      setError(describeError(e))
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard?.writeText(spec).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  const download = () => {
    const blob = new Blob([spec], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-spec.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">📋 Spec it out as a product</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          uses your saved key
        </span>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value as ModelId)}
          className="ml-auto rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} · {m.note}
            </option>
          ))}
        </select>
        <button
          onClick={generate}
          disabled={!problem.trim() || loading}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
        >
          {loading ? 'Writing spec…' : spec ? 'Regenerate' : 'Generate product spec'}
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Turn your chosen idea into a business spec: one-liner, users, end-to-end workflow, an MVP-vs-later feature list,
        and how it maps to your agentic layers. Export it as Markdown.
      </p>

      {!problem.trim() && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Pick or type a problem above first.</p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </p>
      )}

      {spec && (
        <div className="mt-3">
          <div className="mb-2 flex justify-end gap-2">
            <button onClick={copy} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              {copied ? 'Copied ✓' : 'Copy Markdown'}
            </button>
            <button onClick={download} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
              Download .md
            </button>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <Markdown>{spec}</Markdown>
          </div>
        </div>
      )}
    </div>
  )
}
