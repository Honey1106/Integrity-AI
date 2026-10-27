import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useService } from '@/services/useService'
import type { Signal, SignalCategory, SignalSeverity, Investigation } from '@/domain/types'

const CATEGORY_FILTERS: Array<{ value: SignalCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All Categories' },
  { value: 'focus', label: 'Focus Loss' },
  { value: 'navigation', label: 'Navigation / Tab' },
  { value: 'network', label: 'Network Disruption' },
  { value: 'audio', label: 'Audio Telemetry' },
  { value: 'video', label: 'Video Telemetry' },
  { value: 'device', label: 'Device Telemetry' },
]

const SEVERITY_FILTERS: Array<{ value: SignalSeverity | 'all'; label: string }> = [
  { value: 'all', label: 'All Severities' },
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low / Ambient' },
]

export function SignalsPage() {
  const service = useService()
  const [signals, setSignals] = useState<Signal[]>([])
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [categoryFilter, setCategoryFilter] = useState<SignalCategory | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<SignalSeverity | 'all'>('all')
  const [humanReviewOnly, setHumanReviewOnly] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      try {
        const [signalsRes, invRes] = await Promise.all([
          service.listSignals({
            category: categoryFilter,
            severity: severityFilter,
            requiresHumanReview: humanReviewOnly ? true : 'all',
            search: searchQuery || undefined,
          }),
          service.listInvestigations(),
        ])

        if (!cancelled) {
          setSignals(signalsRes.items)
          setInvestigations(invRes.items)
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load telemetry signals')
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [service, categoryFilter, severityFilter, humanReviewOnly, searchQuery])

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Signal Triage Queue</h1>
          <p className="text-muted text-small" style={{ marginTop: 'var(--space-1)' }}>
            Discrete observation events captured during assessment sessions. Signals provide contextual telemetry and require reviewer interpretation.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/app/sessions" className="btn btn--secondary btn--sm">
            Session Directory →
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
            placeholder="Search signals or session ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search signals"
          />
        </div>

        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            style={{ width: '100%' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as SignalCategory | 'all')}
            aria-label="Filter by signal category"
          >
            {CATEGORY_FILTERS.map((f) => (
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
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as SignalSeverity | 'all')}
            aria-label="Filter by severity"
          >
            {SEVERITY_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-small" style={{ cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={humanReviewOnly}
            onChange={(e) => setHumanReviewOnly(e.target.checked)}
          />
          <span className="font-medium">Requires Review Only</span>
        </label>

        <div style={{ marginLeft: 'auto' }}>
          <span className="text-subtle text-xs" aria-live="polite">
            {signals.length} observation{signals.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="state-loading">
          <span className="spinner" aria-hidden="true" />
          <span>Triaging signal queue…</span>
        </div>
      ) : error ? (
        <div className="alert alert--error" role="alert">
          <span>Failed to load signals: {error}</span>
        </div>
      ) : signals.length === 0 ? (
        <div className="card state-empty">
          <div className="state-empty__icon">✓</div>
          <h3>Queue Clear</h3>
          <p className="text-muted text-small" style={{ marginTop: 'var(--space-2)' }}>
            No telemetry signals require triage under the current filters.
          </p>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            style={{ marginTop: 'var(--space-4)' }}
            onClick={() => {
              setCategoryFilter('all')
              setSeverityFilter('all')
              setHumanReviewOnly(false)
              setSearchQuery('')
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {signals.map((sig) => {
            const inv = investigations.find((i) => i.sessionId === sig.sessionId)
            const targetLink = inv ? `/app/investigations/${inv.id}` : `/app/sessions/${sig.sessionId}`

            return (
              <div key={sig.id} className="card card--hoverable">
                <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className={`badge badge--${sig.severity}`}>{sig.severity}</span>
                    <span className="font-semibold text-small" style={{ textTransform: 'capitalize' }}>
                      {sig.category} Observation
                    </span>
                    <span className="badge badge--neutral">Source: {sig.source}</span>
                    <span className="badge badge--neutral">Origin: {sig.origin}</span>
                    {sig.requiresHumanReview && (
                      <span className="badge badge--needs-follow-up">Requires Review</span>
                    )}
                  </div>

                  <time className="text-subtle text-xs text-mono" dateTime={sig.occurredAt}>
                    {new Date(sig.occurredAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </time>
                </div>

                <p className="text-small" style={{ color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
                  {sig.explanation}
                </p>

                <div
                  style={{
                    background: 'var(--color-surface-2)',
                    borderLeft: '3px solid var(--color-text-3)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-2)',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  <strong style={{ color: 'var(--color-text)' }}>Limitation: </strong>
                  {sig.limitations}
                </div>

                <div className="flex justify-between items-center" style={{ paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-subtle)' }}>
                  <div className="text-xs text-muted">
                    Session: <Link to={`/app/sessions/${sig.sessionId}`} className="text-mono font-medium">{sig.sessionId}</Link>
                    {' · '}
                    Sequence: #{sig.sequence}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/app/sessions/${sig.sessionId}`} className="btn btn--secondary btn--sm">
                      Session Telemetry
                    </Link>
                    <Link to={targetLink} className="btn btn--primary btn--sm">
                      {inv ? 'Review Investigation →' : 'View Session Context →'}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
