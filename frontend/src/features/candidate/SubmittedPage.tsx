import { useState } from 'react'
import { Link } from 'react-router-dom'

export function SubmittedPage() {
  const [submissionTimestamp] = useState(() => new Date().toISOString())
  const verificationHash = '0x8f2a...e9b1 (Signed SHA-256)'

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-6) 0' }}>
      <div className="candidate-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto var(--space-4)',
            border: '2px solid #a7f3d0',
          }}
        >
          ✓
        </div>

        <span
          className="badge"
          style={{
            background: '#ecfdf5',
            color: '#047857',
            borderColor: '#a7f3d0',
            marginBottom: 'var(--space-3)',
          }}
        >
          Submission Sealed &amp; Received
        </span>

        <h1
          style={{
            fontSize: '1.5rem',
            color: 'var(--color-candidate-text)',
            fontWeight: 700,
            marginBottom: 'var(--space-2)',
          }}
        >
          Assessment Successfully Submitted
        </h1>

        <p
          style={{
            color: 'var(--color-candidate-text-2)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            marginBottom: 'var(--space-6)',
          }}
        >
          Your responses and session telemetry have been sealed and transmitted to your
          institution’s examination registry. No further action is required from your browser.
        </p>

        {/* Verification Summary Receipt */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--color-candidate-border)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-4)',
            textAlign: 'left',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div
            className="text-xs font-semibold"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              marginBottom: 'var(--space-3)',
            }}
          >
            Digital Submission Receipt
          </div>

          <div
            className="flex justify-between items-center text-xs"
            style={{ padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}
          >
            <span style={{ color: '#64748b' }}>Candidate Identifier:</span>
            <span className="font-mono font-medium" style={{ color: '#0f172a' }}>
              CAND-2026-9041
            </span>
          </div>

          <div
            className="flex justify-between items-center text-xs"
            style={{ padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}
          >
            <span style={{ color: '#64748b' }}>Assessment Module:</span>
            <span className="font-medium" style={{ color: '#0f172a' }}>
              Software Engineering Final Assessment 2026
            </span>
          </div>

          <div
            className="flex justify-between items-center text-xs"
            style={{ padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}
          >
            <span style={{ color: '#64748b' }}>Timestamp:</span>
            <span className="font-mono" style={{ color: '#0f172a' }}>
              {submissionTimestamp}
            </span>
          </div>

          <div
            className="flex justify-between items-center text-xs"
            style={{ padding: '6px 0' }}
          >
            <span style={{ color: '#64748b' }}>Audit Seal:</span>
            <span className="font-mono text-xs" style={{ color: '#059669' }}>
              {verificationHash}
            </span>
          </div>
        </div>

        {/* Rights Notice */}
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-4)',
            fontSize: '0.8rem',
            color: '#1e40af',
            lineHeight: 1.5,
            textAlign: 'left',
            marginBottom: 'var(--space-6)',
          }}
        >
          <strong>Candidate Rights &amp; Review Policy:</strong> Under the IntegrityAI accountable
          review charter, automated indicators never make disciplinary determinations. All
          observations are subject to human reviewer examination, and candidates have the right to
          request an explanation of any documented session observations.
        </div>

        <div className="flex justify-center gap-3">
          <Link to="/" className="btn btn--secondary" style={{ textDecoration: 'none' }}>
            Return to Public Website
          </Link>
          <Link
            to="/app"
            className="btn btn--primary"
            style={{
              textDecoration: 'none',
              background: 'var(--color-candidate-accent)',
              borderColor: 'var(--color-candidate-accent)',
            }}
          >
            View Reviewer Workspace ↗
          </Link>
        </div>
      </div>
    </div>
  )
}
