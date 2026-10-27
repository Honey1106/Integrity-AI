/**
 * Core domain models for IntegrityAI.
 * All names match the spec contracts in DATA_MODEL_AND_API.md.
 * These are pure TypeScript types — no runtime dependencies.
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export type AssessmentStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'

export type SessionStatus = 'waiting' | 'active' | 'submitted' | 'flagged' | 'cleared'

/** DeviceReadiness reflects the preflight state machine (UI_AND_WORKFLOW_SPEC.md) */
export type DeviceReadiness =
  | 'unrequested'
  | 'requesting'
  | 'ready'
  | 'denied'
  | 'missing-device'
  | 'busy'
  | 'unsupported'
  | 'revoked'
  | 'error'

export type SignalSource = 'browser' | 'tab' | 'network' | 'simulated'
export type SignalOrigin = 'candidate' | 'system' | 'observer'
export type SignalCategory = 'focus' | 'navigation' | 'audio' | 'video' | 'network' | 'device'
export type SignalSeverity = 'low' | 'medium' | 'high'

export type InvestigationStatus =
  | 'open'
  | 'under_review'
  | 'reviewed'
  | 'outcome_recorded'

/** Reviewer disposition — never contains a misconduct verdict. */
export type Disposition = 'clear' | 'needs_follow_up' | 'escalated'

export type InstitutionalOutcomeValue =
  | 'no_action'
  | 'caution_issued'
  | 'referral_required'
  | 'further_review'

export type ActorRole = 'system' | 'operator' | 'reviewer' | 'administrator'

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface Assessment {
  id: string
  title: string
  status: AssessmentStatus
  scheduledAt: string // ISO-8601
  durationMinutes: number
}

export interface Candidate {
  id: string
  displayName: string
  assessmentId: string
}

export interface Session {
  id: string
  assessmentId: string
  candidateId: string
  status: SessionStatus
  startedAt: string
  readiness: DeviceReadiness
}

/**
 * A Signal never contains a misconduct verdict.
 * source/origin establish scope; simulated is always true in the MVP demo.
 */
export interface Signal {
  id: string
  sessionId: string
  source: SignalSource
  origin: SignalOrigin
  category: SignalCategory
  severity: SignalSeverity
  occurredAt: string
  recordedAt: string
  sequence: number
  explanation: string
  limitations: string
  simulated: boolean
  requiresHumanReview: boolean
}

export interface Investigation {
  id: string
  sessionId: string
  status: InvestigationStatus
  signalIds: string[]
  assignedReviewerId: string | null
  version: number
}

/**
 * A ReviewDecision revises by superseding, never overwriting.
 */
export interface ReviewDecision {
  id: string
  investigationId: string
  disposition: Disposition
  reason: string
  notes: string | null
  reviewerId: string
  decidedAt: string
  version: number
  supersedesId: string | null
}

/**
 * Only an administrator role may create an InstitutionalOutcome.
 */
export interface InstitutionalOutcome {
  id: string
  investigationId: string
  outcome: InstitutionalOutcomeValue
  reason: string
  administratorId: string
  decidedAt: string
  version: number
  supersedesId: string | null
}

export interface AuditEntry {
  id: string
  occurredAt: string
  actorType: ActorRole
  actorId: string
  actorLabel: string
  actorRole: ActorRole
  action: string
  targetType: string
  targetId: string
  correlationId: string
  summary: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  schemaVersion: number
}
