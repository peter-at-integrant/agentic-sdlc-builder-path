import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { modules, moduleById } from '../content/modules'
import Markdown from '../components/Markdown'
import SelfCheck from '../components/SelfCheck'
import Quiz from '../components/Quiz'
import { useStore } from '../state'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      {children}
    </section>
  )
}

export default function ModulePage() {
  const { id } = useParams()
  const m = id ? moduleById(id) : undefined
  const { state, toggleComplete, setQuizScore } = useStore()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!m) {
    return (
      <div className="p-10 text-center text-slate-500">
        Module not found. <Link className="text-brand-600 underline" to="/modules">Back to modules</Link>.
      </div>
    )
  }

  const idx = modules.findIndex((x) => x.id === m.id)
  const prev = modules[idx - 1]
  const next = modules[idx + 1]
  const done = !!state.completed[m.id]

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{m.sg}</span>
        <span>Module {m.num} of {modules.length}</span>
        <span className="rounded bg-brand-100 px-2 py-0.5 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {m.mnemonic}
        </span>
      </div>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">{m.title}</h1>
      <p className="mt-1 text-lg text-slate-600 dark:text-slate-300">{m.tagline}</p>
      <p className="mt-3 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
        <strong>Baseline note:</strong> {m.baseline}
      </p>

      <Section title="Why"><Markdown>{m.why}</Markdown></Section>
      <Section title="When / Not"><Markdown>{m.whenNot}</Markdown></Section>
      <Section title="Quality bar"><Markdown>{m.quality}</Markdown></Section>
      <Section title="Composition"><Markdown>{m.composition}</Markdown></Section>
      <Section title="Reference"><Markdown>{m.reference}</Markdown></Section>

      <Section title="Hands-on lab">
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-900/50 dark:bg-brand-900/10">
          <Markdown>{m.lab}</Markdown>
        </div>
      </Section>

      <Section title="Depth-review self-check">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Answer each out loud before you claim this primitive. This mirrors the review gate.
        </p>
        <SelfCheck items={m.selfCheck} />
      </Section>

      <Section title="Quiz — grade yourself">
        <Quiz questions={m.quiz} onScore={(s) => setQuizScore(m.id, s)} />
      </Section>

      {/* Mark complete */}
      <div className="mt-10 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {done ? 'Marked complete. Nice work.' : 'Finished the lab and quiz?'}
        </div>
        <button
          onClick={() => toggleComplete(m.id)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            done
              ? 'border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {done ? 'Mark incomplete' : 'Mark complete ✓'}
        </button>
      </div>

      {/* Prev / next */}
      <nav className="mt-8 flex items-center justify-between gap-4">
        {prev ? (
          <Link to={`/module/${prev.id}`} className="group flex-1 rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-700">
            <div className="text-xs text-slate-400">← Previous</div>
            <div className="font-medium text-slate-800 group-hover:text-brand-600 dark:text-slate-200">{prev.title}</div>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link to={`/module/${next.id}`} className="group flex-1 rounded-xl border border-slate-200 p-4 text-right transition hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-700">
            <div className="text-xs text-slate-400">Next →</div>
            <div className="font-medium text-slate-800 group-hover:text-brand-600 dark:text-slate-200">{next.title}</div>
          </Link>
        ) : (
          <Link to="/poc" className="group flex-1 rounded-xl border border-brand-300 bg-brand-50 p-4 text-right transition hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-900/20">
            <div className="text-xs text-brand-500">Finish →</div>
            <div className="font-medium text-brand-700 dark:text-brand-300">Build your PoC</div>
          </Link>
        )}
      </nav>
    </article>
  )
}
