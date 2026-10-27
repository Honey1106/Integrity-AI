import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useService } from '@/services/useService'
import type { Session, SessionStatus } from '@/domain/types'

const STATUS_OPTIONS: Array<{ value: SessionStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'cleared', label: 'Cleared' },
  { value: 'waiting', label: 'Waiting' },
]

function statusBadgeClass(status: SessionStatus): string {
  if (status === 'flagged') return 'badge badge--high'
  if (status === 'cleared') return 'badge badge--clear'
  if (status === 'active') return 'badge badge--status-open'
  return 'badge badge--status-reviewed'
}

export function SessionsPage() {
  const service = useService()
  const [sessions, setSessions] = useState<Session[]>([])
  const [filter, setFilter] = useState<SessionStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    service
      .listSessions()
      .then((r) => setSessions(r.items))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [service])

  const filtered = sessions.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false
    if (search && !s.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page-container">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1>Sessions</h1>
        <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
          All assessment sessions. Use filters to find flagged or active sessions.
        </p>
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{ marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}
        aria-label="Session filters"
      >
        <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
          <label className="form-label" htmlFor="session-search">Search by ID</label>
          <input
            id="session-search"
            type="search"
            className="form-control"
            placeholder="session-001…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search sessions by ID"
          />
        </div>
        <div className="form-group" style={{ minWidth: '160px' }}>
          <label className="form-label" htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            className="form-control"
            value={filter}
            onChange={(e) => setFilter(e.target.value as SessionStatus | 'all')}
            aria-label="Filter by session status"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div style={{ alignSelf: 'flex-end', paddingBottom: '2px' }}>
          <span className="text-muted text-small" aria-live="polite">
            {filtered.length} session{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {loading && (
        <div className="state-loading" aria-label="Loading sessions">
          <span className="spinner" aria-hidden="true" />
          <span>Loading sessions…</span>
        </div>
      )}
      {error && <div className="alert alert--error" role="alert">⚠️ {error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="state-empty">
          <div className="state-empty__icon">📋</div>
          <p className="state-empty__title">No sessions match your filter</p>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => { setFilter('all'); setSearch('') }}>
            Clear filters
          </button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table" aria-label="Sessions list">
            <thead>
              <tr>
                <th scope="col">Session ID</th>
                <th scope="col">Status</th>
                <th scope="col">Started</th>
                <th scope="col">Readiness</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <code style={{ fontSize: '0.8125rem' }}>{s.id}</code>
                  </td>
                  <td><span className={statusBadgeClass(s.status)}>{s.status}</span></td>
                  <td>{new Date(s.startedAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge--${s.readiness === 'ready' ? 'clear' : 'medium'}`}>
                      {s.readiness}
                    </span>
                  </td>
                  <td>
                    <Link to={`/app/sessions/${s.id}`} className="btn btn--secondary btn--sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
