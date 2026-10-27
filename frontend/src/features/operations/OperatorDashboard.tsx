import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useService } from '@/services/useService'
import type { Assessment, Session } from '@/domain/types'

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="card" style={{ borderColor: accent ? 'var(--color-accent)' : undefined }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: accent ? 'var(--color-accent)' : 'var(--color-text)' }}>
        {value}
      </div>
      <div className="text-muted text-small" style={{ marginTop: 'var(--space-1)' }}>{label}</div>
    </div>
  )
}

export function OperatorDashboard() {
  const service = useService()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([service.listAssessments(), service.listSessions()])
      .then(([a, s]) => {
        setAssessments(a.items)
        setSessions(s.items)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      })
      .finally(() => setLoading(false))
  }, [service])

  if (loading) {
    return (
      <div className="state-loading" aria-label="Loading dashboard">
        <span className="spinner" aria-hidden="true" />
        <span>Loading dashboard…</span>
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

  const flagged = sessions.filter((s) => s.status === 'flagged').length
  const active  = sessions.filter((s) => s.status === 'active').length

  return (
    <div className="page-container">
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1>Dashboard</h1>
        <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
          Overview of active assessments and session status.
        </p>
      </div>

      <div className="grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        <StatCard label="Assessments" value={assessments.length} />
        <StatCard label="Sessions" value={sessions.length} />
        <StatCard label="Flagged sessions" value={flagged} accent={flagged > 0} />
        <StatCard label="Active sessions" value={active} />
        <StatCard label="Cleared" value={sessions.filter((s) => s.status === 'cleared').length} />
        <StatCard label="Submitted" value={sessions.filter((s) => s.status === 'submitted').length} />
      </div>

      <section aria-labelledby="assessments-heading" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 id="assessments-heading">Assessments</h2>
          <Link to="/app/sessions" className="btn btn--secondary btn--sm">View all sessions →</Link>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table" aria-label="Assessments list">
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
                  <td style={{ color: 'var(--color-text)', fontWeight: 500 }}>{a.title}</td>
                  <td>
                    <span className={`badge badge--status-${a.status === 'completed' ? 'reviewed' : a.status === 'active' ? 'open' : 'open'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{new Date(a.scheduledAt).toLocaleDateString()}</td>
                  <td>{a.durationMinutes} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="flagged-heading">
        <h2 id="flagged-heading" style={{ marginBottom: 'var(--space-4)' }}>Flagged sessions requiring review</h2>
        {sessions.filter((s) => s.status === 'flagged').length === 0 ? (
          <div className="state-empty" style={{ padding: 'var(--space-8)' }}>
            <div className="state-empty__icon">✅</div>
            <p className="state-empty__title">No flagged sessions</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {sessions
              .filter((s) => s.status === 'flagged')
              .map((s) => (
                <Link
                  key={s.id}
                  to={`/app/sessions/${s.id}`}
                  className="card card--hoverable"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>Session {s.id}</div>
                    <div className="text-muted text-small" style={{ marginTop: 'var(--space-1)' }}>
                      Started {new Date(s.startedAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="badge badge--high">Flagged</span>
                </Link>
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
