import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useService } from '@/services/useService'
import type { Signal } from '@/domain/types'

export function SignalsPage() {
  const service = useService()
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch signals for the primary demo session
    service
      .getSessionSignals('session-001')
      .then((r) => setSignals(r.items))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [service])

  if (loading) {
    return (
      <div className="state-loading" aria-label="Loading signals">
        <span className="spinner" aria-hidden="true" />
        <span>Loading signals…</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert--error" role="alert">⚠️ {error}</div>
      </div>
    )
  }

  const needsReview = signals.filter((s) => s.requiresHumanReview)

  return (
    <div className="page-container">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1>Signal queue</h1>
        <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
          Observations requiring human review. All signals are labelled [SIMULATED].
        </p>
      </div>

      {needsReview.length === 0 ? (
        <div className="state-empty">
          <div className="state-empty__icon">✅</div>
          <p className="state-empty__title">No signals require review</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {needsReview.map((sig) => (
            <div key={sig.id} className="card card--hoverable">
              <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
                  <span className={`badge badge--${sig.severity}`}>{sig.severity}</span>
                  <span className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-2)' }}>
                    {sig.category}
                  </span>
                  <span className="badge badge--simulated">⚠ SIMULATED</span>
                </div>
                <time className="text-muted text-small text-mono" dateTime={sig.occurredAt}>
                  {new Date(sig.occurredAt).toLocaleString()}
                </time>
              </div>
              <p style={{ marginBottom: 'var(--space-3)' }}>{sig.explanation}</p>
              <div
                style={{
                  background: 'var(--color-surface-2)',
                  borderRadius: 'var(--radius)',
                  padding: 'var(--space-3)',
                  fontSize: '0.875rem',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <span style={{ color: 'var(--color-text-3)', fontWeight: 500 }}>Limitation: </span>
                <span className="text-muted">{sig.limitations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted text-small">
                  Session: <code>session-001</code>
                </span>
                <Link to="/app/investigations/investigation-001" className="btn btn--primary btn--sm">
                  Open investigation →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
