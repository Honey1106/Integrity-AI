/**
 * Deterministic fixture data for the IntegrityAI MVP demo.
 * All signals are simulated: true and explicitly labelled.
 * IDs are stable so tests and UI can reference them predictably.
 */

import type {
  Assessment,
  Candidate,
  Session,
  Signal,
  Investigation,
  ReviewDecision,
  AuditEntry,
} from '@/domain/types'

export const DEMO_ASSESSMENTS: Assessment[] = [
  {
    id: 'assessment-001',
    title: 'Software Engineering Assessment — Autumn 2026',
    status: 'active',
    scheduledAt: '2026-10-20T09:00:00Z',
    durationMinutes: 90,
  },
  {
    id: 'assessment-002',
    title: 'Data Structures Midterm — Batch B',
    status: 'completed',
    scheduledAt: '2026-10-15T14:00:00Z',
    durationMinutes: 60,
  },
]

export const DEMO_CANDIDATES: Candidate[] = [
  { id: 'candidate-001', displayName: 'Alex R.', assessmentId: 'assessment-001' },
  { id: 'candidate-002', displayName: 'Sam K.', assessmentId: 'assessment-001' },
  { id: 'candidate-003', displayName: 'Jordan P.', assessmentId: 'assessment-002' },
]

export const DEMO_SESSIONS: Session[] = [
  {
    id: 'session-001',
    assessmentId: 'assessment-001',
    candidateId: 'candidate-001',
    status: 'flagged',
    startedAt: '2026-10-20T09:05:00Z',
    readiness: 'ready',
  },
  {
    id: 'session-002',
    assessmentId: 'assessment-001',
    candidateId: 'candidate-002',
    status: 'active',
    startedAt: '2026-10-20T09:07:00Z',
    readiness: 'ready',
  },
  {
    id: 'session-003',
    assessmentId: 'assessment-002',
    candidateId: 'candidate-003',
    status: 'cleared',
    startedAt: '2026-10-15T14:10:00Z',
    readiness: 'ready',
  },
]

export const DEMO_SIGNALS: Signal[] = [
  {
    id: 'signal-001',
    sessionId: 'session-001',
    source: 'browser',
    origin: 'system',
    category: 'focus',
    severity: 'medium',
    occurredAt: '2026-10-20T09:18:30Z',
    recordedAt: '2026-10-20T09:18:31Z',
    sequence: 1,
    explanation:
      'The browser document lost focus. This observation was generated automatically by the demo environment.',
    limitations:
      'Browser focus events occur on any Alt+Tab, notification, or secondary monitor interaction. This observation does not indicate misconduct.',
    simulated: true,
    requiresHumanReview: true,
  },
  {
    id: 'signal-002',
    sessionId: 'session-001',
    source: 'tab',
    origin: 'system',
    category: 'navigation',
    severity: 'high',
    occurredAt: '2026-10-20T09:22:10Z',
    recordedAt: '2026-10-20T09:22:11Z',
    sequence: 2,
    explanation:
      'A new browser tab was opened during the session window. This observation was generated automatically by the demo environment.',
    limitations:
      'Tab events cannot distinguish between accidental navigation, browser extensions, or intentional resource access. Human review is required.',
    simulated: true,
    requiresHumanReview: true,
  },
  {
    id: 'signal-003',
    sessionId: 'session-001',
    source: 'browser',
    origin: 'system',
    category: 'focus',
    severity: 'low',
    occurredAt: '2026-10-20T09:35:00Z',
    recordedAt: '2026-10-20T09:35:01Z',
    sequence: 3,
    explanation:
      'A brief focus loss (under 2 seconds) was observed. This observation was generated automatically by the demo environment.',
    limitations:
      'Short focus losses are commonly caused by OS notifications, screen savers, and assistive technology. No integrity inference is warranted.',
    simulated: true,
    requiresHumanReview: false,
  },
]

export const DEMO_INVESTIGATIONS: Investigation[] = [
  {
    id: 'investigation-001',
    sessionId: 'session-001',
    status: 'open',
    signalIds: ['signal-001', 'signal-002', 'signal-003'],
    assignedReviewerId: null,
    version: 1,
  },
]

export const DEMO_DECISIONS: ReviewDecision[] = []

export const DEMO_AUDIT: AuditEntry[] = [
  {
    id: 'audit-001',
    occurredAt: '2026-10-20T09:18:35Z',
    actorType: 'system',
    actorId: 'system',
    actorLabel: 'System',
    actorRole: 'system',
    action: 'SIGNAL_RECORDED',
    targetType: 'Signal',
    targetId: 'signal-001',
    correlationId: 'session-001',
    summary: '[SIMULATED] Browser focus-loss signal recorded for session-001.',
    before: null,
    after: { signalId: 'signal-001', severity: 'medium' },
    schemaVersion: 1,
  },
  {
    id: 'audit-002',
    occurredAt: '2026-10-20T09:22:15Z',
    actorType: 'system',
    actorId: 'system',
    actorLabel: 'System',
    actorRole: 'system',
    action: 'SIGNAL_RECORDED',
    targetType: 'Signal',
    targetId: 'signal-002',
    correlationId: 'session-001',
    summary: '[SIMULATED] Tab-open navigation signal recorded for session-001.',
    before: null,
    after: { signalId: 'signal-002', severity: 'high' },
    schemaVersion: 1,
  },
]
