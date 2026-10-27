import { useEffect, useState, useId } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useService } from '@/services/useService'
import type {
  Investigation,
  ReviewDecision,
  InstitutionalOutcome,
  AuditEntry,
  Disposition,
  InstitutionalOutcomeValue,
} from '@/domain/types'
import { canSubmitReviewDecision, canSubmitOutcome, DISPOSITION_LABELS, DISPOSITION_DESCRIPTIONS } from '@/domain/transitions'

const OUTCOME_OPTIONS: Array<{ value: InstitutionalOutcomeValue; label: string; desc: string }> = [
  { value: 'no_action', label: 'No action', desc: 'After review, no institutional action is warranted.' },
  { value: 'caution_issued', label: 'Caution issued', desc: 'A formal caution has been issued to the candidate.' },
  { value: 'referral_required', label: 'Referral required', desc: 'Case referred to the institutional integrity committee.' },
  { value: 'further_review', label: 'Further review', desc: 'Additional evidence or process steps are needed.' },
]

function AuditRow({ entry }: { entry: AuditEntry }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{ minWidth: '120px' }}>
        <time
          className="text-mono text-small text-muted"
          dateTime={entry.occurredAt}
        >
          {new Date(entry.occurredAt).toLocaleString()}
        </time>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
          {entry.action.replace(/_/g, ' ')}
        </div>
        <div className="text-muted text-small">{entry.summary}</div>
        <div className="text-muted text-small" style={{ marginTop: 'var(--space-1)' }}>
          Actor: <strong>{entry.actorLabel}</strong> ({entry.actorRole}) · Target: {entry.targetType} {entry.targetId}
        </div>
      </div>
    </div>
  )
}

