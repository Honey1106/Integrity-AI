import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg) 100%)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-16) var(--space-8)',
          textAlign: 'center',
        }}
        aria-labelledby="hero-heading"
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: 'var(--color-accent-dim)',
              border: '1px solid var(--color-accent)',
              borderRadius: '2rem',
              padding: 'var(--space-2) var(--space-4)',
              fontSize: '0.8125rem',
              color: 'var(--color-accent)',
              marginBottom: 'var(--space-8)',
            }}
          >
            ⚡ SIMULATED DEMO — No real data
          </div>
          <h1 id="hero-heading" style={{ marginBottom: 'var(--space-6)' }}>
            Assessment Integrity,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Reviewed by Humans
            </span>
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--color-text-2)',
              lineHeight: 1.7,
              marginBottom: 'var(--space-10)',
            }}
          >
            IntegrityAI helps reviewers understand documented signals and make accountable,
            reasoned decisions. It is <strong>not a cheating detector</strong>. Every
            observation is labelled as simulated in this demo.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/app" className="btn btn--primary" style={{ fontSize: '1rem', padding: 'var(--space-4) var(--space-8)' }}>
              Operator Dashboard →
            </Link>
            <Link to="/demo/candidate/preflight" className="btn btn--secondary" style={{ fontSize: '1rem', padding: 'var(--space-4) var(--space-8)' }}>
              Candidate Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="page-container"
        style={{ padding: 'var(--space-16) var(--space-8)' }}
        aria-labelledby="features-heading"
      >
        <h2 id="features-heading" style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          What this demo shows
        </h2>
        <div className="grid-3">
          {[
            {
              icon: '🔍',
              title: 'Documented signals',
              desc: 'Each observation has a source, time, explanation, and clear limitation statement. No inference is made without human review.',
            },
            {
              icon: '⚖️',
              title: 'Reasoned review decisions',
              desc: 'Reviewers record a disposition (clear, needs follow-up, or escalated) with a mandatory reason. Every decision appends an audit entry.',
            },
            {
              icon: '🏛️',
              title: 'Separate institutional outcome',
              desc: 'Only an administrator can record a final institutional outcome — distinct from reviewer disposition and logged separately.',
            },
            {
              icon: '🔒',
              title: 'Append-only audit trail',
              desc: 'Decisions supersede, never overwrite. Every state change is recorded with actor, role, and timestamp.',
            },
            {
              icon: '🖥️',
              title: 'Candidate preflight',
              desc: 'Honest device readiness states (granted, denied, unsupported, missing device). A non-ready state blocks assessment entry.',
            },
            {
              icon: '🏷️',
              title: 'Always labelled',
              desc: 'Every simulated signal and demo action is visibly marked. No live-looking data without an explicit [SIMULATED] marker.',
            },
          ].map((f) => (
            <div key={f.title} className="card">
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>{f.icon}</div>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>{f.title}</h3>
              <p style={{ color: 'var(--color-text-2)', fontSize: '0.9375rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Responsible use */}
      <section
        style={{
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--space-12) var(--space-8)',
        }}
        aria-labelledby="responsible-use-heading"
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 id="responsible-use-heading" style={{ marginBottom: 'var(--space-6)' }}>
            Responsible use summary
          </h2>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              color: 'var(--color-text-2)',
              fontSize: '0.9375rem',
            }}
          >
            {[
              'This demo does not record video, audio, keystrokes, or biometrics.',
              'No signal is interpreted as evidence of misconduct without human review.',
              'All data shown in this demo is deterministic and fictional.',
              'Real deployments require separate security, authorization, and data-retention design.',
              'Browser monitoring observations have documented limitations; they do not establish intent.',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Link to="/privacy" className="btn btn--secondary btn--sm">
              Full privacy &amp; capability statement →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
