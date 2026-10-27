import { NavLink, Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="demo-banner" role="status" aria-live="polite">
        ⚠️ <strong>DEMO MODE</strong> — All data is simulated. No real assessments or candidates.
      </div>
      <nav className="app-nav" aria-label="Operator navigation">
        <NavLink to="/" className="app-nav__logo" aria-label="IntegrityAI home">
          <span className="app-nav__logo-icon" aria-hidden="true">🛡</span>
          IntegrityAI
        </NavLink>
        <ul className="app-nav__links" role="list">
          <li>
            <NavLink
              to="/app"
              end
              className={({ isActive }) =>
                `app-nav__link${isActive ? ' app-nav__link--active' : ''}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/app/sessions"
              className={({ isActive }) =>
                `app-nav__link${isActive ? ' app-nav__link--active' : ''}`
              }
            >
              Sessions
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/app/signals"
              className={({ isActive }) =>
                `app-nav__link${isActive ? ' app-nav__link--active' : ''}`
              }
            >
              Signals
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/demo/candidate/preflight"
              className={({ isActive }) =>
                `app-nav__link${isActive ? ' app-nav__link--active' : ''}`
              }
            >
              Candidate Demo
            </NavLink>
          </li>
        </ul>
      </nav>
      <main id="main-content">
        <Outlet />
      </main>
    </>
  )
}
