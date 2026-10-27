import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { DeviceReadiness } from '@/domain/types'
import { isReadyToStart, canRetry, isTerminalReadinessFailure } from '@/domain/transitions'

const READINESS_MESSAGES: Record<DeviceReadiness, { label: string; desc: string; badge: string }> = {
  unrequested: {
    label: 'Hardware Check Pending',
    desc: 'Camera and microphone checks have not yet been requested.',
    badge: 'neutral',
  },
  requesting: {
    label: 'Requesting Device Access…',
    desc: 'Please accept the browser permission prompt to allow camera and microphone detection.',
    badge: 'medium',
  },
  ready: {
    label: 'Device Verification Passed',
    desc: 'Local camera and microphone detected and responding.',
    badge: 'low',
  },
  denied: {
    label: 'Permission Denied',
    desc: 'Your browser blocked camera or microphone access. Please allow permissions in your browser URL bar site settings.',
    badge: 'high',
  },
  'missing-device': {
    label: 'No Devices Found',
    desc: 'No camera or microphone hardware was detected on your system. Please connect hardware and retry.',
    badge: 'high',
  },
  busy: {
    label: 'Device Currently Busy',
    desc: 'Your camera or microphone is currently in use by another application (e.g. Zoom, Teams). Please close them and retry.',
    badge: 'medium',
  },
  unsupported: {
    label: 'Browser Media Unsupported',
    desc: 'Your current browser does not support the WebRTC MediaDevices API. Please use Google Chrome, Edge, or Firefox.',
    badge: 'high',
  },
  revoked: {
    label: 'Permission Revoked',
    desc: 'Hardware access was revoked during the check. Please re-enable permissions to proceed.',
    badge: 'high',
  },
  error: {
    label: 'Hardware Detection Error',
    desc: 'An unexpected error occurred while querying local media devices. Please retry.',
    badge: 'high',
  },
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

  function handleContinue() {
    if (!ready || !consentGiven) return
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
    }
    navigate('/demo/candidate/session')
  }

  const currentMsg = READINESS_MESSAGES[readiness]

  return (
    <div className="candidate-shell">
      {/* Calm Candidate Top Header */}
      <header className="candidate-header">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '18px' }}>🛡</span>
          <span className="font-semibold text-small" style={{ color: 'var(--color-candidate-text)' }}>
            Institutional Assessment Gateway
          </span>
        </div>

        <Link
          to="/app"
          className="text-xs"
          style={{ color: 'var(--color-candidate-accent)', textDecoration: 'none' }}
        >
          Return to Operations Dashboard
        </Link>
      </header>

      {/* Main Candidate Card */}
      <main className="candidate-container">
        <div className="candidate-card">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h1 style={{ fontSize: '1.4rem', color: 'var(--color-candidate-text)', marginBottom: 'var(--space-2)' }}>
              Candidate Verification &amp; System Preflight
            </h1>
            <p style={{ color: 'var(--color-candidate-text-2)', fontSize: '0.9rem' }}>
              Software Engineering Assessment — Autumn 2026
            </p>
          </div>

          {/* Institutional Transparency & Integrity Notice */}
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: '0.95rem', color: 'var(--color-candidate-text)', marginBottom: 'var(--space-2)' }}>
              1. Assessment Integrity Guidelines &amp; Consent
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
                <strong>Supervised Environment:</strong> During this assessment session, browser window focus and tab navigation telemetry are logged for human review.
              </p>
              <p style={{ marginBottom: 'var(--space-2)' }}>
                <strong>No Audio/Video Recording:</strong> Raw webcam or audio streams are <em>never recorded, streamed to external servers, or stored</em>. The preflight check confirms local hardware availability only.
              </p>
              <p>
                <strong>Human Accountability:</strong> All decisions are made by designated university reviewers, not automated scoring algorithms.
              </p>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-3)',
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
                I understand the testing instructions and consent to session telemetry logging.
              </span>
            </label>
          </section>

          {/* Hardware & Browser Check */}
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: '0.95rem', color: 'var(--color-candidate-text)', marginBottom: 'var(--space-2)' }}>
              2. Camera &amp; Microphone Check
            </h2>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--color-candidate-border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-4)',
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                <span className="font-semibold text-small" style={{ color: 'var(--color-candidate-text)' }}>
                  {currentMsg.label}
                </span>
                <span className={`badge badge--${currentMsg.badge}`}>{readiness}</span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--color-candidate-text-2)', marginBottom: 'var(--space-4)' }}>
                {currentMsg.desc}
              </p>

              {/* Local Video Preview (when stream active) */}
              {stream && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div className="text-xs font-semibold" style={{ color: 'var(--color-candidate-text-2)', marginBottom: 'var(--space-1)' }}>
                    Local Hardware Preview (In-Browser Only):
                  </div>
                  <video
                    autoPlay
                    muted
                    playsInline
                    ref={(videoEl) => {
                      if (videoEl && videoEl.srcObject !== stream) {
                        videoEl.srcObject = stream
                      }
                    }}
                    style={{
                      width: '100%',
                      maxHeight: '220px',
                      background: '#0f172a',
                      borderRadius: 'var(--radius)',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-2">
                {!ready && (
                  <button
                    type="button"
                    onClick={handleRequestPermissions}
                    className="btn btn--primary btn--sm"
                    disabled={isTerminal}
                  >
                    {readiness === 'unrequested' ? 'Run Hardware Check' : 'Retry Hardware Check'}
                  </button>
                )}

                {canTryAgain && (
                  <button
                    type="button"
                    onClick={handleRequestPermissions}
                    className="btn btn--secondary btn--sm"
                  >
                    Troubleshoot &amp; Retry
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Gated Entry Action */}
          <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-candidate-border)' }}>
            {!ready && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.8125rem',
                  marginBottom: 'var(--space-4)',
                }}
              >
                ⚠️ Assessment entry is locked until the hardware check passes and consent is confirmed.
              </div>
            )}

            <button
              type="button"
              onClick={handleContinue}
              className="btn btn--primary"
              style={{ width: '100%', padding: '10px' }}
              disabled={!ready || !consentGiven}
            >
              Continue to Assessment Shell →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
