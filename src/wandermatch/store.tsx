import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getApiKey, type ModelId } from '../lib/keyStore'
import { appendRun, runFromSummary } from './usageStore'
import type { Pick, Profile, TraceEntry, UsageSummary } from './matcher'

// WanderMatch state lives here — in a provider mounted at the app root, NOT in
// the page component. Route changes don't unmount the provider, so inputs,
// results, and in-flight runs all survive navigation. Everything is persisted
// to localStorage so it also survives a reload (except a run that is actively
// streaming at reload time — that HTTP call can't be resumed).

export interface Inputs {
  mood: string[]
  moodOther: string
  party: string[]
  pace: string[]
  climate: string[]
  dates: string[]
  interests: string[]
  interestsOther: string
  budget: string
  currency: string
  tripMin: string
  tripMax: string
  origin: string
  windowText: string
  model: ModelId
  cache: boolean
  runLabel: string
}

export interface Result {
  picks: Pick[] | null
  actions: string[]
  assumptions: string
  raw: string
  trace: TraceEntry[]
  usage: UsageSummary | null
  error: string
}

export interface RequestRecord {
  id: string
  at: number
  label: string
  inputs: Inputs
  profile: Profile
  result: Result
}

const DEFAULT_INPUTS: Inputs = {
  mood: [],
  moodOther: '',
  party: [],
  pace: [],
  climate: [],
  dates: [],
  interests: [],
  interestsOther: '',
  budget: '',
  currency: 'USD',
  tripMin: '',
  tripMax: '',
  origin: '',
  windowText: '',
  model: 'claude-opus-4-8',
  cache: true,
  runLabel: '',
}

const EMPTY_RESULT: Result = { picks: null, actions: [], assumptions: '', raw: '', trace: [], usage: null, error: '' }

const INPUTS_KEY = 'asbp:wm-inputs'
const HISTORY_KEY = 'asbp:wm-history'
const CURRENT_KEY = 'asbp:wm-current'
const MAX_HISTORY = 25

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}
function loadArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

interface WMContextValue {
  inputs: Inputs
  update: (patch: Partial<Inputs>) => void
  result: Result
  running: boolean
  history: RequestRecord[]
  run: (budgetOverride?: number) => Promise<void>
  restore: (id: string) => void
  deleteRequest: (id: string) => void
  clearHistory: () => void
}

const WMContext = createContext<WMContextValue | null>(null)

export function WanderMatchProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<Inputs>(() => load(INPUTS_KEY, DEFAULT_INPUTS))
  const [result, setResult] = useState<Result>(() => load(CURRENT_KEY, EMPTY_RESULT))
  const [history, setHistory] = useState<RequestRecord[]>(() => loadArray<RequestRecord>(HISTORY_KEY))
  const [running, setRunning] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(INPUTS_KEY, JSON.stringify(inputs))
    } catch {
      /* storage disabled */
    }
  }, [inputs])
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      /* storage disabled */
    }
  }, [history])
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_KEY, JSON.stringify(result))
    } catch {
      /* storage disabled */
    }
  }, [result])

  const update = (patch: Partial<Inputs>) => setInputs((prev) => ({ ...prev, ...patch }))

  const run = async (budgetOverride?: number) => {
    const budgetAmount = budgetOverride ?? Number(inputs.budget)
    setResult({ ...EMPTY_RESULT })
    setRunning(true)
    const { runMatcher, describeError } = await import('./matcher')
    const { enforce } = await import('./validate')
    try {
      const profile: Profile = {
        mood: [...inputs.mood, ...(inputs.moodOther.trim() ? [inputs.moodOther.trim()] : [])],
        budget_ceiling: { amount: budgetAmount, currency: inputs.currency },
        dates_flexibility: inputs.dates[0] ?? 'flexible',
        target_window: inputs.windowText.trim(),
        party: inputs.party[0] ?? '',
        interests: [...inputs.interests, ...(inputs.interestsOther.trim() ? [inputs.interestsOther.trim()] : [])],
        pace: inputs.pace[0] ?? '',
        climate: inputs.climate[0] ?? '',
        origin: inputs.origin.trim(),
        trip_length_days: { min: Number(inputs.tripMin), max: Number(inputs.tripMax || inputs.tripMin) },
      }
      const r = await runMatcher({
        apiKey: getApiKey().trim(),
        model: inputs.model,
        profile,
        cache: inputs.cache,
        onEvent: (e) => setResult((prev) => ({ ...prev, trace: [...prev.trace, e] })),
      })
      const enforced = enforce(r.picks)
      const finalResult: Result = {
        picks: enforced.picks,
        actions: enforced.actions,
        assumptions: r.assumptions ?? '',
        raw: enforced.picks.length ? '' : r.raw,
        trace: r.trace,
        usage: r.usage,
        error: '',
      }
      setResult(finalResult)

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const at = Date.now()
      const label = `${inputs.runLabel.trim()} [cache ${inputs.cache ? 'on' : 'off'}]`.trim()
      appendRun(runFromSummary(r.usage, id, at, label))
      const snapshot: Inputs = { ...inputs, budget: String(budgetAmount) }
      setHistory((h) => [{ id, at, label, inputs: snapshot, profile, result: finalResult }, ...h].slice(0, MAX_HISTORY))
    } catch (e) {
      setResult((prev) => ({ ...prev, error: describeError(e) }))
    } finally {
      setRunning(false)
    }
  }

  const restore = (id: string) => {
    const rec = history.find((r) => r.id === id)
    if (!rec) return
    setInputs(rec.inputs)
    setResult(rec.result)
  }
  const deleteRequest = (id: string) => setHistory((h) => h.filter((r) => r.id !== id))
  const clearHistory = () => setHistory([])

  return (
    <WMContext.Provider value={{ inputs, update, result, running, history, run, restore, deleteRequest, clearHistory }}>
      {children}
    </WMContext.Provider>
  )
}

export function useWanderMatch(): WMContextValue {
  const ctx = useContext(WMContext)
  if (!ctx) throw new Error('useWanderMatch must be used within WanderMatchProvider')
  return ctx
}
