import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useService } from '@/services/useService'
import type {
  Assessment,
  Session,
  Signal,
  Investigation,
  DashboardStats,
  AuditEntry,
} from '@/domain/types'

export function OperatorDashboard() {
  const service = useService()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [flaggedSessions, setFlaggedSessions] = useState<Session[]>([])
  const [triageSignals, setTriageSignals] = useState<Signal[]>([])
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [recentAudit, setRecentAudit] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const [statsData, assessmentsData, sessionsData, signalsData, invData, auditData] =
          await Promise.all([
            service.getDashboardStats(),
            service.listAssessments(),
            service.listSessions({ status: 'flagged' }),
            service.listSignals({ requiresHumanReview: true }),
            service.listInvestigations(),
            service.getAllAuditEntries({ pageSize: 5 }),
          ])

        if (!cancelled) {
          setStats(statsData)
          setAssessments(assessmentsData.items)
          setFlaggedSessions(sessionsData.items)
          setTriageSignals(signalsData.items)
          setInvestigations(invData.items)
          setRecentAudit(auditData.items)
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load operational dashboard data')
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [service])

  if (loading) {
    return (
      <div className="state-loading" aria-label="Loading dashboard metrics">
        <span className="spinner" aria-hidden="true" />
        <span>Loading operational telemetry & workload…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert--error" role="alert">
          <span>Failed to load operational dashboard: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1>Operations Overview</h1>
          <p className="text-muted text-small" style={{ marginTop: 'var(--space-1)' }}>
            Real-time workload, flagged sessions, telemetry queue, and recent reviewer audits.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/app/signals" className="btn btn--secondary btn--sm">
            Triage Queue ({stats?.signalsAwaitingTriage ?? 0})
          </Link>
          <Link to="/app/sessions" className="btn btn--primary btn--sm">
            View All Sessions →
          </Link>
        </div>
      </div>

      {/* Institutional Metric Grid */}
      <div className="metrics-grid">
        <div className="stat-card stat-card--warning">
          <div className="stat-card__label">
            <span>Sessions Requiring Review</span>
            <span className="badge badge--high">Flagged</span>
          </div>
          <div className="stat-card__value">{stats?.sessionsRequiringReview ?? 0}</div>
          <div className="stat-card__desc">Candidates with active anomaly observations</div>
        </div>

        <div className="stat-card stat-card--accent">
          <div className="stat-card__label">
            <span>Open Investigations</span>
            <span className="badge badge--neutral">Active</span>
          </div>
          <div className="stat-card__value">{stats?.openInvestigations ?? 0}</div>
          <div className="stat-card__desc">Assigned or queued for reviewer disposition</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">
            <span>Signals Awaiting Triage</span>
            <span className="badge badge--medium">Telemetry</span>
          </div>
          <div className="stat-card__value">{stats?.signalsAwaitingTriage ?? 0}</div>
          <div className="stat-card__desc">Unresolved focus, tab, or network deviations</div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-card__label">
            <span>Institutional Outcomes</span>
            <span className="badge badge--low">Recorded</span>
          </div>
          <div className="stat-card__value">{stats?.recordedOutcomes ?? 0}</div>
          <div className="stat-card__desc">Final determinations logged by administrator</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Sessions Requiring Urgent Review */}
        <section className="card" aria-labelledby="flagged-workload-heading">
          <div className="card-header">
            <h2 id="flagged-workload-heading" className="card-title">
              Sessions Requiring Immediate Review
            </h2>
            <Link to="/app/sessions?status=flagged" className="text-small">
              View all ({flaggedSessions.length})
            </Link>
          </div>

          {flaggedSessions.length === 0 ? (
            <div className="state-empty" style={{ padding: 'var(--space-6)' }}>
              <div className="state-empty__icon">✓</div>
              <p>No flagged sessions pending review.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table" aria-label="Flagged sessions table">
                <thead>
                  <tr>
                    <th scope="col">Session</th>
                    <th scope="col">Candidate</th>
                    <th scope="col">Started</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedSessions.map((s) => {
                    // Match investigation if exists
                    const inv = investigations.find((i) => i.sessionId === s.id)
                    const targetLink = inv
                      ? `/app/investigations/${inv.id}`
                      : `/app/sessions/${s.id}`

                    return (
                      <tr key={s.id}>
                        <td>
                          <code className="text-mono font-medium">{s.id}</code>
                        </td>
                        <td>
                          <span className="text-small font-medium">{s.candidateId}</span>
                        </td>
                        <td className="text-subtle text-xs">
                          {new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <Link to={targetLink} className="btn btn--secondary btn--sm">
                            Investigate →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Signals Telemetry Awaiting Triage */}
        <section className="card" aria-labelledby="triage-heading">
          <div className="card-header">
            <h2 id="triage-heading" className="card-title">
              Signal Triage Queue
            </h2>
            <Link to="/app/signals" className="text-small">
              Open Queue →
            </Link>
          </div>

          {triageSignals.length === 0 ? (
            <div className="state-empty" style={{ padding: 'var(--space-6)' }}>
              <p>All recorded signals have been triaged.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {triageSignals.slice(0, 4).map((sig) => (
                <div
                  key={sig.id}
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    padding: 'var(--space-3)',
                  }}
                >
                  <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                    <div className="flex gap-2 items-center">
                      <span className={`badge badge--${sig.severity}`}>{sig.severity}</span>
                      <span className="text-xs font-medium" style={{ textTransform: 'capitalize' }}>
                        {sig.category} deviation
                      </span>
                    </div>
                    <time className="text-subtle text-xs text-mono" dateTime={sig.occurredAt}>
                      {new Date(sig.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                  <p className="text-small text-muted" style={{ lineHeight: 1.4 }}>
                    {sig.explanation}
                  </p>
                  <div className="flex justify-between items-center" style={{ marginTop: 'var(--space-2)' }}>
                    <span className="text-xs text-subtle">Session: {sig.sessionId}</span>
                    <Link
                      to={`/app/sessions/${sig.sessionId}`}
                      className="text-xs font-medium"
                    >
                      Context →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Bottom Grid: Assessments & Recent Review Audit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)' }}>
        {/* Active Assessment Programs */}
        <section className="card" aria-labelledby="assessments-list-heading">
          <div className="card-header">
            <h2 id="assessments-list-heading" className="card-title">
              Assessment Schedules
            </h2>
            <span className="text-subtle text-xs">{assessments.length} configured</span>
          </div>

          <div className="table-wrapper">
            <table className="data-table" aria-label="Assessment programs table">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Status</th>
                  <th scope="col">Scheduled</th>
                  <th scope="col">Duration</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.title}</td>
                    <td>
                      <span className={`badge badge--${a.status === 'active' ? 'low' : 'neutral'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="text-subtle text-xs">{new Date(a.scheduledAt).toLocaleDateString()}</td>
                    <td className="text-subtle text-xs">{a.durationMinutes}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Audit Activity Stream */}
        <section className="card" aria-labelledby="audit-activity-heading">
          <div className="card-header">
            <h2 id="audit-activity-heading" className="card-title">
              Recent Review &amp; Audit Log
            </h2>
            <Link to="/app/audit" className="text-small">
              View full audit →
            </Link>
          </div>

          {recentAudit.length === 0 ? (
            <div className="state-empty" style={{ padding: 'var(--space-6)' }}>
              <p>No recent audit logs.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentAudit.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: 'var(--space-2) 0',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div className="flex justify-between items-center" style={{ marginBottom: '2px' }}>
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {a.action.replace(/_/g, ' ')}
                    </span>
                    <time className="text-subtle text-xs text-mono" dateTime={a.occurredAt}>
                      {new Date(a.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                  <p className="text-muted text-xs" style={{ marginBottom: '4px' }}>
                    {a.summary}
                  </p>
                  <div className="text-subtle text-xs">
                    By: <strong>{a.actorLabel}</strong> ({a.actorRole})
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
