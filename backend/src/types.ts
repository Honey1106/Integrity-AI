export type AssessmentStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'
export type SessionStatus = 'waiting' | 'active' | 'submitted' | 'flagged' | 'cleared'
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

export type InvestigationStatus = 'open' | 'under_review' | 'reviewed' | 'outcome_recorded'
export type Disposition = 'clear' | 'needs_follow_up' | 'escalated'
export type InstitutionalOutcomeValue =
  | 'no_action'
  | 'caution_issued'
  | 'referral_required'
  | 'further_review'

export type ActorRole = 'system' | 'operator' | 'reviewer' | 'administrator'

export interface Assessment {
  id: string
  title: string
  status: AssessmentStatus
  scheduledAt: string
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

export interface DashboardStats {
  totalAssessments: number
  totalSessions: number
  sessionsRequiringReview: number
  activeSessions: number
  clearedSessions: number
  submittedSessions: number
  openInvestigations: number
  pendingReviewerDecisions: number
  recordedOutcomes: number
  signalsAwaitingTriage: number
}
