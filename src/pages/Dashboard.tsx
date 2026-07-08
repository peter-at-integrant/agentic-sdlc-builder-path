import { Link } from 'react-router-dom'
import { modules } from '../content/modules'
import { useStore } from '../state'

export default function Dashboard() {
  const { state, percent, completedCount, totalModules, resetProgress } = useStore()
  const quizzesTaken = modules.filter((m) => state.quizScores[m.id] != null).length
  const avgQuiz = quizzesTaken
    ? Math.round(
        (modules.reduce((s, m) => s + (state.quizScores[m.id] ?? 0), 0) / quizzesTaken) * 100,
      )
    : 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your dashboard</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-300">
        Progress is stored locally in this browser. Accounts + cross-device sync arrive in Phase 2.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ['Modules complete', `${completedCount}/${totalModules}`, `${percent}%`],
          ['Quizzes taken', `${quizzesTaken}/${totalModules}`, ''],
          ['Avg quiz score', `${avgQuiz}%`, ''],
        ].map(([label, big, sub]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{big}</div>
            {sub && <div className="text-xs text-brand-600 dark:text-brand-400">{sub}</div>}
          </div>
        ))}
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${percent}%` }} />
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Readiness by module</h2>
      <div className="space-y-2">
        {modules.map((m) => {
          const score = state.quizScores[m.id]
          const done = state.completed[m.id]
          return (
            <Link
              key={m.id}
              to={`/module/${m.id}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {done ? '✓' : m.num}
              </span>
              <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{m.title}</span>
              {score != null ? (
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    score >= 0.6
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  }`}
                >
                  quiz {Math.round(score * 100)}%
                </span>
              ) : (
                <span className="text-xs text-slate-400">no quiz yet</span>
              )}
            </Link>
          )
        })}
      </div>

      <button
        onClick={() => {
          if (confirm('Reset all local progress and quiz scores?')) resetProgress()
        }}
        className="mt-8 rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20"
      >
        Reset progress
      </button>
    </div>
  )
}
