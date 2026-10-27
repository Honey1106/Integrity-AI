import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useService } from '@/services/useService'
import type { Session, Signal } from '@/domain/types'

const SEVERITY_BADGE: Record<string, string> = {
  high:   'badge badge--high',
  medium: 'badge badge--medium',
  low:    'badge badge--low',
}

export function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const service = useService()
  const [session, setSession] = useState<Session | null>(null)
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    Promise.all([service.getSession(sessionId), service.getSessionSignals(sessionId)])
      .then(([s, sig]) => {
        setSession(s)
        setSignals(sig.items)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [service, sessionId])

  if (loading) {
    return (
      <div className="state-loading" aria-label="Loading session">
        <span className="spinner" aria-hidden="true" />
        <span>Loading session…</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert--error" role="alert">⚠️ {error}</div>
        <Link to="/app/sessions" className="btn btn--secondary" style={{ marginTop: 'var(--space-4)' }}>← Back</Link>
      </div>
    )
  }
  if (!session) return null

  return (
    <div className="page-container">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link to="/app/sessions" className="btn btn--secondary btn--sm" style={{ marginBottom: 'var(--space-4)' }}>
          ← Sessions
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 style={{ marginBottom: 'var(--space-2)' }}>
              Session{' '}
              <code style={{ fontSize: '1.25rem', fontWeight: 400 }}>{session.id}</code>
            </h1>
            <p className="text-muted">Started {new Date(session.startedAt).toLocaleString()}</p>
          </div>
          <span className={`badge badge--${session.status === 'flagged' ? 'high' : session.status === 'cleared' ? 'clear' : 'status-open'}`}
            style={{ fontSize: '0.875rem', padding: '4px 12px' }}
          >
            {session.status}
          </span>
        </div>
      </div>

      {/* Signal timeline */}
      <section aria-labelledby="signals-heading" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 id="signals-heading" style={{ marginBottom: 'var(--space-4)' }}>
          Signal timeline
          <span
            style={{ marginLeft: 'var(--space-3)', fontSize: '0.875rem', fontWeight: 400 }}
            className="text-muted"
          >
            {signals.length} observation{signals.length !== 1 ? 's' : ''}
          </span>
        </h2>

        {signals.length === 0 ? (
          <div className="state-empty">
            <div className="state-empty__icon">📋</div>
            <p className="state-empty__title">No signals recorded</p>
          </div>
        ) : (
          <div className="timeline" aria-label="Signal timeline">
            {signals.map((sig) => (
              <div key={sig.id} className="timeline-item">
                <div
                  className="timeline-dot"
                  style={{
                    borderColor:
                      sig.severity === 'high'   ? 'var(--color-high)'   :
                      sig.severity === 'medium' ? 'var(--color-medium)' :
                                                   'var(--color-low)',
                  }}
                  aria-hidden="true"
                >
                  {sig.severity === 'high' ? '🔴' : sig.severity === 'medium' ? '🟡' : '🟢'}
                </div>
                <div className="card" style={{ flex: 1 }}>
                  <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-3)', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
                      <span className={SEVERITY_BADGE[sig.severity]}>{sig.severity}</span>
                      <span className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-2)' }}>
                        {sig.category}
                      </span>
                      {sig.simulated && (
                        <span className="badge badge--simulated">⚠ SIMULATED</span>
                      )}
                      {sig.requiresHumanReview && (
                        <span className="badge" style={{ background: 'rgba(96,165,250,0.15)', color: 'var(--color-info)' }}>
                          Requires human review
                        </span>
                      )}
                    </div>
                    <time
                      className="text-muted text-small text-mono"
                      dateTime={sig.occurredAt}
                    >
                      {new Date(sig.occurredAt).toLocaleString()}
                    </time>
                  </div>
                  <p style={{ marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>
                    {sig.explanation}
                  </p>
                  <div
                    style={{
                      background: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius)',
                      padding: 'var(--space-3)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-3)', fontWeight: 500 }}>Limitation: </span>
                    <span className="text-muted">{sig.limitations}</span>
                  </div>
                  <div className="text-muted text-small" style={{ marginTop: 'var(--space-2)' }}>
                    Source: <strong>{sig.source}</strong> · Origin: <strong>{sig.origin}</strong> · Seq #{sig.sequence}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Link to investigation if flagged */}
      {session.status === 'flagged' && (
        <div className="alert alert--warning" style={{ marginBottom: 'var(--space-6)' }}>
          ⚠️ This session is flagged for review.{' '}
          <Link to="/app/investigations/investigation-001" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Open investigation →
          </Link>
        </div>
      )}
    </div>
  )
}
