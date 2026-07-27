import { useEffect } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
  Outlet,
  useBlocker,
} from 'react-router-dom'
import { StoreProvider } from './state'
import { WanderMatchProvider, useWanderMatch } from './wandermatch/store'
import Layout from './components/Layout'
import Home from './pages/Home'
import ModulesIndex from './pages/ModulesIndex'
import ModulePage from './pages/ModulePage'
import Dashboard from './pages/Dashboard'
import GlossaryPage from './pages/GlossaryPage'
import PocBuilder from './pages/PocBuilder'
import Example from './pages/Example'
import WanderMatch from './pages/WanderMatch'
import Usage from './pages/Usage'

// Confirms navigation away (in-app or reload/close) while a match is streaming.
function NavigationGuard() {
  const { running } = useWanderMatch()

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => running && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    const ok = window.confirm(
      'A destination match is still running.\n\nLeave this page? The run keeps going in the background and the result will be waiting when you return.',
    )
    if (ok) blocker.proceed()
    else blocker.reset()
  }, [blocker])

  useEffect(() => {
    if (!running) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [running])

  return null
}

function Root() {
  return (
    <StoreProvider>
      <WanderMatchProvider>
        <NavigationGuard />
        <Outlet />
      </WanderMatchProvider>
    </StoreProvider>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />}>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/modules" element={<ModulesIndex />} />
        <Route path="/module/:id" element={<ModulePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route path="/poc" element={<PocBuilder />} />
        <Route path="/example" element={<Example />} />
        <Route path="/wandermatch" element={<WanderMatch />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Route>,
  ),
)

export default function App() {
  return <RouterProvider router={router} />
}
