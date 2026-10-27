import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DeviceReadiness } from '@/domain/types'
import { isReadyToStart, canRetry, isTerminalReadinessFailure } from '@/domain/transitions'

// State machine labels and support messages
const READINESS_LABELS: Record<DeviceReadiness, string> = {
  unrequested: 'Not yet requested',
  requesting: 'Requesting permissions…',
  ready: 'Camera and microphone ready',
  denied: 'Permission denied',
  'missing-device': 'No camera or microphone found',
  busy: 'Device in use by another application',
  unsupported: 'Browser does not support media access',
  revoked: 'Permission was revoked',
  error: 'An error occurred',
}

const READINESS_GUIDANCE: Partial<Record<DeviceReadiness, string>> = {
  denied:
    'Your browser blocked access. Open your browser\'s site settings and allow camera/microphone access, then try again.',
  'missing-device':
    'No camera or microphone was detected. Connect a device and try again.',
  busy:
    'Your camera or microphone is already in use by another application. Close other video calls and try again.',
  unsupported:
    'Your browser does not support media access required for device checking. Please use a modern browser (Chrome, Edge, Firefox, or Safari 14.1+).',
  revoked:
    'Permission was revoked during the session. Reload this page or visit your browser\'s site settings to restore access.',
  error:
    'An unexpected error occurred while requesting permissions. Try again, or contact support if the problem persists.',
}

