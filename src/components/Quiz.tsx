import { useState } from 'react'
import type { QuizQuestion } from '../content/types'

export default function Quiz({
  questions,
  onScore,
}: {
  questions: QuizQuestion[]
  onScore: (score: number) => void
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const correct = questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0)
  const score = correct / questions.length
  const allAnswered = Object.keys(answers).length === questions.length

  const submit = () => {
    setSubmitted(true)
    onScore(score)
  }

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-3 font-medium text-slate-800 dark:text-slate-100">
            {qi + 1}. {q.q}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const chosen = answers[qi] === oi
              const isCorrect = q.answer === oi
              let cls =
                'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition '
              if (!submitted) {
                cls += chosen
                  ? 'border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              } else if (isCorrect) {
                cls += 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/30'
              } else if (chosen) {
                cls += 'border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-900/30'
              } else {
                cls += 'border-slate-200 opacity-70 dark:border-slate-800'
              }
              return (
                <label key={oi} className={cls}>
                  <input
                    type="radio"
                    name={`q-${qi}`}
                    className="accent-brand-600"
                    disabled={submitted}
                    checked={chosen}
                    onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                  />
                  <span className="text-slate-700 dark:text-slate-200">{opt}</span>
                </label>
              )
            })}
          </div>
          {submitted && (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              {answers[qi] === q.answer ? '✓ Correct. ' : '✗ '}
              {q.explain}
            </p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={submit}
          disabled={!allAnswered}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {allAnswered ? 'Submit answers' : `Answer all ${questions.length} to submit`}
        </button>
      ) : (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {correct}/{questions.length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {score === 1
              ? 'Perfect — you can defend this primitive.'
              : score >= 0.6
                ? 'Solid. Review the misses before your depth review.'
                : 'Re-read the module, then retry.'}
          </div>
          <button
            onClick={() => {
              setSubmitted(false)
              setAnswers({})
            }}
            className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
