import { useState } from 'react'
import Sidebar from './components/Sidebar'
import SignIn from './pages/SignIn'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import OperationsDashboard from './pages/OperationsDashboard'
import Zones from './pages/Zones'
import Incidents from './pages/Incidents'
import Reports from './pages/Reports'

type Page = 'landing' | 'signin' | 'dashboard' | 'operations' | 'zones' | 'incidents' | 'reports'
const PROTECTED: Page[] = ['dashboard', 'operations', 'zones', 'incidents', 'reports']

export default function App() {
  const [page, setPage]   = useState<Page>('landing')
  const [auth, setAuth]   = useState(false)

  const navigate = (p: string) => {
    const target = p as Page
    if (PROTECTED.includes(target) && !auth) { setPage('signin'); return }
    setPage(target)
  }

  if (page === 'landing') return <Landing navigate={navigate} />
  if (page === 'signin')  return <SignIn onSignIn={() => { setAuth(true); setPage('dashboard') }} navigate={navigate} />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1119' }}>
      <Sidebar page={page} navigate={navigate} onSignOut={() => { setAuth(false); setPage('landing') }} />
      {page === 'dashboard' && <Dashboard navigate={navigate} />}
      {page === 'operations' && <OperationsDashboard navigate={navigate} />}
      {page === 'zones'     && <Zones />}
      {page === 'incidents' && <Incidents />}
      {page === 'reports'   && <Reports />}
    </div>
  )
}
