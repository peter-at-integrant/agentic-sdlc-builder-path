import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadState, saveState, type AppState } from './lib/storage'
import { modules } from './content/modules'

interface Store {
  state: AppState
  toggleComplete: (id: string) => void
  setQuizScore: (id: string, score: number) => void
  toggleTheme: () => void
  resetProgress: () => void
  completedCount: number
  totalModules: number
  percent: number
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const root = document.documentElement
    if (state.theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [state.theme])

  const toggleComplete = useCallback((id: string) => {
    setState((s) => ({ ...s, completed: { ...s.completed, [id]: !s.completed[id] } }))
  }, [])

  const setQuizScore = useCallback((id: string, score: number) => {
    setState((s) => ({
      ...s,
      quizScores: { ...s.quizScores, [id]: Math.max(score, s.quizScores[id] ?? 0) },
    }))
  }, [])

  const toggleTheme = useCallback(() => {
    setState((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
  }, [])

  const resetProgress = useCallback(() => {
    setState((s) => ({ ...s, completed: {}, quizScores: {} }))
  }, [])

  const completedCount = useMemo(
    () => modules.filter((m) => state.completed[m.id]).length,
    [state.completed],
  )

  const value: Store = {
    state,
    toggleComplete,
    setQuizScore,
    toggleTheme,
    resetProgress,
    completedCount,
    totalModules: modules.length,
    percent: Math.round((completedCount / modules.length) * 100),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
