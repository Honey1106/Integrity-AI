/**
 * Pure domain transition functions.
 * No side effects; no imports from React or services.
 * These rules are the canonical source of truth for state validity.
 */

import type {
  DeviceReadiness,
  InvestigationStatus,
  SessionStatus,
  Disposition,
} from './types'

// ---------------------------------------------------------------------------
// Preflight / device readiness
// ---------------------------------------------------------------------------

/** True iff the candidate may proceed to the assessment shell. */
export function isReadyToStart(readiness: DeviceReadiness): boolean {
  return readiness === 'ready'
}

/** True iff the state represents a terminal failure that cannot auto-recover. */
export function isTerminalReadinessFailure(readiness: DeviceReadiness): boolean {
  return readiness === 'unsupported'
}

/** True iff a retry action is meaningful for the current state. */
export function canRetry(readiness: DeviceReadiness): boolean {
  return (
    readiness === 'denied' ||
    readiness === 'missing-device' ||
    readiness === 'busy' ||
    readiness === 'revoked' ||
    readiness === 'error'
  )
}

// ---------------------------------------------------------------------------
// Investigation lifecycle
// ---------------------------------------------------------------------------

const INVESTIGATION_ORDER: Record<InvestigationStatus, number> = {
  open: 0,
  under_review: 1,
  reviewed: 2,
  outcome_recorded: 3,
}

/** Returns true if transitioning from `from` to `to` is a valid forward step. */
export function isValidInvestigationTransition(
  from: InvestigationStatus,
  to: InvestigationStatus,
): boolean {
  return INVESTIGATION_ORDER[to] === INVESTIGATION_ORDER[from] + 1
}

/** True iff a reviewer decision may be submitted for this investigation. */
export function canSubmitReviewDecision(status: InvestigationStatus): boolean {
  return status === 'open' || status === 'under_review'
}

/** True iff an administrator institutional outcome may be submitted. */
export function canSubmitOutcome(status: InvestigationStatus): boolean {
  return status === 'reviewed'
}

// ---------------------------------------------------------------------------
// Session lifecycle
// ---------------------------------------------------------------------------

export function canEnterSession(status: SessionStatus, readiness: DeviceReadiness): boolean {
  return status === 'active' && isReadyToStart(readiness)
}

// ---------------------------------------------------------------------------
// Disposition helpers
// ---------------------------------------------------------------------------

export const DISPOSITION_LABELS: Record<Disposition, string> = {
  clear: 'Clear',
  needs_follow_up: 'Needs follow-up',
  escalated: 'Escalated',
}

export const DISPOSITION_DESCRIPTIONS: Record<Disposition, string> = {
  clear: 'No further action required based on the available evidence.',
  needs_follow_up: 'Additional contextual information is required before a final determination.',
  escalated: 'This case requires escalation to a senior reviewer or institutional process.',
}
