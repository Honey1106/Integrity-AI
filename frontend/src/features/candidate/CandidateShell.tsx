import { Outlet, Link, useLocation } from 'react-router-dom'

export function CandidateShell() {
  const location = useLocation()
  const path = location.pathname

  const isWelcome = path === '/candidate' || path === '/candidate/welcome'
  const isPreflight = path.includes('/preflight')
  const isSession = path.includes('/session')
  const isSubmitted = path.includes('/submitted')

  return (
    <div className="candidate-shell">
      {/* Calm Candidate Top Header */}
      <header className="candidate-header">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '20px' }}>🛡</span>
          <div>
            <span className="font-semibold text-small" style={{ color: 'var(--color-candidate-text)' }}>
              IntegrityAI Assessment Gateway
            </span>
            <div className="text-subtle text-xs">Autumn 2026 Examination Portal</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-xs font-medium"
            style={{ color: 'var(--color-candidate-accent)', textDecoration: 'none' }}
          >
            ← Public Website
          </Link>
          <Link
            to="/app"
            className="text-xs font-medium"
            style={{ color: '#64748b', textDecoration: 'none' }}
          >
            Operator Workspace ↗
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="candidate-container">
        {/* Step Progress Tracker */}
        {!isSession && !isSubmitted && (
          <nav className="candidate-step-tracker" aria-label="Assessment Progress Steps">
            <div className={`candidate-step-node ${isWelcome ? 'active' : 'completed'}`}>
              <div className="candidate-step-circle">{isWelcome ? '1' : '✓'}</div>
              <span>1. Briefing &amp; Policy</span>
            </div>
            <span style={{ color: '#cbd5e1' }}>›</span>

            <div className={`candidate-step-node ${isPreflight ? 'active' : ''}`}>
              <div className="candidate-step-circle">2</div>
              <span>2. System &amp; Device Preflight</span>
            </div>
            <span style={{ color: '#cbd5e1' }}>›</span>

            <div className="candidate-step-node">
              <div className="candidate-step-circle">3</div>
              <span>3. Assessment Shell</span>
            </div>
          </nav>
        )}

        <Outlet />
      </main>
    </div>
  )
}
