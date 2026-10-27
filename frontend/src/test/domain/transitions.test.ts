import { describe, it, expect } from 'vitest'
import {
  isReadyToStart,
  isTerminalReadinessFailure,
  canRetry,
  isValidInvestigationTransition,
  canSubmitReviewDecision,
  canSubmitOutcome,
  canEnterSession,
} from '@/domain/transitions'
import type { DeviceReadiness, InvestigationStatus } from '@/domain/types'

describe('isReadyToStart', () => {
  it('returns true only when readiness is "ready"', () => {
    expect(isReadyToStart('ready')).toBe(true)
  })

  const nonReadyStates: DeviceReadiness[] = [
    'unrequested',
    'requesting',
    'denied',
    'missing-device',
    'busy',
    'unsupported',
    'revoked',
    'error',
  ]
  it.each(nonReadyStates)('returns false for "%s"', (state) => {
    expect(isReadyToStart(state)).toBe(false)
  })
})

describe('isTerminalReadinessFailure', () => {
  it('returns true only for "unsupported"', () => {
    expect(isTerminalReadinessFailure('unsupported')).toBe(true)
    expect(isTerminalReadinessFailure('denied')).toBe(false)
    expect(isTerminalReadinessFailure('error')).toBe(false)
  })
})

describe('canRetry', () => {
  const retryable: DeviceReadiness[] = ['denied', 'missing-device', 'busy', 'revoked', 'error']
  it.each(retryable)('allows retry for "%s"', (state) => {
    expect(canRetry(state)).toBe(true)
  })

  const nonRetryable: DeviceReadiness[] = ['unrequested', 'requesting', 'ready', 'unsupported']
  it.each(nonRetryable)('does not allow retry for "%s"', (state) => {
    expect(canRetry(state)).toBe(false)
  })
})

describe('isValidInvestigationTransition', () => {
  const validTransitions: [InvestigationStatus, InvestigationStatus][] = [
    ['open', 'under_review'],
    ['under_review', 'reviewed'],
    ['reviewed', 'outcome_recorded'],
  ]
  it.each(validTransitions)('accepts valid forward transition %s -> %s', (from, to) => {
    expect(isValidInvestigationTransition(from, to)).toBe(true)
  })

  const invalidTransitions: [InvestigationStatus, InvestigationStatus][] = [
    ['open', 'reviewed'],          // skip
    ['open', 'outcome_recorded'],  // skip 2
    ['reviewed', 'under_review'],  // backwards
    ['outcome_recorded', 'reviewed'], // backwards
  ]
  it.each(invalidTransitions)('rejects invalid transition %s -> %s', (from, to) => {
    expect(isValidInvestigationTransition(from, to)).toBe(false)
  })
})

describe('canSubmitReviewDecision', () => {
  it('allows decision when open or under_review', () => {
    expect(canSubmitReviewDecision('open')).toBe(true)
    expect(canSubmitReviewDecision('under_review')).toBe(true)
  })
  it('blocks decision when reviewed or outcome_recorded', () => {
    expect(canSubmitReviewDecision('reviewed')).toBe(false)
    expect(canSubmitReviewDecision('outcome_recorded')).toBe(false)
  })
})

describe('canSubmitOutcome', () => {
  it('only allows outcome when status is "reviewed"', () => {
    expect(canSubmitOutcome('reviewed')).toBe(true)
    expect(canSubmitOutcome('open')).toBe(false)
    expect(canSubmitOutcome('under_review')).toBe(false)
    expect(canSubmitOutcome('outcome_recorded')).toBe(false)
  })
})

describe('canEnterSession', () => {
  it('requires active session status AND ready device', () => {
    expect(canEnterSession('active', 'ready')).toBe(true)
  })
  it('blocks entry when device not ready', () => {
    expect(canEnterSession('active', 'denied')).toBe(false)
    expect(canEnterSession('active', 'unrequested')).toBe(false)
  })
  it('blocks entry when session not active', () => {
    expect(canEnterSession('waiting', 'ready')).toBe(false)
    expect(canEnterSession('submitted', 'ready')).toBe(false)
  })
})
