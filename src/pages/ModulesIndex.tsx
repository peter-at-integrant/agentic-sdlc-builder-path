import { Link } from 'react-router-dom'
import { modules } from '../content/modules'
import { useStore } from '../state'

export default function ModulesIndex() {
  const { state } = useStore()
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Modules</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-300">
        Work them in order, or jump to a gap. Each ends with a lab and a quiz.
      </p>
      <ol className="mt-6 space-y-3">
        {modules.map((m) => (
          <li key={m.id}>
            <Link
              to={`/module/${m.id}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  state.completed[m.id]
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {state.completed[m.id] ? '✓' : m.num}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{m.title}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {m.mnemonic}
                  </span>
                </div>
                <p className="truncate text-sm text-slate-600 dark:text-slate-300">{m.tagline}</p>
              </div>
              {state.quizScores[m.id] != null && (
                <span className="ml-auto shrink-0 text-xs font-medium text-slate-400">
                  quiz {Math.round(state.quizScores[m.id] * 100)}%
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
