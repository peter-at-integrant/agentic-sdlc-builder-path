import { Link } from 'react-router-dom'
import { modules } from '../content/modules'
import { useStore } from '../state'

export default function Home() {
  const { percent, completedCount } = useStore()
  return (
    <div className="px-4">
      {/* Hero */}
      <section className="mx-auto max-w-3xl py-16 text-center">
        <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          Open learning path · free forever
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
          Become an <span className="text-brand-600 dark:text-brand-400">Agentic SDLC</span> builder
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Ten hands-on modules that take you from using AI coding agents to building the platform
          behind them — skills, hooks, commands, rules, MCP, sub-agents, routines, plugins, and
          composition. Each module is built around a four-part depth review: <strong>why · when/not ·
          quality · composition</strong>.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/module/skills"
            className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Start the path →
          </Link>
          <Link
            to="/poc"
            className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Try the PoC Builder
          </Link>
        </div>
        {completedCount > 0 && (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            You’re {percent}% through — <Link to="/dashboard" className="text-brand-600 underline dark:text-brand-400">see your dashboard</Link>.
          </p>
        )}
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl border-t border-slate-200 py-12 dark:border-slate-800">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            ['Learn', 'Each module explains a primitive on the four depth-review dimensions, with real config examples.'],
            ['Practice', 'A hands-on lab per module produces a real artifact. Grade yourself with a quiz.'],
            ['Compose', 'Finish by building a ≥3-layer proof of concept and tracing it end-to-end.'],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Module grid */}
      <section className="mx-auto max-w-5xl pb-20">
        <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">The ten modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.id}
              to={`/module/${m.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {m.num}
                </span>
                {m.sg}
              </div>
              <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
                {m.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{m.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
