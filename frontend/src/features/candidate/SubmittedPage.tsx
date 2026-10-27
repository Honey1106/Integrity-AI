import { Link } from 'react-router-dom'

export function SubmittedPage() {
  return (
    <div className="candidate-layout">
      <nav className="candidate-nav" aria-label="Candidate assessment navigation">
        <span className="candidate-nav__logo">🛡 IntegrityAI Assessment</span>
      </nav>
      <div style={{ padding: 'var(--space-10) var(--space-6)' }}>
        <div className="candidate-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✅</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-4)', color: 'var(--color-candidate-text)' }}>
            [SIMULATED] Assessment submitted
          </h1>
          <p style={{ color: 'var(--color-candidate-text-2)', marginBottom: 'var(--space-6)' }}>
            This is the end of the candidate demo journey. In a real deployment, a
            confirmation and next-steps message from your institution would appear here.
          </p>
          <div
            style={{
              background: '#f7fafc',
              border: '1px solid var(--color-candidate-border)',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-4)',
              fontSize: '0.875rem',
              color: 'var(--color-candidate-text-2)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <strong>If you have concerns</strong> about the monitoring observations recorded
            during your session, contact your institution's designated contact. You have the
            right to request a review of any recorded observations.
          </div>
          <Link to="/" className="btn btn--secondary">Return to home</Link>
        </div>
      </div>
    </div>
  )
}
