import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { glossary, glossaryGroups } from '../content/glossary'

export default function GlossaryPage() {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return glossary
    return glossary.filter(
      (g) => g.term.toLowerCase().includes(term) || g.def.toLowerCase().includes(term),
    )
  }, [q])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Glossary</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-300">
        Every term in the path. Use it as depth-review flashcards.
      </p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search terms…"
        className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-900/40"
      />

      {glossaryGroups.map((group) => {
        const items = filtered.filter((g) => g.group === group)
        if (!items.length) return null
        return (
          <section key={group} className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{group}</h2>
            <dl className="space-y-3">
              {items.map((g) => (
                <div
                  key={g.term}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <dt className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    {g.term}
                    {g.moduleId && (
                      <Link
                        to={`/module/${g.moduleId}`}
                        className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700 hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-300"
                      >
                        module →
                      </Link>
                    )}
                  </dt>
                  <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">{g.def}</dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-400">No terms match “{q}”.</p>
      )}
    </div>
  )
}
