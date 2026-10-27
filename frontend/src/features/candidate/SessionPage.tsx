import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Question {
  id: number
  title: string
  prompt: string
  codeSnippet?: string
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: 'Question 1: Concurrency Control in Document Stores',
    prompt:
      'Explain how optimistic concurrency control (OCC) is implemented in distributed document stores without pessimistic record locking. Specifically detail how version fields prevent the lost-update anomaly and how conflict responses (such as HTTP 409) should be handled by client applications.',
  },
  {
    id: 2,
    title: 'Question 2: Idempotent Review Decision Pipelines',
    prompt:
      'In an institutional review workflow, why must decisions supersede rather than overwrite previous states? Describe how an append-only audit trail maintains accountability and why audit entries must commit atomically with state transitions.',
  },
  {
    id: 3,
    title: 'Question 3: Client-Side Telemetry Limitations',
    prompt:
      'Discuss why browser telemetry events (e.g., window blur, tab switching, audio threshold spikes) cannot be treated as definitive evidence of academic misconduct without qualitative human verification.',
  },
]

export function SessionPage() {
  const navigate = useNavigate()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({
    0: '',
    1: '',
    2: '',
  })
  const [timeLeft, setTimeLeft] = useState(5340) // ~89 minutes in seconds
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')
  const [focusWarnings, setFocusWarnings] = useState(0)

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Focus tracking notification
  useEffect(() => {
    const handleBlur = () => {
      setFocusWarnings((w) => w + 1)
    }
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [])

  function handleAnswerChange(val: string) {
    setSaveStatus('saving')
    setAnswers((prev) => ({ ...prev, [currentIdx]: val }))
    setTimeout(() => setSaveStatus('saved'), 400)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const currentQ = QUESTIONS[currentIdx]
  const answeredCount = Object.values(answers).filter((a) => a.trim().length > 0).length

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      {/* Top Quiet Exam Navigation Bar */}
      <header
        style={{
          height: '62px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-6)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '20px' }}>🛡</span>
          <div>
            <div className="font-semibold text-small">Software Engineering Assessment — Autumn 2026</div>
            <div className="text-xs text-muted">Candidate: Alex Rivera (ST-8921) · Session: session-001</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            style={{
              padding: '4px 12px',
              background: '#f1f5f9',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: timeLeft < 300 ? '#ef4444' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⏱ Remaining:</span>
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => setShowConfirmModal(true)}
          >
            Submit Final Assessment ({answeredCount}/{QUESTIONS.length})
          </button>
        </div>
      </header>

      {/* Main Exam Interface Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', maxWidth: '1400px', margin: '0 auto', width: '100%', padding: 'var(--space-6)', gap: 'var(--space-6)' }}>
        {/* Left: Question Palette */}
        <aside style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', height: 'fit-content' }}>
          <div className="font-semibold text-small" style={{ marginBottom: 'var(--space-3)', color: '#0f172a' }}>
            Question Navigator
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {QUESTIONS.map((q, idx) => {
              const hasAnswer = answers[idx]?.trim().length > 0
              const isCurrent = idx === currentIdx

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius)',
                    background: isCurrent ? '#eff6ff' : '#ffffff',
                    border: `1px solid ${isCurrent ? '#3b82f6' : '#e2e8f0'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#0f172a',
                    fontWeight: isCurrent ? 600 : 400,
                    fontSize: '0.8125rem',
                  }}
                >
                  <span>Question {q.id}</span>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: hasAnswer ? '#10b981' : '#cbd5e1',
                    }}
                    title={hasAnswer ? 'Answered' : 'Unanswered'}
                  />
                </button>
              )
            })}
          </div>

          {focusWarnings > 0 && (
            <div
              style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-3)',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius)',
                fontSize: '0.75rem',
                color: '#92400e',
                lineHeight: 1.4,
              }}
            >
              <strong>Notice:</strong> Window switch detected ({focusWarnings}x). Active focus events are logged for human review.
            </div>
          )}
        </aside>

        {/* Center: Current Question & Editor */}
        <main style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#2563eb',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Task {currentQ.id} of {QUESTIONS.length}
            </span>

            <span className="text-xs text-muted">
              Status: {saveStatus === 'saving' ? 'Saving draft…' : '✓ Draft auto-saved'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-3)', color: '#0f172a' }}>
            {currentQ.title}
          </h2>

          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#334155', marginBottom: 'var(--space-6)' }}>
            {currentQ.prompt}
          </p>

          <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label className="form-label" htmlFor="response-editor" style={{ color: '#475569' }}>
              Your Candidate Response:
            </label>
            <textarea
              id="response-editor"
              value={answers[currentIdx]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your structured explanation and technical rationale here…"
              style={{
                width: '100%',
                flex: 1,
                minHeight: '260px',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius)',
                border: '1px solid #cbd5e1',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: '#0f172a',
                background: '#ffffff',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <div className="flex justify-between items-center text-xs text-muted" style={{ marginTop: 'var(--space-2)' }}>
              <span>Character count: {answers[currentIdx]?.length || 0}</span>
              <span>Words: {answers[currentIdx]?.trim() ? answers[currentIdx].trim().split(/\s+/).length : 0}</span>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex justify-between items-center" style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
            >
              ← Previous Question
            </button>

            {currentIdx < QUESTIONS.length - 1 ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setCurrentIdx((i) => Math.min(QUESTIONS.length - 1, i + 1))}
              >
                Next Question →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setShowConfirmModal(true)}
              >
                Review &amp; Submit Assessment →
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog" style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}>
            <h3 style={{ marginBottom: 'var(--space-2)', color: '#0f172a' }}>Confirm Final Submission</h3>
            <p className="text-small text-muted" style={{ marginBottom: 'var(--space-4)' }}>
              You have completed <strong>{answeredCount}</strong> of <strong>{QUESTIONS.length}</strong> questions. Once submitted, your examination window will close and your submission will be routed to the institutional integrity review queue.
            </p>

            <div className="flex justify-between items-center">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Return to Exam
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate('/candidate/submitted')}
              >
                Confirm &amp; Submit Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
