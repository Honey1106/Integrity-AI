import { useState } from 'react'
import { Link } from 'react-router-dom'

export function HomePage() {
  const [activeTab, setActiveTab] = useState<'signals' | 'decision' | 'outcome'>('signals')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* 1. Public Navigation Bar */}
      <nav className="public-nav" aria-label="Main public navigation">
        <Link to="/" className="app-brand" aria-label="IntegrityAI home">
          <span className="app-brand-icon" aria-hidden="true">🛡</span>
          <span>IntegrityAI</span>
        </Link>

        <ul className="public-nav-links">
          <li><a href="#platform" className="public-nav-link">Platform</a></li>
          <li><a href="#workflow" className="public-nav-link">How It Works</a></li>
          <li><a href="#human-review" className="public-nav-link">Review Philosophy</a></li>
          <li><a href="#privacy" className="public-nav-link">Privacy &amp; Ethics</a></li>
          <li><a href="#faq" className="public-nav-link">FAQ</a></li>
        </ul>

        <div className="flex items-center gap-3">
          <Link to="/candidate" className="btn btn--secondary btn--sm">
            Candidate Portal ↗
          </Link>
          <Link to="/app" className="btn btn--primary btn--sm">
            Open Reviewer Workspace →
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="public-hero" aria-labelledby="hero-title">
        <div className="public-hero-badge">
          <span>INSTITUTIONAL INTEGRITY PLATFORM</span>
          <span style={{ color: 'var(--color-text-3)' }}>·</span>
          <span>HUMAN-IN-THE-LOOP</span>
        </div>

        <h1 id="hero-title" className="public-hero-title">
          Accountable Assessment Integrity. <span>Decided by Humans.</span>
        </h1>

        <p className="public-hero-desc">
          IntegrityAI transforms raw telemetry signals into verifiable, auditable observation timelines.
          We empower authorized reviewers to examine context, document reasoned determinations, and maintain an immutable decision history—without automated accusations or black-box algorithms.
        </p>

        <div className="public-hero-ctas">
          <Link to="/app" className="btn btn--primary" style={{ padding: '10px 22px', fontSize: '0.95rem' }}>
            Open Reviewer Workspace →
          </Link>
          <Link to="/candidate" className="btn btn--secondary" style={{ padding: '10px 22px', fontSize: '0.95rem' }}>
            Candidate Preflight Portal
          </Link>
        </div>

        {/* Real Product UI Composition Preview */}
        <div className="hero-product-frame" aria-label="Investigation Workspace Preview">
          <div className="hero-product-header">
            <div className="window-dots">
              <span className="window-dot" />
              <span className="window-dot" />
              <span className="window-dot" />
            </div>
            <div className="text-mono text-xs text-muted">
              IntegrityAI Investigation Workspace · Case #investigation-001
            </div>
            <div className="flex gap-2">
              <span className="badge badge--high">Flagged for Review</span>
              <span className="badge badge--neutral">v1</span>
            </div>
          </div>

          <div style={{ padding: 'var(--space-6)', background: 'var(--color-surface)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>Software Engineering Assessment — Autumn 2026</h3>
                <span className="text-muted text-xs">
                  Candidate: <strong>Alex Rivera (ST-8921)</strong> · Session: <code>session-001</code> · Telemetry Sequence: 3 events
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`btn btn--sm ${activeTab === 'signals' ? 'btn--primary' : 'btn--secondary'}`}
                  onClick={() => setActiveTab('signals')}
                >
                  Evidence Timeline
                </button>
                <button
                  type="button"
                  className={`btn btn--sm ${activeTab === 'decision' ? 'btn--primary' : 'btn--secondary'}`}
                  onClick={() => setActiveTab('decision')}
                >
                  Reviewer Decision Form
                </button>
                <button
                  type="button"
                  className={`btn btn--sm ${activeTab === 'outcome' ? 'btn--primary' : 'btn--secondary'}`}
                  onClick={() => setActiveTab('outcome')}
                >
                  Institutional Outcome
                </button>
              </div>
            </div>

            {activeTab === 'signals' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                <div className="card card--compact" style={{ background: 'var(--color-surface-2)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                    <span className="badge badge--medium">Focus Loss</span>
                    <span className="text-mono text-xs text-subtle">09:18:30 AM</span>
                  </div>
                  <p className="text-small" style={{ marginBottom: '6px' }}>Assessment lost active window focus for 14 seconds.</p>
                  <div style={{ background: 'var(--color-surface-3)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.72rem', color: 'var(--color-text-2)' }}>
                    <strong>Limitation:</strong> Window switching or OS notification can trigger focus loss without cheating.
                  </div>
                </div>

                <div className="card card--compact" style={{ background: 'var(--color-surface-2)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                    <span className="badge badge--high">Tab Navigation</span>
                    <span className="text-mono text-xs text-subtle">09:22:10 AM</span>
                  </div>
                  <p className="text-small" style={{ marginBottom: '6px' }}>Secondary browser tab opened during session.</p>
                  <div style={{ background: 'var(--color-surface-3)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.72rem', color: 'var(--color-text-2)' }}>
                    <strong>Limitation:</strong> Extension popup or accidental shortcut requires human review.
                  </div>
                </div>

                <div className="card card--compact" style={{ background: 'var(--color-surface-2)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                    <span className="badge badge--low">Transient Focus</span>
                    <span className="text-mono text-xs text-subtle">09:35:00 AM</span>
                  </div>
                  <p className="text-small" style={{ marginBottom: '6px' }}>Sub-second focus flicker (&lt;1.5s).</p>
                  <div style={{ background: 'var(--color-surface-3)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.72rem', color: 'var(--color-text-2)' }}>
                    <strong>Limitation:</strong> OS display refresh. No misconduct inference warranted.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'decision' && (
              <div className="card card--compact" style={{ background: 'var(--color-surface-2)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-3)' }}>
                  <span className="font-semibold text-small">Reviewer Disposition Workspace</span>
                  <span className="badge badge--neutral">Mandatory Rationale Enforced</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <span className="badge badge--low">Clear</span>
                  <span className="badge badge--medium" style={{ border: '1px solid var(--color-accent)' }}>Needs Follow-up (Selected)</span>
                  <span className="badge badge--high">Escalated</span>
                </div>
                <div style={{ background: 'var(--color-surface-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius)', fontSize: '0.8125rem', marginBottom: 'var(--space-3)' }}>
                  <strong>Documented Rationale:</strong> Telemetry indicates secondary tab opened at 09:22 AM. Follow-up interview required to ascertain if candidate consulted authorized offline notes.
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-subtle">Committed by Dr. Sarah Chen · Audit Event #audit-004</span>
                  <Link to="/app/investigations/investigation-001" className="btn btn--primary btn--sm">
                    Open in Live Workspace →
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'outcome' && (
              <div className="card card--compact" style={{ background: 'var(--color-surface-2)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-3)' }}>
                  <span className="font-semibold text-small">Administrator Institutional Outcome</span>
                  <span className="badge badge--neutral">Administrator Authority Only</span>
                </div>
                <p className="text-small text-muted" style={{ marginBottom: 'var(--space-3)' }}>
                  Separate institutional determination recorded only after the reviewer evaluation is submitted.
                </p>
                <div style={{ background: 'var(--color-surface-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius)', fontSize: '0.8125rem' }}>
                  <strong>Action:</strong> Committee Referral · <strong>Administrator Rationale:</strong> Forwarded to Faculty Integrity Hearing per Academic Statute 4.2.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Platform Overview Bento Grid */}
      <section id="platform" className="bento-section">
        <div className="bento-header">
          <div className="public-hero-badge">PLATFORM CAPABILITIES</div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: 'var(--space-3)', color: '#fff' }}>
            Built for Institutional Scrutiny
          </h2>
          <p className="text-muted" style={{ fontSize: '1.05rem' }}>
            Every component is engineered to provide verifiable context, defensible reviewer audits, and respectful candidate privacy.
          </p>
        </div>

        <div className="bento-grid">
          {/* Card 1: Chronological Evidence Timelines */}
          <div className="bento-card bento-cell-8">
            <div className="bento-card__icon">⏱</div>
            <h3 className="bento-card__title">Chronological Evidence Timelines</h3>
            <p className="bento-card__desc">
              No black-box risk scores. Every telemetry signal is mapped on a chronological timeline with sequence numbers, source origins, and documented technical limitations.
            </p>
            <div style={{ background: 'var(--color-surface-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              Seq #1 (09:18:30) Focus Loss [14s] → Seq #2 (09:22:10) Tab Open → Seq #3 (09:35:00) Transient Deviation
            </div>
          </div>

          {/* Card 2: Two-Tier Governance */}
          <div className="bento-card bento-cell-4">
            <div className="bento-card__icon">⚖️</div>
            <h3 className="bento-card__title">Two-Tier Governance</h3>
            <p className="bento-card__desc">
              Reviewer dispositions (Clear, Follow-up, Escalated) are structurally separated from Administrator Institutional Outcomes.
            </p>
            <span className="badge badge--neutral">Separation of Concerns</span>
          </div>

          {/* Card 3: Append-Only Audit Trail */}
          <div className="bento-card bento-cell-4">
            <div className="bento-card__icon">📜</div>
            <h3 className="bento-card__title">Append-Only Audit Trail</h3>
            <p className="bento-card__desc">
              Every decision, rationale, revision, and administrative action writes an immutable audit record with correlation IDs and before/after diffs.
            </p>
            <Link to="/app/audit" className="text-xs font-semibold">Inspect Audit Log →</Link>
          </div>

          {/* Card 4: Signal Triage Queue */}
          <div className="bento-card bento-cell-4">
            <div className="bento-card__icon">📡</div>
            <h3 className="bento-card__title">Signal Triage Queue</h3>
            <p className="bento-card__desc">
              Centralized triage for focus shifts, network socket hops, and audio thresholds. Filters out noise while highlighting telemetry that warrants human review.
            </p>
            <Link to="/app/signals" className="text-xs font-semibold">Open Signal Queue →</Link>
          </div>

          {/* Card 5: Transparent Preflight */}
          <div className="bento-card bento-cell-4">
            <div className="bento-card__icon">🛡</div>
            <h3 className="bento-card__title">Calm Candidate Preflight</h3>
            <p className="bento-card__desc">
              Preflight checks hardware readiness in-browser without recording or storing raw video. Clear troubleshooting guidance when hardware is busy or denied.
            </p>
            <Link to="/candidate" className="text-xs font-semibold">Candidate Portal →</Link>
          </div>
        </div>
      </section>

      {/* 4. How It Works (Step-by-Step Flow) */}
      <section id="workflow" className="bento-section" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
        <div className="bento-header">
          <div className="public-hero-badge">OPERATIONAL WORKFLOW</div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: 'var(--space-3)', color: '#fff' }}>
            From Telemetry to Defensible Resolution
          </h2>
          <p className="text-muted">A clear, accountable five-stage progression.</p>
        </div>

        <div className="workflow-track">
          <div className="workflow-step-card">
            <div className="workflow-step-num">STAGE 01</div>
            <h4 style={{ color: '#fff', marginBottom: '6px' }}>Candidate Consent &amp; Preflight</h4>
            <p className="text-small text-muted">
              Candidate reads integrity policies and verifies camera/microphone presence. No raw video is streamed or saved.
            </p>
          </div>

          <div className="workflow-step-card">
            <div className="workflow-step-num">STAGE 02</div>
            <h4 style={{ color: '#fff', marginBottom: '6px' }}>Observation Logging</h4>
            <p className="text-small text-muted">
              Browser telemetry logs contextual observations (window switching, tab events) with explicit technical caveats.
            </p>
          </div>

          <div className="workflow-step-card">
            <div className="workflow-step-num">STAGE 03</div>
            <h4 style={{ color: '#fff', marginBottom: '6px' }}>Reviewer Triage</h4>
            <p className="text-small text-muted">
              Qualified reviewers inspect chronological timeline, evaluate telemetry context, and correlate events.
            </p>
          </div>

          <div className="workflow-step-card">
            <div className="workflow-step-num">STAGE 04</div>
            <h4 style={{ color: '#fff', marginBottom: '6px' }}>Reasoned Decision</h4>
            <p className="text-small text-muted">
              Reviewer commits a disposition with mandatory written reasoning. The action atomically creates an audit event.
            </p>
          </div>

          <div className="workflow-step-card">
            <div className="workflow-step-num">STAGE 05</div>
            <h4 style={{ color: '#fff', marginBottom: '6px' }}>Institutional Outcome</h4>
            <p className="text-small text-muted">
              Authorized administrators record the final official determination. Version control prevents stale-write conflicts.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Philosophy: Why Contextual Human Review Matters */}
      <section id="human-review" className="bento-section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)', alignItems: 'center' }}>
          <div>
            <div className="public-hero-badge">PHILOSOPHY</div>
            <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', color: '#fff' }}>
              Why Black-Box "Cheating Detectors" Fail
            </h2>
            <p className="text-muted" style={{ lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>
              Commercial AI proctoring services claim algorithms can detect dishonesty through facial gaze tracking, head tilt, and ambient sound. In practice, these algorithms create severe false positive rates for neurodivergent candidates, individuals living with family members, and students using assistive technology.
            </p>
            <p className="text-muted" style={{ lineHeight: 1.7 }}>
              <strong>IntegrityAI rejects the concept of automated cheating scores.</strong> We treat browser telemetry as raw factual observations that require informed human context, equitable evaluation, and documented justification before any action is taken.
            </p>
          </div>

          <div className="card" style={{ background: 'var(--color-surface)', padding: 'var(--space-6)' }}>
            <h4 style={{ color: '#fff', marginBottom: 'var(--space-4)' }}>Comparison: Automated vs. Accountable</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.85rem' }}>
              <div style={{ padding: '8px 12px', background: 'var(--color-high-bg)', border: '1px solid var(--color-high-border)', borderRadius: 'var(--radius)', color: 'var(--color-high)' }}>
                ✕ <strong>Black-Box Proctoring:</strong> Generates automated "risk probability" score; triggers punitive locks without human review.
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--color-low-bg)', border: '1px solid var(--color-low-border)', borderRadius: 'var(--radius)', color: 'var(--color-low)' }}>
                ✓ <strong>IntegrityAI:</strong> Presents chronological observation timeline; requires reviewer written rationale; records immutable audit history.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Security, Privacy & Data Minimization */}
      <section id="privacy" className="bento-section" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="bento-header">
          <div className="public-hero-badge">ETHICS &amp; COMPLIANCE</div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: 'var(--space-3)', color: '#fff' }}>
            Data Minimization by Design
          </h2>
          <p className="text-muted">Strict privacy boundaries protecting students and institutions.</p>
        </div>

        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="card">
            <h4 style={{ color: '#fff', marginBottom: 'var(--space-2)' }}>No Media Recording</h4>
            <p className="text-small text-muted">Webcam and microphone access are used exclusively for local browser hardware presence checks. Zero raw video or audio is ever recorded, transmitted, or stored.</p>
          </div>
          <div className="card">
            <h4 style={{ color: '#fff', marginBottom: 'var(--space-2)' }}>No Native Lockdown Agents</h4>
            <p className="text-small text-muted">IntegrityAI runs as a clean, standard web application. We do not install kernel drivers, scan background system processes, or inspect personal local storage.</p>
          </div>
          <div className="card">
            <h4 style={{ color: '#fff', marginBottom: 'var(--space-2)' }}>Append-Only Auditing</h4>
            <p className="text-small text-muted">All review interactions are logged with timestamps, actor IDs, and before/after states. Neither reviewers nor administrators can erase historical audit events.</p>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions */}
      <section id="faq" className="bento-section">
        <div className="bento-header">
          <div className="public-hero-badge">FAQS</div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: 'var(--space-3)', color: '#fff' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div className="faq-grid">
          <div className="faq-card">
            <h4>Does IntegrityAI determine if a candidate cheated?</h4>
            <p>No. IntegrityAI specifically does not make misconduct determinations. It records technical observations (e.g. window focus loss, tab navigation) and provides an evidence workspace for authorized human reviewers to examine the facts.</p>
          </div>
          <div className="faq-card">
            <h4>Can a reviewer issue a punitive institutional outcome?</h4>
            <p>No. Reviewer dispositions (Clear, Needs Follow-Up, Escalated) are recommendation findings. Institutional outcomes (e.g. caution issued, board referral) can only be recorded by an administrator after a completed review.</p>
          </div>
          <div className="faq-card">
            <h4>What happens if two reviewers update a case at once?</h4>
            <p>IntegrityAI enforces optimistic version concurrency. If an update is submitted with an outdated version number, the backend returns a 409 Conflict, preserving data integrity and prompting a refresh.</p>
          </div>
          <div className="faq-card">
            <h4>How do candidates access an assessment?</h4>
            <p>Candidates open the Candidate Portal, review the integrity statement, and complete an interactive device preflight check. Access is granted only once hardware checks and consent are satisfied.</p>
          </div>
        </div>
      </section>

      {/* 8. Public Footer */}
      <footer className="public-footer">
        <div className="public-footer-inner">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
              <span className="app-brand-icon" style={{ width: '22px', height: '22px', fontSize: '11px' }}>🛡</span>
              <strong style={{ color: '#fff' }}>IntegrityAI</strong>
            </div>
            <p className="text-muted text-xs">Assessment Integrity Review Platform · Prototype Environment</p>
          </div>

          <div className="flex gap-6 text-small text-muted flex-wrap">
            <Link to="/app">Reviewer Workspace</Link>
            <Link to="/app/sessions">Sessions Directory</Link>
            <Link to="/app/signals">Signal Queue</Link>
            <Link to="/app/audit">Audit History</Link>
            <Link to="/candidate">Candidate Portal</Link>
            <Link to="/privacy">Privacy Statement</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
