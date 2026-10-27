import { useEffect, useState, useId, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useService } from '@/services/useService'
import { usePersona } from '@/app/PersonaContext'
import type {
  Investigation,
  ReviewDecision,
  InstitutionalOutcome,
  AuditEntry,
  Signal,
  Session,
  Disposition,
  InstitutionalOutcomeValue,
} from '@/domain/types'
import {
  canSubmitOutcome,
  DISPOSITION_LABELS,
  DISPOSITION_DESCRIPTIONS,
} from '@/domain/transitions'


const OUTCOME_OPTIONS: Array<{ value: InstitutionalOutcomeValue; label: string; desc: string }> = [
  { value: 'no_action', label: 'No Action Warranted', desc: 'Evidence reviewed; standard completion stands without penalty.' },
  { value: 'caution_issued', label: 'Formal Caution Issued', desc: 'Candidate cautioned regarding testing environment expectations.' },
  { value: 'referral_required', label: 'Committee Referral', desc: 'Case referred to Institutional Integrity Board for formal hearing.' },
  { value: 'further_review', label: 'Technical Telemetry Inconclusive', desc: 'Session voided due to technical anomalies; candidate offered proctored re-sit.' },
]

export function InvestigationPage() {
  const { investigationId } = useParams<{ investigationId: string }>()
  const service = useService()
  const { activeRole, actorLabel } = usePersona()
  const formId = useId()

  const [investigation, setInvestigation] = useState<Investigation | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [signals, setSignals] = useState<Signal[]>([])
  const [decisions, setDecisions] = useState<ReviewDecision[]>([])
  const [outcomes, setOutcomes] = useState<InstitutionalOutcome[]>([])
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reviewer Decision Form
  const [disposition, setDisposition] = useState<Disposition>('clear')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Administrator Institutional Outcome Form
  const [outcomeValue, setOutcomeValue] = useState<InstitutionalOutcomeValue>('no_action')
  const [outcomeReason, setOutcomeReason] = useState('')
  const [submittingOutcome, setSubmittingOutcome] = useState(false)
  const [outcomeError, setOutcomeError] = useState<string | null>(null)
  const [showOutcomeConfirmModal, setShowOutcomeConfirmModal] = useState(false)
  const [conflictError, setConflictError] = useState<string | null>(null)

  const reloadData = useCallback(async () => {

    if (!investigationId) return
    try {
      const inv = await service.getInvestigation(investigationId)
      const [sess, sigs, decs, outs, audit] = await Promise.all([
        service.getSession(inv.sessionId),
        service.getSessionSignals(inv.sessionId),
        service.getInvestigationDecisions(investigationId),
        service.getInvestigationOutcomes(investigationId),
        service.getAuditEntries('Investigation', investigationId),
      ])
      setInvestigation(inv)
      setSession(sess)
      setSignals(sigs.items)
      setDecisions(decs)
      setOutcomes(outs)
      setAuditEntries(audit.items)
      setConflictError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load investigation')
    }
  }, [investigationId, service])

  useEffect(() => {
    let cancelled = false
    if (!investigationId) return

    service.getInvestigation(investigationId)
      .then(async (inv) => {
        if (cancelled) return
        const [sess, sigs, decs, outs, audit] = await Promise.all([
          service.getSession(inv.sessionId),
          service.getSessionSignals(inv.sessionId),
          service.getInvestigationDecisions(investigationId),
          service.getInvestigationOutcomes(investigationId),
          service.getAuditEntries('Investigation', investigationId),
        ])
        if (cancelled) return
        setInvestigation(inv)
        setSession(sess)
        setSignals(sigs.items)
        setDecisions(decs)
        setOutcomes(outs)
        setAuditEntries(audit.items)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load investigation')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [investigationId, service])



  async function handleConfirmDecision() {
    if (!investigation) return
    setShowConfirmModal(false)
    setSubmitError(null)
    setConflictError(null)
    setSubmitting(true)

    try {
      await service.submitDecision(
        investigation.id,
        { disposition, reason: reason.trim(), notes: notes.trim() || undefined },
        investigation.version,
      )
      setReason('')
      setNotes('')
      await reloadData()
    } catch (err: unknown) {
      const isConflict = (err as { status?: number })?.status === 409 || (err as { code?: string })?.code === 'CONFLICT'
      if (isConflict) {
        setConflictError('Case conflict: another reviewer or administrator updated this record. Please refresh.')
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Decision submission failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmOutcome() {
    if (!investigation) return
    setShowOutcomeConfirmModal(false)
    setOutcomeError(null)
    setConflictError(null)
    setSubmittingOutcome(true)

    try {
      await service.submitOutcome(
        investigation.id,
        { outcome: outcomeValue, reason: outcomeReason.trim() },
        investigation.version,
      )
      setOutcomeReason('')
      await reloadData()
    } catch (err: unknown) {
      const isConflict = (err as { status?: number })?.status === 409 || (err as { code?: string })?.code === 'CONFLICT'
      if (isConflict) {
        setConflictError('Version conflict: the case record has changed. Please refresh to inspect latest review.')
      } else {
        setOutcomeError(err instanceof Error ? err.message : 'Outcome recording failed')
      }
    } finally {
      setSubmittingOutcome(false)
    }
  }

  if (loading) {
    return (
      <div className="state-loading">
        <span className="spinner" aria-hidden="true" />
        <span>Loading investigation case &amp; evidence timeline…</span>
      </div>
    )
  }

  if (error || !investigation) {
    return (
      <div className="page-container">
        <div className="alert alert--error" role="alert">
          <span>Failed to load investigation: {error || 'Record not found'}</span>
        </div>
        <Link to="/app/sessions" className="btn btn--secondary btn--sm">
          ← Back to Sessions
        </Link>
      </div>
    )
  }

  const canRecordOutcome = canSubmitOutcome(investigation.status)

  return (
    <div className="page-container page-container--wide">
      {/* 1. Context Breadcrumb & Top Bar */}
      <nav className="breadcrumbs" aria-label="Investigation Breadcrumb">
        <Link to="/app">Dashboard</Link>
        <span className="breadcrumbs-sep">/</span>
        <Link to="/app/sessions">Sessions</Link>
        <span className="breadcrumbs-sep">/</span>
        <Link to={`/app/sessions/${investigation.sessionId}`}>{investigation.sessionId}</Link>
        <span className="breadcrumbs-sep">/</span>
        <span style={{ color: 'var(--color-text)' }}>Case #{investigation.id}</span>
      </nav>

      {conflictError && (
        <div className="alert alert--error flex justify-between items-center" role="alert">
          <span>⚠️ {conflictError}</span>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => reloadData()}>
            Reload Latest State
          </button>
        </div>
      )}

      {/* Investigation Context Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1>Investigation Workspace</h1>
            <code className="text-mono" style={{ fontSize: '1.1rem', color: 'var(--color-accent)' }}>
              {investigation.id}
            </code>
            <span
              className={`badge badge--${
                investigation.status === 'outcome_recorded'
                  ? 'low'
                  : investigation.status === 'reviewed'
                    ? 'neutral'
                    : 'high'
              }`}
              style={{ fontSize: '0.8125rem', padding: '3px 10px' }}
            >
              Status: {investigation.status.replace(/_/g, ' ')}
            </span>
            <span className="badge badge--neutral">Record Version: v{investigation.version}</span>
          </div>

          <p className="text-muted text-small" style={{ marginTop: 'var(--space-1)' }}>
            Associated Session: <strong>{investigation.sessionId}</strong>
            {session && ` · Candidate Reference: ${session.candidateId} · Program: ${session.assessmentId}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Link to={`/app/sessions/${investigation.sessionId}`} className="btn btn--secondary btn--sm">
            View Raw Session Telemetry →
          </Link>
        </div>
      </div>

      {/* 3-Tier Main Grid: Evidence Timeline (Left) + Reviewer Workspace (Right) */}
      <div className="investigation-grid">
        {/* Left Column: Evidence & Chronological Observation Timeline */}
        <div>
          <section className="card" aria-labelledby="evidence-timeline-heading" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header">
              <h2 id="evidence-timeline-heading" className="card-title">
                Recorded Evidence &amp; Telemetry Timeline ({signals.length})
              </h2>
              <span className="text-subtle text-xs">
                Chronological observation events · All telemetry requires human context
              </span>
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
                        <div className="flex gap-2 items-center flex-wrap">
                          <span className={`badge badge--${sig.severity}`}>{sig.severity}</span>
                          <span className="font-semibold text-small" style={{ textTransform: 'capitalize' }}>
                            {sig.category} Observation
                          </span>
                          <span className="badge badge--neutral">Source: {sig.source}</span>
                          {sig.requiresHumanReview && (
                            <span className="badge badge--needs-follow-up">Flagged for Triage</span>
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
                        <strong style={{ color: 'var(--color-text)' }}>Telemetry limitation: </strong>
                        {sig.limitations}
                      </div>

                      <div className="flex justify-between items-center text-subtle text-xs" style={{ marginTop: 'var(--space-2)' }}>
                        <span>Captured via {sig.source} ({sig.origin})</span>
                        <span className="text-mono">Seq #{sig.sequence}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Scoped Audit History for this Investigation */}
          <section className="card" aria-labelledby="scoped-audit-heading">
            <div className="card-header">
              <h2 id="scoped-audit-heading" className="card-title">
                Case Audit Trail (Append-Only)
              </h2>
              <span className="text-subtle text-xs">{auditEntries.length} immutable entries</span>
            </div>

            {auditEntries.length === 0 ? (
              <div className="state-empty" style={{ padding: 'var(--space-6)' }}>
                <p>No audit entries recorded for this case yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {auditEntries.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      padding: 'var(--space-3)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                      <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                        {a.action.replace(/_/g, ' ')}
                      </span>
                      <time className="text-subtle text-xs text-mono" dateTime={a.occurredAt}>
                        {new Date(a.occurredAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                    <p className="text-small text-muted" style={{ marginBottom: '6px' }}>
                      {a.summary}
                    </p>
                    <div className="text-xs text-subtle">
                      Actor: <strong>{a.actorLabel}</strong> ({a.actorRole}) · Correlation ID: {a.correlationId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Reviewer Decision Workspace + Institutional Outcome (Administrator) */}
        <div>
          {/* Prior Review Decisions History */}
          <section className="card" aria-labelledby="prior-decisions-heading" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header">
              <h2 id="prior-decisions-heading" className="card-title">
                Review Decision History ({decisions.length})
              </h2>
            </div>

            {decisions.length === 0 ? (
              <div className="state-empty" style={{ padding: 'var(--space-4)' }}>
                <p className="text-small text-muted">No review decisions committed yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {decisions.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      padding: 'var(--space-3)',
                    }}
                  >
                    <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-1)' }}>
                      <span className={`badge badge--${d.disposition === 'clear' ? 'low' : d.disposition === 'needs_follow_up' ? 'medium' : 'high'}`}>
                        {DISPOSITION_LABELS[d.disposition]}
                      </span>
                      <span className="text-subtle text-xs">v{d.version}</span>
                    </div>
                    <p className="text-small font-medium" style={{ margin: 'var(--space-2) 0 var(--space-1)' }}>
                      {d.reason}
                    </p>
                    {d.notes && <p className="text-xs text-muted">Notes: {d.notes}</p>}
                    <div className="text-subtle text-xs" style={{ marginTop: 'var(--space-2)' }}>
                      Decided by {d.reviewerId} · {new Date(d.decidedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Reviewer Decision Form (Enabled for open/under_review) */}
          <section className="card" aria-labelledby="decision-form-heading" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header">
              <h2 id="decision-form-heading" className="card-title">
                {investigation.status === 'reviewed' || investigation.status === 'outcome_recorded'
                  ? 'Submit Decision Revision'
                  : 'Record Reviewer Decision'}
              </h2>
              <span className="badge badge--neutral">Active Role: {activeRole}</span>
            </div>

            <form
              id={formId}
              onSubmit={(e) => {
                e.preventDefault()
                if (!reason.trim()) {
                  setSubmitError('Decision rationale is required by institutional review policy.')
                  return
                }
                setSubmitError(null)
                setShowConfirmModal(true)
              }}
            >
              {submitError && (
                <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-3)' }}>
                  {submitError}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Review Disposition</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {(['clear', 'needs_follow_up', 'escalated'] as Disposition[]).map((disp) => (
                    <label
                      key={disp}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius)',
                        background: disposition === disp ? 'var(--color-surface-3)' : 'var(--color-surface-2)',
                        border: `1px solid ${disposition === disp ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="disposition"
                        value={disp}
                        checked={disposition === disp}
                        onChange={() => setDisposition(disp)}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <div className="font-semibold text-small">{DISPOSITION_LABELS[disp]}</div>
                        <div className="text-subtle text-xs">{DISPOSITION_DESCRIPTIONS[disp]}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label" htmlFor="decision-reason">
                  Required Decision Rationale *
                </label>
                <textarea
                  id="decision-reason"
                  className="form-textarea"
                  placeholder="Detail the contextual facts supporting this determination (mandatory)…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label" htmlFor="decision-notes">
                  Internal Reviewer Notes (Optional)
                </label>
                <textarea
                  id="decision-notes"
                  className="form-textarea"
                  placeholder="Follow-up instructions or proctoring context…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary"
                style={{ width: '100%' }}
                disabled={submitting || !reason.trim()}
              >
                {submitting ? 'Committing Decision…' : 'Review & Commit Disposition →'}
              </button>
            </form>
          </section>

          {/* Institutional Outcome Panel (Separated Workflow for Administrator) */}
          <section
            className="card"
            aria-labelledby="institutional-outcome-heading"
            style={{
              borderColor: canRecordOutcome ? 'var(--color-purple)' : 'var(--color-border)',
              background: canRecordOutcome ? 'rgba(168, 85, 247, 0.03)' : 'var(--color-surface)',
            }}
          >
            <div className="card-header">
              <div>
                <h2 id="institutional-outcome-heading" className="card-title">
                  Administrator Institutional Outcome
                </h2>
                <span className="text-subtle text-xs">Separate institutional governance stage</span>
              </div>
              <span className="badge badge--neutral">Administrator Only</span>
            </div>

            {outcomes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {outcomes.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      padding: 'var(--space-3)',
                    }}
                  >
                    <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                      <span className="badge badge--low" style={{ textTransform: 'capitalize' }}>
                        {o.outcome.replace(/_/g, ' ')}
                      </span>
                      <span className="text-subtle text-xs">v{o.version}</span>
                    </div>
                    <p className="text-small font-medium">{o.reason}</p>
                    <div className="text-subtle text-xs" style={{ marginTop: 'var(--space-2)' }}>
                      Recorded by {o.administratorId} · {new Date(o.decidedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : !canRecordOutcome ? (
              <div className="state-empty" style={{ padding: 'var(--space-4)' }}>
                <p className="text-small text-muted">
                  Institutional outcome can only be recorded after a reviewer decision has been committed (current state: <strong>{investigation.status}</strong>).
                </p>
              </div>
            ) : activeRole !== 'administrator' ? (
              <div className="alert alert--warning text-small" style={{ marginBottom: 0 }}>
                <span>
                  Switch active role to <strong>Administrator</strong> in the top header to record institutional outcome.
                </span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!outcomeReason.trim()) {
                    setOutcomeError('Outcome justification is required.')
                    return
                  }
                  setOutcomeError(null)
                  setShowOutcomeConfirmModal(true)
                }}
              >
                {outcomeError && (
                  <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-3)' }}>
                    {outcomeError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Final Institutional Action</label>
                  <select
                    className="form-select"
                    value={outcomeValue}
                    onChange={(e) => setOutcomeValue(e.target.value as InstitutionalOutcomeValue)}
                  >
                    {OUTCOME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} — {opt.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label" htmlFor="outcome-reason">
                    Administrative Rationale *
                  </label>
                  <textarea
                    id="outcome-reason"
                    className="form-textarea"
                    placeholder="Reference institutional policy or committee minutes…"
                    value={outcomeReason}
                    onChange={(e) => setOutcomeReason(e.target.value)}
                    rows={2}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn--secondary"
                  style={{ width: '100%', borderColor: 'var(--color-purple)', color: 'var(--color-purple)' }}
                  disabled={submittingOutcome || !outcomeReason.trim()}
                >
                  {submittingOutcome ? 'Recording Outcome…' : 'Record Institutional Outcome'}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>

      {/* Confirmation Modal for Review Decision */}
      {showConfirmModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-decision-title">
          <div className="modal-dialog">
            <h3 id="confirm-decision-title" style={{ marginBottom: 'var(--space-2)' }}>
              Confirm Review Disposition: {DISPOSITION_LABELS[disposition]}
            </h3>
            <p className="text-small text-muted" style={{ marginBottom: 'var(--space-4)' }}>
              This will commit the disposition and record a permanent audit entry under <strong>{actorLabel}</strong>.
            </p>

            <div
              style={{
                background: 'var(--color-surface-2)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius)',
                fontSize: '0.8125rem',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div className="font-semibold text-muted text-xs">DOCUMENTED RATIONALE:</div>
              <div style={{ marginTop: '4px' }}>{reason}</div>
            </div>

            <div className="flex justify-between items-center">
              <button type="button" className="btn btn--secondary" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleConfirmDecision}
                disabled={submitting}
              >
                {submitting ? 'Committing…' : 'Confirm & Commit Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Institutional Outcome */}
      {showOutcomeConfirmModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-outcome-title">
          <div className="modal-dialog">
            <h3 id="confirm-outcome-title" style={{ marginBottom: 'var(--space-2)' }}>
              Confirm Institutional Outcome
            </h3>
            <p className="text-small text-muted" style={{ marginBottom: 'var(--space-4)' }}>
              Recording this institutional outcome establishes a formal outcome under administrative authority.
            </p>

            <div
              style={{
                background: 'var(--color-surface-2)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius)',
                fontSize: '0.8125rem',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div className="font-semibold text-muted text-xs">OUTCOME:</div>
              <div style={{ marginTop: '2px', textTransform: 'capitalize' }}>{outcomeValue.replace(/_/g, ' ')}</div>
              <div className="font-semibold text-muted text-xs" style={{ marginTop: '8px' }}>RATIONALE:</div>
              <div style={{ marginTop: '2px' }}>{outcomeReason}</div>
            </div>

            <div className="flex justify-between items-center">
              <button type="button" className="btn btn--secondary" onClick={() => setShowOutcomeConfirmModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleConfirmOutcome}
                disabled={submittingOutcome}
              >
                {submittingOutcome ? 'Recording…' : 'Confirm & Record Outcome'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
