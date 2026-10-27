import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DeviceReadiness } from '@/domain/types'
import { isReadyToStart, canRetry, isTerminalReadinessFailure } from '@/domain/transitions'

const READINESS_GUIDE: Record<DeviceReadiness, { label: string; desc: string; badge: string }> = {
  unrequested: {
    label: 'Hardware Check Pending',
    desc: 'Camera and microphone checks have not yet been requested.',
    badge: 'neutral',
  },
  requesting: {
    label: 'Requesting Device Access…',
    desc: 'Please accept the browser permission prompt in your address bar.',
    badge: 'medium',
  },
  ready: {
    label: 'Hardware Verified',
    desc: 'Local camera and microphone verified. Ready for assessment entry.',
    badge: 'low',
  },
  denied: {
    label: 'Permission Denied',
    desc: 'Your browser blocked camera or microphone access. Click the lock icon in your URL address bar, toggle Camera/Microphone to "Allow", and click Retry.',
    badge: 'high',
  },
  'missing-device': {
    label: 'No Devices Found',
    desc: 'No camera or microphone hardware was detected. Please plug in or connect hardware and retry.',
    badge: 'high',
  },
  busy: {
    label: 'Hardware Busy',
    desc: 'Your camera or microphone is currently in use by another application (e.g. Zoom, Google Meet, Teams). Please close those apps and retry.',
    badge: 'medium',
  },
  unsupported: {
    label: 'Browser Unsupported',
    desc: 'Your browser does not support the WebRTC MediaDevices API. Please use a modern version of Chrome, Firefox, Safari, or Edge.',
    badge: 'high',
  },
  revoked: {
    label: 'Permission Revoked',
    desc: 'Hardware access was revoked during verification. Please re-enable access to proceed.',
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
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(true)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const navigate = useNavigate()

  const ready = isReadyToStart(readiness)
  const canTryAgain = canRetry(readiness)
  const isTerminal = isTerminalReadinessFailure(readiness)

  // Ensure stream tracks are properly stopped on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  // Bind video element whenever stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  async function handleRequestPermissions() {
    // Clean up any existing stream first
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      setStream(null)
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setReadiness('unsupported')
      return
    }

    setReadiness('requesting')

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      // Listen for unexpected track stops (device unplugged/revoked)
      mediaStream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setReadiness('revoked')
          setStream(null)
        }
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

  function handleToggleCamera() {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setCameraActive(videoTrack.enabled)
      }
    }
  }

  function handleProceed() {
    if (!ready) return
    // Stop local preview stream before entering exam
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
    }
    navigate('/candidate/session')
  }

  const currentStatus = READINESS_GUIDE[readiness]

  return (
    <div className="candidate-card">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.4rem', color: 'var(--color-candidate-text)', marginBottom: 'var(--space-2)' }}>
          Step 2: System &amp; Device Verification Preflight
        </h1>
        <p style={{ color: 'var(--color-candidate-text-2)', fontSize: '0.9rem' }}>
          This check verifies that your camera and microphone respond correctly. Your media stream is verified locally in your browser and is never uploaded or recorded.
        </p>
      </div>

      {/* Hardware Status Panel */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid var(--color-candidate-border)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-5)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
          <div className="font-semibold text-small" style={{ color: 'var(--color-candidate-text)' }}>
            Hardware Verification Status:
          </div>
          <span className={`badge badge--${currentStatus.badge}`}>{currentStatus.label}</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-candidate-text-2)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
          {currentStatus.desc}
        </p>

        {/* Live Preview Area when stream is active */}
        {stream && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
              <span className="text-xs font-semibold" style={{ color: '#475569' }}>
                Local In-Browser Camera Feed (Private):
              </span>
              <button
                type="button"
                onClick={handleToggleCamera}
                className="btn btn--secondary btn--sm"
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                {cameraActive ? 'Mute Video' : 'Unmute Video'}
              </button>
            </div>

            <div
              style={{
                width: '100%',
                maxHeight: '260px',
                background: '#0f172a',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '240px',
                  objectFit: 'cover',
                  display: cameraActive ? 'block' : 'none',
                }}
              />
              {!cameraActive && (
                <div
                  style={{
                    height: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                  }}
                >
                  Camera feed paused by candidate
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex gap-2">
          {!ready && (
            <button
              type="button"
              onClick={handleRequestPermissions}
              className="btn btn--primary"
              disabled={isTerminal || readiness === 'requesting'}
            >
              {readiness === 'unrequested'
                ? 'Check Camera & Microphone'
                : readiness === 'requesting'
                  ? 'Requesting Hardware Access…'
                  : 'Retry Device Verification'}
            </button>
          )}

          {canTryAgain && (
            <button
              type="button"
              onClick={handleRequestPermissions}
              className="btn btn--secondary"
            >
              Retry Check
            </button>
          )}

          {ready && (
            <div className="flex items-center gap-2 text-small font-semibold" style={{ color: '#10b981' }}>
              <span>✓ All hardware checks successfully passed.</span>
            </div>
          )}
        </div>
      </div>

      {/* Troubleshooting Alert when denied or error */}
      {readiness === 'denied' && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius)',
            fontSize: '0.8125rem',
            marginBottom: 'var(--space-6)',
            lineHeight: 1.6,
          }}
        >
          <div className="font-semibold" style={{ marginBottom: '4px' }}>How to resolve permission denial:</div>
          <ol style={{ paddingLeft: 'var(--space-4)' }}>
            <li>Look for the camera or lock icon in your browser URL bar.</li>
            <li>Click it and set Camera and Microphone to <strong>Allow</strong>.</li>
            <li>Click <strong>Retry Check</strong> above to verify your hardware.</li>
          </ol>
        </div>
      )}

      {/* Gated Entry Control */}
      <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-candidate-border)' }}>
        {!ready && (
          <p className="text-xs" style={{ color: '#64748b', marginBottom: 'var(--space-3)' }}>
            ⚠️ Examination entry remains locked until device verification has successfully passed.
          </p>
        )}

        <button
          type="button"
          onClick={handleProceed}
          className="btn btn--primary"
          style={{ width: '100%', padding: '11px', fontSize: '0.95rem' }}
          disabled={!ready}
        >
          Enter Assessment Shell →
        </button>
      </div>
    </div>
  )
}
