import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { modules } from '../content/modules'
import { useStore } from '../state'

function ThemeToggle() {
  const { state, toggleTheme } = useStore()
  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label="Toggle theme"
    >
      {state.theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { state, percent, completedCount, totalModules } = useStore()
  return (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Your progress</span>
          <span>
            {completedCount}/{totalModules}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>
      {modules.map((m) => (
        <NavLink
          key={m.id}
          to={`/module/${m.id}`}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              isActive
                ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`
          }
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
              state.completed[m.id]
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
            }`}
          >
            {state.completed[m.id] ? '✓' : m.num}
          </span>
          <span className="truncate">{m.title}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const loc = useLocation()
  const showSidebar = loc.pathname.startsWith('/module')

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">A</span>
            <span className="hidden sm:inline">Agentic SDLC Builder Path</span>
            <span className="sm:hidden">ASBP</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-sm">
            {[
              ['/modules', 'Modules'],
              ['/poc', 'PoC Builder'],
              ['/example', 'Example'],
              ['/glossary', 'Glossary'],
              ['/dashboard', 'Dashboard'],
            ].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 transition ${
                    isActive
                      ? 'bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <span
              className="ml-1 hidden cursor-not-allowed rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-slate-400 dark:border-slate-700 md:inline"
              title="Accounts + GitHub sync arrive in Phase 2"
            >
              Login with GitHub · soon
            </span>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {showSidebar && (
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 dark:border-slate-800 lg:block">
            <Sidebar />
          </aside>
        )}
        <main className="min-w-0 flex-1">
          {showSidebar && (
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="m-4 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300 lg:hidden"
            >
              ☰ Modules
            </button>
          )}
          {mobileOpen && showSidebar && (
            <div className="border-b border-slate-200 dark:border-slate-800 lg:hidden">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          )}
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-400 dark:border-slate-800">
        <p>
          Agentic SDLC Builder Path · Code MIT · Content{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            className="underline hover:text-slate-600 dark:hover:text-slate-300"
          >
            CC BY 4.0
          </a>{' '}
          · Progress is stored locally in your browser.
        </p>
      </footer>
    </div>
  )
}
