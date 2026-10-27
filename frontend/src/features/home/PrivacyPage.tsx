import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <div className="page-container" style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <Link to="/" className="btn btn--secondary btn--sm">← Back</Link>
      </div>
      <h1 style={{ marginBottom: 'var(--space-4)' }}>Privacy &amp; Capability Statement</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-8)' }}>
        This page explains what IntegrityAI does and does not do in this demo.
      </p>

      {[
        {
          title: 'What this demo collects',
          items: [
            'Nothing. This is a fully local demo using simulated, deterministic fixture data.',
            'No real candidate data, no recordings, no biometrics are collected or stored.',
          ],
        },
        {
          title: 'What the monitoring system observes in a real deployment',
          items: [
            'Browser focus events (tab visible or hidden).',
            'Tab open/close events within the assessment window.',
            'These observations are logged with explicit limitations.',
          ],
        },
        {
          title: 'What monitoring does NOT do',
          items: [
            'Does not record video, audio, or screen content.',
            'Does not perform liveness detection or deepfake analysis.',
            'Does not read keystrokes or clipboard contents.',
            'Does not scan nearby devices, Bluetooth, or Wi-Fi.',
            'Does not make automated academic integrity determinations.',
          ],
        },
        {
          title: 'Human review is required',
          items: [
            'Every signal is presented for human review, never acted on automatically.',
            'Reviewers must provide a disposition and a mandatory written reason.',
            'Institutional outcomes are recorded separately by an administrator.',
            'All actions are logged in an append-only audit trail.',
          ],
        },
        {
          title: 'Data security (deferred)',
          items: [
            'Real authentication, authorization, multi-tenant isolation, encryption, and retention policy require a separate approved design.',
            'This demo has no real user accounts and does not protect data.',
          ],
        },
      ].map((section) => (
        <section key={section.title} style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>{section.title}</h2>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              color: 'var(--color-text-2)',
            }}
          >
            {section.items.map((item) => (
              <li key={item} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <span aria-hidden="true" style={{ color: 'var(--color-accent)', flexShrink: 0 }}>→</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