export function PreflightPage() {
  const [readiness, setReadiness] = useState<DeviceReadiness>('unrequested')
  const [consentGiven, setConsentGiven] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const navigate = useNavigate()

  const ready = isReadyToStart(readiness)
  const canTryAgain = canRetry(readiness)
  const isTerminal = isTerminalReadinessFailure(readiness)

  async function handleRequestPermissions() {
    // Stop any existing stream first
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
    setReadiness('requesting')

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setStream(mediaStream)
      setReadiness('ready')
    } catch (err: unknown) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setReadiness('denied')
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setReadiness('missing-device')
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setReadiness('busy')
        } else if (err.name === 'NotSupportedError') {
          setReadiness('unsupported')
        } else {
          setReadiness('error')
        }
      } else {
        setReadiness('error')
      }
    }
  }

  function handleSkipPreview() {
    // The spec allows skipping the preview — but entry still blocks without readiness.
    // For the demo, we allow marking as unsupported to show the blocked state.
    if (typeof navigator.mediaDevices === 'undefined') {
      setReadiness('unsupported')
    } else {
      setReadiness('missing-device')
    }
  }

  function handleContinue() {
    if (!ready) return
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
    }
    navigate('/demo/candidate/session')
  }

  return (
    <div className="candidate-layout">
      <nav className="candidate-nav" aria-label="Candidate assessment navigation">
        <span className="candidate-nav__logo" aria-label="IntegrityAI assessment">
          🛡 IntegrityAI Assessment
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.75rem',
            background: '#fef9c3',
            color: '#78350f',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 600,
          }}
        >
          SIMULATED DEMO
        </span>
      </nav>

      <div style={{ padding: 'var(--space-10) var(--space-6)' }}>
        <div className="candidate-card">
          {/* Step progress */}
          <div className="step-progress" aria-label="Assessment steps">
            <div className="step-progress__item step-progress__item--active">
              <span className="step-progress__dot" />
              <span>Consent &amp; device check</span>
            </div>
            <span aria-hidden="true" style={{ color: '#cbd5e0' }}>›</span>
            <div className="step-progress__item">
              <span className="step-progress__dot" />
              <span>Assessment</span>
            </div>
            <span aria-hidden="true" style={{ color: '#cbd5e0' }}>›</span>
            <div className="step-progress__item">
              <span className="step-progress__dot" />
              <span>Submitted</span>
            </div>
          </div>

          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)', color: 'var(--color-candidate-text)' }}>
            Device check &amp; consent
          </h1>
          <p style={{ color: 'var(--color-candidate-text-2)', marginBottom: 'var(--space-6)' }}>
            Before you begin, please review the monitoring notice and check your device.
          </p>

          {/* Consent section */}
          <section aria-labelledby="consent-heading" style={{ marginBottom: 'var(--space-6)' }}>
            <h2 id="consent-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-3)', color: 'var(--color-candidate-text)' }}>
              Monitoring notice
            </h2>
            <div
              style={{
                background: '#f7fafc',
                border: '1px solid var(--color-candidate-border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-4)',
                fontSize: '0.875rem',
                color: 'var(--color-candidate-text-2)',
                lineHeight: 1.7,
              }}
              aria-label="Monitoring notice text"
            >
              <p style={{ marginBottom: 'var(--space-3)' }}>
                <strong>What is monitored:</strong> During the assessment, the browser may record
                focus events (when you switch away from the assessment window) and tab navigation
                events.
              </p>
              <p style={{ marginBottom: 'var(--space-3)' }}>
                <strong>What is NOT monitored:</strong> No video, audio, screen recordings,
                keystrokes, clipboard, or device scans are collected.
              </p>
              <p style={{ marginBottom: 'var(--space-3)' }}>
                <strong>Camera/microphone access:</strong> Access may be requested to verify
                device presence and for optional local preview. Preview video is never sent to
                any server in this demo.
              </p>
              <p>
                <strong>Simulated data:</strong> All observations in this demo are labelled
                [SIMULATED] and are not associated with any real candidate or institution.
              </p>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-4)',
                cursor: 'pointer',
                fontSize: '0.9375rem',
              }}
            >
              <input
                type="checkbox"
                id="consent-checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                style={{ marginTop: '3px', accentColor: 'var(--color-candidate-accent)', width: '18px', height: '18px' }}
                aria-describedby="consent-description"
              />
              <span id="consent-description" style={{ color: 'var(--color-candidate-text)' }}>
                I have read the monitoring notice and understand what is and is not collected.
              </span>
            </label>
          </section>

          <div
            style={{
              height: '1px',
              background: 'var(--color-candidate-border)',
              margin: 'var(--space-6) 0',
            }}
          />

          {/* Device check section */}
          <section aria-labelledby="device-heading" style={{ marginBottom: 'var(--space-6)' }}>
            <h2 id="device-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-4)', color: 'var(--color-candidate-text)' }}>
              Device readiness
            </h2>

            {/* Readiness indicator */}
            <div
              className={`readiness-indicator readiness-indicator--${readiness}`}
              role="status"
              aria-live="polite"
              aria-label={`Device readiness: ${READINESS_LABELS[readiness]}`}
              style={{ marginBottom: 'var(--space-4)' }}
            >
              <span aria-hidden="true">
                {readiness === 'ready' && '✅'}
                {readiness === 'requesting' && '⏳'}
                {readiness === 'unrequested' && '⬜'}
                {(readiness === 'denied' || readiness === 'revoked') && '🚫'}
                {readiness === 'missing-device' && '📷'}
                {readiness === 'busy' && '🔴'}
                {readiness === 'unsupported' && '❌'}
                {readiness === 'error' && '⚠️'}
              </span>
              <span>{READINESS_LABELS[readiness]}</span>
            </div>

            {/* Guidance for non-ready states */}
            {READINESS_GUIDANCE[readiness] && (
              <div
                role="alert"
                style={{
                  background: isTerminal ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${isTerminal ? '#fca5a5' : '#fcd34d'}`,
                  borderRadius: 'var(--radius)',
                  padding: 'var(--space-4)',
                  fontSize: '0.875rem',
                  color: isTerminal ? '#991b1b' : '#92400e',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <strong>What to do:</strong> {READINESS_GUIDANCE[readiness]}
              </div>
            )}

            {/* Device permission buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              {readiness === 'unrequested' && (
                <>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleRequestPermissions}
                    disabled={!consentGiven}
                    aria-describedby={!consentGiven ? 'consent-required-hint' : undefined}
                    id="btn-request-permissions"
                  >
                    Check camera &amp; microphone
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={handleSkipPreview}
                    disabled={!consentGiven}
                    id="btn-skip-preview"
                  >
                    Skip device check
                  </button>
                </>
              )}
              {readiness === 'requesting' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className="spinner" aria-hidden="true" />
                  <span style={{ color: 'var(--color-candidate-text-2)', fontSize: '0.875rem' }}>
                    Waiting for browser permission dialog…
                  </span>
                </div>
              )}
              {canTryAgain && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleRequestPermissions}
                  id="btn-retry-permissions"
                >
                  Try again
                </button>
              )}
            </div>

            {!consentGiven && readiness === 'unrequested' && (
              <p
                id="consent-required-hint"
                role="note"
                style={{ fontSize: '0.8125rem', color: '#e53e3e', marginTop: 'var(--space-2)' }}
              >
                Please accept the monitoring notice above before checking your device.
              </p>
            )}

            {/* Support guidance */}
            {(canTryAgain || isTerminal) && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-candidate-text-2)', marginTop: 'var(--space-4)' }}>
                If you cannot resolve this issue,{' '}
                <a href="mailto:support@example.com" style={{ color: 'var(--color-candidate-accent)' }}>
                  contact support
                </a>{' '}
                before the assessment window closes.
              </p>
            )}
          </section>

          {/* Continue button — blocked unless ready */}
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleContinue}
            disabled={!ready}
            aria-disabled={!ready}
            id="btn-continue-to-assessment"
            style={{ width: '100%', justifyContent: 'center', padding: 'var(--space-4)' }}
          >
            {ready ? 'Continue to assessment →' : 'Continue (device not ready)'}
          </button>

          {!ready && (
            <p
              role="note"
              style={{
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: '#718096',
                marginTop: 'var(--space-3)',
              }}
            >
              You must have a ready device to enter the assessment.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
