import { Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './state'
import Layout from './components/Layout'
import Home from './pages/Home'
import ModulesIndex from './pages/ModulesIndex'
import ModulePage from './pages/ModulePage'
import Dashboard from './pages/Dashboard'
import GlossaryPage from './pages/GlossaryPage'
import PocBuilder from './pages/PocBuilder'
import Example from './pages/Example'

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/modules" element={<ModulesIndex />} />
          <Route path="/module/:id" element={<ModulePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/poc" element={<PocBuilder />} />
          <Route path="/example" element={<Example />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </StoreProvider>
  )
}
