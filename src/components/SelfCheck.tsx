import { useState } from 'react'

const dims = ['Why', 'When / Not', 'Quality', 'Composition']

export default function SelfCheck({ items }: { items: string[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({})
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        // strip a leading "Why:"/"Quality:" label if present; we show our own chip
        const clean = item.replace(/^\s*(why|when\/not|quality|composition)\s*:\s*/i, '')
        const isOpen = open[i]
        return (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <button
              onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <span className="inline-flex shrink-0 rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                {dims[i] ?? `Q${i + 1}`}
              </span>
              <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {clean}
              </span>
              <span className="text-slate-400">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Answer it out loud, then check yourself against the module’s{' '}
                <strong>{(dims[i] ?? '').toLowerCase() || 'relevant'}</strong> section above. If you
                can’t answer crisply, re-read that section before moving on.
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
