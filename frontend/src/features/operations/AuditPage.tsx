import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useService } from '@/services/useService'
import type { AuditEntry, ActorRole } from '@/domain/types'

const ROLE_FILTERS: Array<{ value: ActorRole | 'all'; label: string }> = [
  { value: 'all', label: 'All Roles' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'system', label: 'System' },
]

const TARGET_FILTERS = [
  { value: 'all', label: 'All Target Entities' },
  { value: 'Investigation', label: 'Investigation' },
  { value: 'Signal', label: 'Signal' },
  { value: 'Session', label: 'Session' },
]

export function AuditPage() {
  const service = useService()
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [roleFilter, setRoleFilter] = useState<ActorRole | 'all'>('all')
  const [targetFilter, setTargetFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      try {
        const res = await service.getAllAuditEntries({
          actorRole: roleFilter,
          targetType: targetFilter,
          search: searchQuery || undefined,
        })
        if (!cancelled) {
          setEntries(res.items)
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load audit entries')
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [service, roleFilter, targetFilter, searchQuery])

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Institutional Audit Trail</h1>
          <p className="text-muted text-small" style={{ marginTop: 'var(--space-1)' }}>
            Append-only, immutable record of all reviewer decisions, administrative outcomes, and telemetry events.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/app" className="btn btn--secondary btn--sm">
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ flex: '1', minWidth: '220px' }}>
          <input
            type="search"
            className="form-control"
            style={{ width: '100%' }}
            placeholder="Search action, summary, actor, or correlation ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search audit entries"
          />
        </div>

        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            style={{ width: '100%' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as ActorRole | 'all')}
            aria-label="Filter by actor role"
          >
            {ROLE_FILTERS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            style={{ width: '100%' }}
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            aria-label="Filter by target type"
          >
            {TARGET_FILTERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <span className="text-subtle text-xs" aria-live="polite">
            {entries.length} audit event{entries.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="state-loading">
          <span className="spinner" aria-hidden="true" />
          <span>Retrieving audit records…</span>
        </div>
      ) : error ? (
        <div className="alert alert--error" role="alert">
          <span>Failed to load audit trail: {error}</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="card state-empty">
          <div className="state-empty__icon">📜</div>
          <h3>No matching audit entries</h3>
          <p className="text-muted text-small" style={{ marginTop: 'var(--space-2)' }}>
            No records match the current filters.
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table" aria-label="Audit history table">
            <thead>
              <tr>
                <th scope="col">Timestamp</th>
                <th scope="col">Action</th>
                <th scope="col">Actor</th>
                <th scope="col">Target Entity</th>
                <th scope="col">Summary</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((a) => {
                const isExpanded = expandedId === a.id

                return (
                  <tr key={a.id}>
                    <td>
                      <time className="text-mono text-xs text-subtle" dateTime={a.occurredAt}>
                        {new Date(a.occurredAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </time>
                    </td>

                    <td>
                      <span className="font-semibold text-small" style={{ color: 'var(--color-text)' }}>
                        {a.action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td>
                      <div className="text-small font-medium">{a.actorLabel}</div>
                      <div className="text-subtle text-xs">{a.actorRole}</div>
                    </td>

                    <td>
                      <span className="badge badge--neutral">
                        {a.targetType}: {a.targetId}
                      </span>
                    </td>

                    <td style={{ maxWidth: '420px' }}>
                      <p className="text-small text-muted" style={{ lineHeight: 1.4 }}>
                        {a.summary}
                      </p>
                      {isExpanded && (
                        <div
                          style={{
                            marginTop: 'var(--space-2)',
                            background: 'var(--color-surface-2)',
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {a.before && (
                            <div style={{ marginBottom: 'var(--space-2)' }}>
                              <span style={{ color: 'var(--color-high)' }}>Before: </span>
                              <code>{JSON.stringify(a.before)}</code>
                            </div>
                          )}
                          {a.after && (
                            <div>
                              <span style={{ color: 'var(--color-low)' }}>After: </span>
                              <code>{JSON.stringify(a.after)}</code>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => setExpandedId(isExpanded ? null : a.id)}
                      >
                        {isExpanded ? 'Hide' : 'Inspect'}
                      </button>
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
