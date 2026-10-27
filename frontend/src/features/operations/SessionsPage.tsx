import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useService } from '@/services/useService'
import type { Session, SessionStatus, Investigation, Assessment } from '@/domain/types'

const STATUS_FILTERS: Array<{ value: SessionStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'flagged', label: 'Flagged for Review' },
  { value: 'active', label: 'Active Session' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'cleared', label: 'Cleared' },
  { value: 'waiting', label: 'Waiting' },
]

export function SessionsPage() {
  const service = useService()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialStatus = (searchParams.get('status') as SessionStatus | 'all') || 'all'
  const initialSearch = searchParams.get('search') || ''

  const [sessions, setSessions] = useState<Session[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>(initialStatus)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sortBy, setSortBy] = useState<'startedAt' | 'id'>('startedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      try {
        const [sessRes, assessRes, invRes] = await Promise.all([
          service.listSessions({
            status: statusFilter,
            search: searchQuery || undefined,
          }),
          service.listAssessments(),
          service.listInvestigations(),
        ])

        if (!cancelled) {
          setSessions(sessRes.items)
          setAssessments(assessRes.items)
          setInvestigations(invRes.items)
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load sessions')
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [service, statusFilter, searchQuery])

  function handleFilterChange(newStatus: SessionStatus | 'all') {
    setStatusFilter(newStatus)
    const newParams = new URLSearchParams(searchParams)
    if (newStatus !== 'all') {
      newParams.set('status', newStatus)
    } else {
      newParams.delete('status')
    }
    setSearchParams(newParams)
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value
    setSearchQuery(query)
    const newParams = new URLSearchParams(searchParams)
    if (query) {
      newParams.set('search', query)
    } else {
      newParams.delete('search')
    }
    setSearchParams(newParams)
  }

  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortBy === 'startedAt') {
      const diff = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
      return sortOrder === 'asc' ? diff : -diff
    }
    return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)
  })

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Assessment Sessions</h1>
          <p className="text-muted text-small" style={{ marginTop: 'var(--space-1)' }}>
            Searchable candidate session logs, hardware preflight status, and direct investigation paths.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/app/signals" className="btn btn--secondary btn--sm">
            View Signal Queue →
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div style={{ flex: '1', minWidth: '240px' }}>
          <input
            type="search"
            className="form-control"
            style={{ width: '100%' }}
            placeholder="Search by session ID or candidate reference…"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search sessions"
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            style={{ width: '100%' }}
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value as SessionStatus | 'all')}
            aria-label="Filter sessions by status"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '150px' }}>
          <select
            className="form-select"
            style={{ width: '100%' }}
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-') as ['startedAt' | 'id', 'asc' | 'desc']
              setSortBy(sb)
              setSortOrder(so)
            }}
            aria-label="Sort sessions"
          >
            <option value="startedAt-desc">Newest First</option>
            <option value="startedAt-asc">Oldest First</option>
            <option value="id-asc">Session ID (A-Z)</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <span className="text-subtle text-xs" aria-live="polite">
            Showing {sortedSessions.length} session{sortedSessions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="state-loading">
          <span className="spinner" aria-hidden="true" />
          <span>Loading session records…</span>
        </div>
      ) : error ? (
        <div className="alert alert--error" role="alert">
          <span>Failed to load sessions: {error}</span>
        </div>
      ) : sortedSessions.length === 0 ? (
        <div className="card state-empty">
          <div className="state-empty__icon">🔍</div>
          <h3>No matching assessment sessions</h3>
          <p className="text-muted text-small" style={{ marginTop: 'var(--space-2)' }}>
            No sessions match the current search query or status filter.
          </p>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            style={{ marginTop: 'var(--space-4)' }}
            onClick={() => {
              setStatusFilter('all')
              setSearchQuery('')
              setSearchParams(new URLSearchParams())
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table" aria-label="Assessment sessions directory">
            <thead>
              <tr>
                <th scope="col">Session Reference</th>
                <th scope="col">Candidate ID</th>
                <th scope="col">Assessment Program</th>
                <th scope="col">Status</th>
                <th scope="col">Preflight Readiness</th>
                <th scope="col">Investigation</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSessions.map((s) => {
                const assessment = assessments.find((a) => a.id === s.assessmentId)
                const investigation = investigations.find((i) => i.sessionId === s.id)

                return (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/app/sessions/${s.id}`} className="text-mono font-semibold">
                        {s.id}
                      </Link>
                      <div className="text-subtle text-xs">
                        {new Date(s.startedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td>
                      <span className="font-medium text-small">{s.candidateId}</span>
                    </td>

                    <td>
                      <span className="text-small">{assessment?.title || s.assessmentId}</span>
                    </td>

                    <td>
                      <span
                        className={`badge badge--${
                          s.status === 'flagged'
                            ? 'high'
                            : s.status === 'cleared'
                              ? 'low'
                              : s.status === 'active'
                                ? 'neutral'
                                : 'neutral'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge badge--${
                          s.readiness === 'ready'
                            ? 'low'
                            : s.readiness === 'unrequested'
                              ? 'neutral'
                              : 'medium'
                        }`}
                      >
                        {s.readiness}
                      </span>
                    </td>

                    <td>
                      {investigation ? (
                        <Link
                          to={`/app/investigations/${investigation.id}`}
                          className="badge badge--neutral"
                          title="View formal investigation case"
                        >
                          Case #{investigation.id.slice(-3)} ({investigation.status})
                        </Link>
                      ) : (
                        <span className="text-subtle text-xs">None queued</span>
                      )}
                    </td>

                    <td>
                      <div className="flex gap-2">
                        <Link to={`/app/sessions/${s.id}`} className="btn btn--secondary btn--sm">
                          Context
                        </Link>
                        {investigation && (
                          <Link
                            to={`/app/investigations/${investigation.id}`}
                            className="btn btn--primary btn--sm"
                          >
                            Review →
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