export function InvestigationPage() {
  const { investigationId } = useParams<{ investigationId: string }>()
  const service = useService()
  const formId = useId()

  const [investigation, setInvestigation] = useState<Investigation | null>(null)
  const [decisions, setDecisions] = useState<ReviewDecision[]>([])
  const [outcomes, setOutcomes] = useState<InstitutionalOutcome[]>([])
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Decision form state
  const [disposition, setDisposition] = useState<Disposition>('clear')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Outcome form state
  const [outcomeValue, setOutcomeValue] = useState<InstitutionalOutcomeValue>('no_action')
  const [outcomeReason, setOutcomeReason] = useState('')
  const [submittingOutcome, setSubmittingOutcome] = useState(false)
  const [outcomeError, setOutcomeError] = useState<string | null>(null)
  const [outcomeSuccess, setOutcomeSuccess] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  async function loadData(showSpinner = false) {
    if (!investigationId) return
    if (showSpinner) setLoading(true)
    try {
      const [inv, dec, audit] = await Promise.all([
        service.getInvestigation(investigationId),
        service.getInvestigationDecisions(investigationId),
        service.getAuditEntries('Investigation', investigationId),
      ])
      setInvestigation(inv)
      setDecisions(dec)
      setAuditEntries(audit.items)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    if (!investigationId) return

    Promise.all([
      service.getInvestigation(investigationId),
      service.getInvestigationDecisions(investigationId),
      service.getAuditEntries('Investigation', investigationId),
    ])
      .then(([inv, dec, audit]) => {
        if (cancelled) return
        setInvestigation(inv)
        setDecisions(dec)
        setAuditEntries(audit.items)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [investigationId, service])

  async function handleSubmitDecision(e: React.FormEvent) {
    e.preventDefault()
    if (!investigation) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      await service.submitDecision(investigation.id, { disposition, reason, notes: notes || undefined }, investigation.version)
      setSubmitSuccess(true)
      setReason('')
      setNotes('')
      loadData()
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmitOutcome(e: React.FormEvent) {
    e.preventDefault()
    if (!investigation) return
    setOutcomeError(null)
    setSubmittingOutcome(true)
    try {
      const result = await service.submitOutcome(
        investigation.id,
        { outcome: outcomeValue, reason: outcomeReason },
        investigation.version,
      )
      setOutcomes((prev) => [...prev, result])
      setOutcomeSuccess(true)
      setOutcomeReason('')
      loadData()
    } catch (err: unknown) {
      setOutcomeError(err instanceof Error ? err.message : 'Outcome submission failed')
    } finally {
      setSubmittingOutcome(false)
    }
  }

  if (loading) {
    return (
      <div className="state-loading" aria-label="Loading investigation">
        <span className="spinner" aria-hidden="true" />
        <span>Loading investigation…</span>
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
  if (!investigation) return null

  const canDecide = canSubmitReviewDecision(investigation.status)
  const canOutcome = canSubmitOutcome(investigation.status)

  return (
    <div className="page-container page-container--wide">
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link to="/app/sessions" className="btn btn--secondary btn--sm" style={{ marginBottom: 'var(--space-4)' }}>
          ← Sessions
        </Link>
        <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Investigation</h1>
            <p className="text-muted">
              Session: <code>{investigation.sessionId}</code> ·{' '}
              {investigation.signalIds.length} signal{investigation.signalIds.length !== 1 ? 's' : ''} ·{' '}
              Version {investigation.version}
            </p>
          </div>
          <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
            <span
              className={`badge badge--status-${
                investigation.status === 'outcome_recorded' ? 'outcome' :
                investigation.status === 'reviewed'         ? 'reviewed' : 'open'
              }`}
              style={{ fontSize: '0.875rem', padding: '4px 12px' }}
            >
              {investigation.status.replace(/_/g, ' ')}
            </span>
            <span className="badge badge--simulated">⚠ SIMULATED</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-8)', alignItems: 'start' }}>

        {/* Main column: decisions + audit trail */}
        <div>
          {/* Prior decisions */}
          <section aria-labelledby="decisions-heading" style={{ marginBottom: 'var(--space-8)' }}>
            <h2 id="decisions-heading" style={{ marginBottom: 'var(--space-4)' }}>Review decisions</h2>
            {decisions.length === 0 ? (
              <div className="state-empty" style={{ padding: 'var(--space-6)' }}>
                <div className="state-empty__icon">📋</div>
                <p className="state-empty__title">No decisions yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {decisions.map((d) => (
                  <div key={d.id} className="card">
                    <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-3)' }}>
                      <div className="flex gap-2 items-center">
                        <span
                          className={`badge badge--${d.disposition === 'clear' ? 'clear' : d.disposition === 'escalated' ? 'escalated' : 'needs-follow-up'}`}
                        >
                          {DISPOSITION_LABELS[d.disposition]}
                        </span>
                        {d.supersedesId && (
                          <span className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-3)' }}>
                            Revision v{d.version}
                          </span>
                        )}
                      </div>
                      <time className="text-muted text-small text-mono" dateTime={d.decidedAt}>
                        {new Date(d.decidedAt).toLocaleString()}
                      </time>
                    </div>
                    <p style={{ marginBottom: d.notes ? 'var(--space-3)' : 0 }}>
                      <span style={{ color: 'var(--color-text-3)', fontWeight: 500 }}>Reason: </span>
                      {d.reason}
                    </p>
                    {d.notes && (
                      <p className="text-muted text-small">{d.notes}</p>
                    )}
                    <p className="text-muted text-small" style={{ marginTop: 'var(--space-2)' }}>
                      Reviewer: [DEMO] Reviewer
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Institutional outcomes */}
          {outcomes.length > 0 && (
            <section aria-labelledby="outcomes-heading" style={{ marginBottom: 'var(--space-8)' }}>
              <h2 id="outcomes-heading" style={{ marginBottom: 'var(--space-4)' }}>Institutional outcomes</h2>
              {outcomes.map((o) => (
                <div key={o.id} className="card" style={{ borderColor: 'rgba(139,92,246,0.4)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-3)' }}>
                    <span className="badge badge--status-outcome">{o.outcome.replace(/_/g, ' ')}</span>
                    <time className="text-muted text-small text-mono" dateTime={o.decidedAt}>
                      {new Date(o.decidedAt).toLocaleString()}
                    </time>
                  </div>
                  <p><span style={{ color: 'var(--color-text-3)', fontWeight: 500 }}>Reason: </span>{o.reason}</p>
                  <p className="text-muted text-small" style={{ marginTop: 'var(--space-2)' }}>
                    Administrator: [DEMO] Administrator
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Audit trail */}
          <section aria-labelledby="audit-heading">
            <h2 id="audit-heading" style={{ marginBottom: 'var(--space-4)' }}>
              Audit trail
              <span className="text-muted text-small" style={{ marginLeft: 'var(--space-3)', fontWeight: 400 }}>
                (append-only · {auditEntries.length} entr{auditEntries.length !== 1 ? 'ies' : 'y'})
              </span>
            </h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }} aria-label="Audit log">
              {auditEntries.length === 0 ? (
                <div className="state-empty" style={{ padding: 'var(--space-6)' }}>
                  <p className="text-muted text-small">No audit entries yet.</p>
                </div>
              ) : (
                auditEntries.map((e) => <AuditRow key={e.id} entry={e} />)
              )}
            </div>
          </section>
        </div>

        {/* Right column: action panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', position: 'sticky', top: 'var(--space-4)' }}>

          {/* Reviewer decision form */}
          <section className="card" aria-labelledby="decision-form-heading">
            <h2 id="decision-form-heading" style={{ marginBottom: 'var(--space-4)' }}>
              Submit review decision
              <span className="badge badge--simulated" style={{ marginLeft: 'var(--space-2)', verticalAlign: 'middle' }}>
                DEMO REVIEWER
              </span>
            </h2>

            {!canDecide && !submitSuccess && (
              <div className="alert alert--info">
                ℹ️ This investigation is in status &ldquo;{investigation.status.replace(/_/g, ' ')}&rdquo;. New decisions cannot be submitted.
              </div>
            )}

            {submitSuccess && (
              <div className="alert alert--success" role="status" aria-live="polite">
                ✅ Decision submitted successfully. Audit entry appended.
              </div>
            )}

            {canDecide && (
              <form
                id={`${formId}-decision`}
                onSubmit={handleSubmitDecision}
                aria-label="Review decision form"
                noValidate
              >
                {submitError && (
                  <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                    ⚠️ {submitError}
                  </div>
                )}

                {/* Disposition */}
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <span className="form-label" id={`${formId}-disposition-label`}>
                    Disposition <span className="form-required" aria-label="required">*</span>
                  </span>
                  <div className="radio-group" role="radiogroup" aria-labelledby={`${formId}-disposition-label`}>
                    {(Object.keys(DISPOSITION_LABELS) as Disposition[]).map((d) => (
                      <label
                        key={d}
                        className={`radio-option${disposition === d ? ' radio-option--selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`${formId}-disposition`}
                          value={d}
                          checked={disposition === d}
                          onChange={() => setDisposition(d)}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{DISPOSITION_LABELS[d]}</div>
                          <div className="text-small text-muted">{DISPOSITION_DESCRIPTIONS[d]}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label" htmlFor={`${formId}-reason`}>
                    Reason <span className="form-required" aria-label="required">*</span>
                  </label>
                  <textarea
                    id={`${formId}-reason`}
                    className="form-control"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain your reasoning based on the evidence…"
                    required
                    aria-required="true"
                    rows={4}
                  />
                </div>

                {/* Notes */}
                <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="form-label" htmlFor={`${formId}-notes`}>
                    Notes (optional)
                  </label>
                  <textarea
                    id={`${formId}-notes`}
                    className="form-control"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional context or follow-up actions…"
                    rows={2}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={submitting || !reason.trim()}
                  aria-disabled={submitting || !reason.trim()}
                  id="btn-submit-decision"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {submitting ? (
                    <><span className="spinner" style={{ width: '1rem', height: '1rem' }} aria-hidden="true" /> Submitting…</>
                  ) : (
                    'Submit decision'
                  )}
                </button>
              </form>
            )}
          </section>

          {/* Administrator outcome panel */}
          <section className="card" aria-labelledby="admin-heading" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
            <h2 id="admin-heading" style={{ marginBottom: 'var(--space-3)' }}>
              Institutional outcome
              <span className="badge" style={{ marginLeft: 'var(--space-2)', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', verticalAlign: 'middle' }}>
                ADMIN ONLY
              </span>
            </h2>
            <p className="text-muted text-small" style={{ marginBottom: 'var(--space-4)' }}>
              Only a designated administrator may record an institutional outcome. In this demo,
              an administrator persona is simulated. This action is separate from reviewer disposition.
            </p>

            {!showAdminPanel && (
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => setShowAdminPanel(true)}
                disabled={!canOutcome}
                aria-disabled={!canOutcome}
                id="btn-show-admin-panel"
              >
                {canOutcome ? 'Open administrator panel [DEMO]' : `Requires "reviewed" status (current: ${investigation.status.replace(/_/g, ' ')})`}
              </button>
            )}

            {outcomeSuccess && (
              <div className="alert alert--success" role="status" aria-live="polite" style={{ marginTop: 'var(--space-3)' }}>
                ✅ Institutional outcome recorded. Separate audit entry appended.
              </div>
            )}

            {showAdminPanel && canOutcome && !outcomeSuccess && (
              <form
                id={`${formId}-outcome`}
                onSubmit={handleSubmitOutcome}
                aria-label="Institutional outcome form"
                noValidate
              >
                {outcomeError && (
                  <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                    ⚠️ {outcomeError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label" htmlFor={`${formId}-outcome-value`}>
                    Outcome <span className="form-required" aria-label="required">*</span>
                  </label>
                  <select
                    id={`${formId}-outcome-value`}
                    className="form-control"
                    value={outcomeValue}
                    onChange={(e) => setOutcomeValue(e.target.value as InstitutionalOutcomeValue)}
                    required
                    aria-required="true"
                  >
                    {OUTCOME_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label" htmlFor={`${formId}-outcome-reason`}>
                    Reason <span className="form-required" aria-label="required">*</span>
                  </label>
                  <textarea
                    id={`${formId}-outcome-reason`}
                    className="form-control"
                    value={outcomeReason}
                    onChange={(e) => setOutcomeReason(e.target.value)}
                    placeholder="Institutional rationale for this outcome…"
                    required
                    aria-required="true"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={submittingOutcome || !outcomeReason.trim()}
                  aria-disabled={submittingOutcome || !outcomeReason.trim()}
                  id="btn-submit-outcome"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {submittingOutcome ? (
                    <><span className="spinner" style={{ width: '1rem', height: '1rem' }} aria-hidden="true" /> Recording…</>
                  ) : (
                    'Record institutional outcome [DEMO ADMIN]'
                  )}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .page-container--wide > div > div:last-child {
            position: static !important;
          }
        }
      `}</style>
    </div>
  )
}
