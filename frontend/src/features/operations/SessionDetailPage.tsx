import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useService } from '@/services/useService'
import type { Session, Signal, Investigation } from '@/domain/types'

export function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const service = useService()
  const [session, setSession] = useState<Session | null>(null)
  const [signals, setSignals] = useState<Signal[]>([])
  const [investigation, setInvestigation] = useState<Investigation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    async function loadData() {
      setLoading(true)
      try {
        const [sess, sigs, inv] = await Promise.all([
          service.getSession(sessionId!),
          service.getSessionSignals(sessionId!),
          service.getInvestigationBySession(sessionId!),
        ])

        if (!cancelled) {
          setSession(sess)
          setSignals(sigs.items)
          setInvestigation(inv)
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load session details')
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [service, sessionId])

  if (loading) {
    return (
      <div className="state-loading">
        <span className="spinner" aria-hidden="true" />
        <span>Loading session telemetry…</span>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="page-container">
        <div className="alert alert--error" role="alert">
          <span>Failed to load session: {error || 'Session not found'}</span>
        </div>
        <Link to="/app/sessions" className="btn btn--secondary btn--sm">
          ← Back to Sessions
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
        <Link to="/app">Dashboard</Link>
        <span className="breadcrumbs-sep">/</span>
        <Link to="/app/sessions">Sessions</Link>
        <span className="breadcrumbs-sep">/</span>
        <span style={{ color: 'var(--color-text)' }}>{session.id}</span>
      </nav>

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3">
            <h1>Session Context</h1>
            <code className="text-mono" style={{ fontSize: '1.25rem', color: 'var(--color-accent)' }}>
              {session.id}
            </code>
            <span
              className={`badge badge--${
                session.status === 'flagged' ? 'high' : session.status === 'cleared' ? 'low' : 'neutral'
              }`}
            >
              {session.status}
            </span>
          </div>
          <p className="text-muted text-small" style={{ marginTop: 'var(--space-1)' }}>
            Candidate reference: <strong>{session.candidateId}</strong> · Assessment program: {session.assessmentId}
          </p>
        </div>

        <div className="flex gap-2">
          {investigation ? (
            <Link to={`/app/investigations/${investigation.id}`} className="btn btn--primary">
              Open Investigation Workspace ({investigation.status}) →
            </Link>
          ) : (
            <span className="text-subtle text-small">No open investigation for this session</span>
          )}
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="metrics-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-card__label">Session Status</div>
          <div className="stat-card__value" style={{ fontSize: '1.35rem', textTransform: 'capitalize' }}>
            {session.status}
          </div>
          <div className="stat-card__desc">Current operational status</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Preflight Readiness</div>
          <div className="stat-card__value" style={{ fontSize: '1.35rem' }}>
            <span className={`badge badge--${session.readiness === 'ready' ? 'low' : 'medium'}`}>
              {session.readiness}
            </span>
          </div>
          <div className="stat-card__desc">Verified browser hardware state</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Recorded Telemetry</div>
          <div className="stat-card__value">{signals.length}</div>
          <div className="stat-card__desc">Total observations captured during window</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Session Started</div>
          <div className="stat-card__value" style={{ fontSize: '1.15rem' }}>
            {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="stat-card__desc">{new Date(session.startedAt).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Telemetry Observations Timeline */}
      <section className="card" aria-labelledby="telemetry-timeline-heading">
        <div className="card-header">
          <h2 id="telemetry-timeline-heading" className="card-title">
            Chronological Telemetry Observations ({signals.length})
          </h2>
          <span className="text-subtle text-xs">Observation data only — requires contextual human review</span>
        </div>

        {signals.length === 0 ? (
          <div className="state-empty" style={{ padding: 'var(--space-6)' }}>
            <p>No telemetry observations were captured for this session.</p>
          </div>
        ) : (
          <div className="timeline">
            {signals.map((sig) => (
              <div key={sig.id} className="timeline-item">
                <div
                  className="timeline-dot"
                  style={{
                    borderColor:
                      sig.severity === 'high'
                        ? 'var(--color-high)'
                        : sig.severity === 'medium'
                          ? 'var(--color-medium)'
                          : 'var(--color-low)',
                  }}
                  aria-hidden="true"
                >
                  {sig.sequence}
                </div>

                <div className="card card--compact" style={{ background: 'var(--color-surface-2)' }}>
                  <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-2)' }}>
                    <div className="flex gap-2 items-center">
                      <span className={`badge badge--${sig.severity}`}>{sig.severity}</span>
                      <span className="font-semibold text-small" style={{ textTransform: 'capitalize' }}>
                        {sig.category} deviation
                      </span>
                      <span className="badge badge--neutral">Source: {sig.source}</span>
                      {sig.requiresHumanReview && (
                        <span className="badge badge--needs-follow-up">Requires Human Review</span>
                      )}
                    </div>
                    <time className="text-subtle text-xs text-mono" dateTime={sig.occurredAt}>
                      {new Date(sig.occurredAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </time>
                  </div>

                  <p className="text-small" style={{ color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                    {sig.explanation}
                  </p>

                  <div
                    style={{
                      background: 'var(--color-surface-3)',
                      borderLeft: '3px solid var(--color-text-3)',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-2)',
                    }}
                  >
                    <strong>Limitation note:</strong> {sig.limitations}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
