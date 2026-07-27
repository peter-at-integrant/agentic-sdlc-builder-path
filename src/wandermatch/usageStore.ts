import type { ModelId } from '../lib/keyStore'
import type { UsageSummary } from './matcher'
import { costOf } from './pricing'

// A per-browser ledger of WanderMatch runs — the benchmark history. Estimates
// only; not authoritative Anthropic billing.

const RUNS_KEY = 'asbp:wm-usage-runs'
const BUDGET_KEY = 'asbp:wm-usage-budget'
const BASELINE_KEY = 'asbp:wm-usage-baseline'
const DEFAULT_BUDGET = 5

export interface UsageRun {
  id: string
  label: string
  at: number
  model: ModelId
  rounds: number
  toolCalls: number
  totals: UsageSummary['totals']
  cacheHitRate: number
  durationMs: number
  costUsd: number
}

export function runFromSummary(u: UsageSummary, id: string, at: number, label: string): UsageRun {
  return {
    id,
    at,
    label: label.trim() || `run ${new Date(at).toLocaleString()}`,
    model: u.model,
    rounds: u.rounds,
    toolCalls: u.toolCalls,
    totals: u.totals,
    cacheHitRate: u.cacheHitRate,
    durationMs: u.durationMs,
    costUsd: costOf(u.totals, u.model),
  }
}

export function loadRuns(): UsageRun[] {
  try {
    const raw = localStorage.getItem(RUNS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function saveRuns(runs: UsageRun[]): void {
  try {
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs))
  } catch {
    /* storage disabled */
  }
}

export function appendRun(run: UsageRun): UsageRun[] {
  const runs = [run, ...loadRuns()]
  saveRuns(runs)
  return runs
}

export function renameRun(id: string, label: string): UsageRun[] {
  const runs = loadRuns().map((r) => (r.id === id ? { ...r, label } : r))
  saveRuns(runs)
  return runs
}

export function deleteRun(id: string): UsageRun[] {
  const runs = loadRuns().filter((r) => r.id !== id)
  saveRuns(runs)
  return runs
}

export function clearRuns(): void {
  saveRuns([])
}

export function getBudget(): number {
  try {
    const n = Number(localStorage.getItem(BUDGET_KEY))
    return n > 0 ? n : DEFAULT_BUDGET
  } catch {
    return DEFAULT_BUDGET
  }
}

export function setBudget(n: number): void {
  try {
    localStorage.setItem(BUDGET_KEY, String(n > 0 ? n : DEFAULT_BUDGET))
  } catch {
    /* storage disabled */
  }
}

export function getBaselineId(): string {
  try {
    return localStorage.getItem(BASELINE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setBaselineId(id: string): void {
  try {
    if (id) localStorage.setItem(BASELINE_KEY, id)
    else localStorage.removeItem(BASELINE_KEY)
  } catch {
    /* storage disabled */
  }
}
