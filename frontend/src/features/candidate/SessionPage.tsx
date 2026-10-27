import { useNavigate } from 'react-router-dom'

export function SessionPage() {
  const navigate = useNavigate()

  return (
    <div className="candidate-layout">
      <nav className="candidate-nav" aria-label="Candidate assessment navigation">
        <span className="candidate-nav__logo">🛡 IntegrityAI Assessment</span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.75rem',
            background: '#fef9c3',
            color: '#78350f',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 600,
          }}
        >
          SIMULATED DEMO
        </span>
      </nav>

      <div style={{ padding: 'var(--space-10) var(--space-6)' }}>
        <div className="candidate-card" style={{ maxWidth: '800px' }}>
          {/* Step progress */}
          <div className="step-progress" aria-label="Assessment steps">
            <div className="step-progress__item">
              <span className="step-progress__dot" />
              <span>Consent &amp; device check</span>
            </div>
            <span aria-hidden="true" style={{ color: '#cbd5e0' }}>›</span>
            <div className="step-progress__item step-progress__item--active">
              <span className="step-progress__dot" />
              <span>Assessment</span>
            </div>
            <span aria-hidden="true" style={{ color: '#cbd5e0' }}>›</span>
            <div className="step-progress__item">
              <span className="step-progress__dot" />
              <span>Submitted</span>
            </div>
          </div>

          {/* Demo notice — prominent per spec */}
          <div
            role="note"
            style={{
              background: '#fef9c3',
              border: '1px solid #f59e0b',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-6)',
              fontSize: '0.875rem',
              color: '#78350f',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            ⚠️ <strong>[SIMULATED ASSESSMENT SHELL]</strong> — This is a demo placeholder.
            No real questions or data are shown. Signals are generated deterministically.
          </div>

          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)', color: 'var(--color-candidate-text)' }}>
            Software Engineering Assessment
          </h1>
          <p style={{ color: 'var(--color-candidate-text-2)', marginBottom: 'var(--space-8)' }}>
            This is a simulated assessment shell. In a real deployment, question content
            would appear here. All monitoring observations are labelled [SIMULATED].
          </p>

          {/* Fake question area */}
          <div
            style={{
              border: '2px dashed var(--color-candidate-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-12)',
              textAlign: 'center',
              color: 'var(--color-candidate-text-2)',
              marginBottom: 'var(--space-8)',
            }}
            aria-label="Assessment question area (simulated)"
          >
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>📝</div>
            <h2 style={{ fontSize: '1rem', color: 'var(--color-candidate-text)' }}>
              [SIMULATED] Question content area
            </h2>
            <p style={{ fontSize: '0.875rem', marginTop: 'var(--space-2)' }}>
              Question banks, timer, and answer entry are outside the approved MVP scope.
              This placeholder demonstrates the assessment shell route.
            </p>
          </div>

          {/* Monitoring activity feed */}
          <section aria-labelledby="activity-heading" style={{ marginBottom: 'var(--space-8)' }}>
            <h2 id="activity-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-3)', color: 'var(--color-candidate-text)' }}>
              Monitoring activity (simulated)
            </h2>
            <div
              style={{
                background: '#f7fafc',
                border: '1px solid var(--color-candidate-border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-4)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--color-candidate-text-2)',
              }}
              aria-label="Simulated monitoring events"
            >
              {[
                '10:05:12 [SIMULATED] Session started — focus monitoring active',
                '10:18:30 [SIMULATED] Focus loss event recorded (observation only)',
                '10:22:10 [SIMULATED] New tab detected (observation only)',
                '10:35:00 [SIMULATED] Brief focus loss (under 2 seconds)',
              ].map((entry) => (
                <div
                  key={entry}
                  style={{ padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}
                >
                  {entry}
                </div>
              ))}
            </div>
          </section>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate('/demo/candidate/submitted')}
            id="btn-submit-assessment"
            style={{ justifyContent: 'center' }}
          >
            [SIMULATED] Submit assessment
          </button>
        </div>
      </div>
    </div>
  )
}
