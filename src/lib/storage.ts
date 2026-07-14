// Tiny localStorage-backed store. Phase 2 will swap this for a synced backend.

const KEY = 'asbp:v1'

export interface AppState {
  /** module id → completed */
  completed: Record<string, boolean>
  /** module id → best quiz score (0..1) */
  quizScores: Record<string, number>
  /** build-guide step key ("<layerId>#<criterionIndex>") → done */
  buildSteps: Record<string, boolean>
  theme: 'light' | 'dark'
}

const empty: AppState = { completed: {}, quizScores: {}, buildSteps: {}, theme: 'light' }

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...empty }
    return { ...empty, ...(JSON.parse(raw) as Partial<AppState>) }
  } catch {
    return { ...empty }
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / disabled storage */
  }
}
