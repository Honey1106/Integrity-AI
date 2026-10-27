import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { ActorRole } from '@/domain/types'
import { PersonaContext } from './PersonaContext'

export function AppShell() {
  const [activeRole, setActiveRole] = useState<ActorRole>('reviewer')
  const location = useLocation()
  const isCandidateRoute = location.pathname.startsWith('/demo/candidate')

  const actorLabel =
    activeRole === 'administrator' ? 'Administrator Dean M. Vance' : 'Reviewer Dr. Sarah Chen'

  if (isCandidateRoute) {
    return (
      <PersonaContext.Provider value={{ activeRole, setRole: setActiveRole, actorLabel }}>
        <Outlet />
      </PersonaContext.Provider>
    )
  }

  return (
    <PersonaContext.Provider value={{ activeRole, setRole: setActiveRole, actorLabel }}>
      <header className="app-header" role="banner">
        <div className="flex items-center gap-4">
          <NavLink to="/app" className="app-brand" aria-label="IntegrityAI home">
            <span className="app-brand-icon" aria-hidden="true">🛡</span>
            IntegrityAI
          </NavLink>

          <span className="env-pill" title="Local prototype environment with deterministic telemetry">
            <span className="env-dot" />
            PROTOTYPE ENV
          </span>
        </div>

        <nav className="app-nav-tabs" aria-label="Operational navigation">
          <NavLink
            to="/app"
            end
            className={({ isActive }) => `app-nav-tab${isActive ? ' active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/app/sessions"
            className={({ isActive }) => `app-nav-tab${isActive ? ' active' : ''}`}
          >
            Sessions
          </NavLink>
          <NavLink
            to="/app/signals"
            className={({ isActive }) => `app-nav-tab${isActive ? ' active' : ''}`}
          >
            Signal Queue
          </NavLink>
          <NavLink
            to="/app/audit"
            className={({ isActive }) => `app-nav-tab${isActive ? ' active' : ''}`}
          >
            Audit History
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <NavLink
            to="/demo/candidate/preflight"
            className="btn btn--secondary btn--sm"
            title="Open candidate consent & preflight check"
          >
            Candidate View ↗
          </NavLink>

          <div className="role-badge-selector">
            <span className="text-muted text-xs">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as ActorRole)}
              className="form-select text-xs"
              style={{ padding: '2px 6px', height: '24px', background: 'transparent' }}
              aria-label="Active demo role"
            >
              <option value="reviewer">Reviewer</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>
        </div>
      </header>

      <main id="main-content">
        <Outlet />
      </main>
    </PersonaContext.Provider>
  )
}
