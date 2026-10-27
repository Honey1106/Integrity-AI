import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function CandidateWelcomePage() {
  const [consentGiven, setConsentGiven] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="candidate-card">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 10px',
            background: '#e0f2fe',
            color: '#0369a1',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: 'var(--space-3)',
          }}
        >
          EXAMINATION INSTRUCTIONS
        </span>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--color-candidate-text)', marginBottom: 'var(--space-2)' }}>
          Software Engineering Assessment — Autumn 2026
        </h1>
        <p style={{ color: 'var(--color-candidate-text-2)', fontSize: '0.9rem' }}>
          Please review the examination parameters, ethical conduct guidelines, and telemetry consent before proceeding to the hardware verification preflight.
        </p>
      </div>

      {/* Assessment Specifications */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div style={{ background: '#f8fafc', border: '1px solid var(--color-candidate-border)', padding: 'var(--space-3)', borderRadius: 'var(--radius)' }}>
          <div className="text-xs font-semibold" style={{ color: '#64748b' }}>DURATION</div>
          <div className="font-semibold text-small" style={{ color: 'var(--color-candidate-text)' }}>90 Minutes</div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid var(--color-candidate-border)', padding: 'var(--space-3)', borderRadius: 'var(--radius)' }}>
          <div className="text-xs font-semibold" style={{ color: '#64748b' }}>TOTAL QUESTIONS</div>
          <div className="font-semibold text-small" style={{ color: 'var(--color-candidate-text)' }}>3 Core Technical Tasks</div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid var(--color-candidate-border)', padding: 'var(--space-3)', borderRadius: 'var(--radius)' }}>
          <div className="text-xs font-semibold" style={{ color: '#64748b' }}>AUTHORIZED AIDS</div>
          <div className="font-semibold text-small" style={{ color: 'var(--color-candidate-text)' }}>Scratch Paper &amp; Built-in IDE</div>
        </div>
      </div>

      {/* Transparent Telemetry & Integrity Notice */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: '1rem', color: 'var(--color-candidate-text)', marginBottom: 'var(--space-2)' }}>
          Ethical Conduct &amp; Telemetry Notice
        </h2>
        <div
          style={{
            background: '#f1f5f9',
            border: '1px solid var(--color-candidate-border)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-4)',
            fontSize: '0.8125rem',
            color: 'var(--color-candidate-text-2)',
            lineHeight: 1.6,
          }}
        >
          <p style={{ marginBottom: 'var(--space-2)' }}>
            <strong>Human Review Only:</strong> In this examination, telemetry signals (such as window focus shifts or secondary tab openings) are recorded as raw contextual events. No algorithm can automatically fail or penalize you. All anomalies are evaluated individually by appointed university examiners.
          </p>
          <p style={{ marginBottom: 'var(--space-2)' }}>
            <strong>No Video or Audio Recording:</strong> Raw webcam and microphone data are <em>never recorded, saved to disk, or transmitted to any server</em>. Access is requested in the next step solely to verify local hardware availability.
          </p>
          <p>
            <strong>Fair Due Process:</strong> Should an atypical pattern occur (such as a Wi-Fi dropout or display glitch), candidate explanations are correlated with the timestamped telemetry.
          </p>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-4)',
            cursor: 'pointer',
            color: 'var(--color-candidate-text)',
            fontSize: '0.875rem',
          }}
        >
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
          />
          <span className="font-medium">
            I confirm that I have read the integrity notice and consent to session telemetry logging.
          </span>
        </label>
      </section>

      {/* Action */}
      <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-candidate-border)' }}>
        <button
          type="button"
          onClick={() => navigate('/candidate/preflight')}
          className="btn btn--primary"
          style={{ width: '100%', padding: '11px', fontSize: '0.95rem' }}
          disabled={!consentGiven}
        >
          Proceed to Device Preflight Check →
        </button>
      </div>
    </div>
  )
}
