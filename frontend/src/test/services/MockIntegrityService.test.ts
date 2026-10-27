import { describe, it, expect, beforeEach } from 'vitest'
import { MockIntegrityService } from '@/services/MockIntegrityService'

describe('MockIntegrityService', () => {
  let svc: MockIntegrityService

  beforeEach(() => {
    svc = new MockIntegrityService()
  })

  describe('listAssessments', () => {
    it('returns paginated assessments', async () => {
      const result = await svc.listAssessments()
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.total).toBe(result.items.length)
    })
  })

  describe('getSessionSignals', () => {
    it('returns signals ordered by sequence', async () => {
      const result = await svc.getSessionSignals('session-001')
      const sequences = result.items.map((s) => s.sequence)
      expect(sequences).toEqual([...sequences].sort((a, b) => a - b))
    })

    it('all returned signals are marked simulated', async () => {
      const result = await svc.getSessionSignals('session-001')
      expect(result.items.every((s) => s.simulated)).toBe(true)
    })

    it('throws for unknown session', async () => {
      await expect(svc.getSession('nonexistent')).rejects.toThrow()
    })
  })

  describe('submitDecision', () => {
    it('accepts a valid decision and returns the decision with matching disposition', async () => {
      const decision = await svc.submitDecision(
        'investigation-001',
        { disposition: 'needs_follow_up', reason: 'Two focus-loss signals require context.' },
        1,
      )
      expect(decision.disposition).toBe('needs_follow_up')
      expect(decision.reason).toBe('Two focus-loss signals require context.')
    })

    it('appends an audit entry after a successful decision', async () => {
      await svc.submitDecision(
        'investigation-001',
        { disposition: 'clear', reason: 'All signals have documented limitations.' },
        1,
      )
      const audit = await svc.getAuditEntries('Investigation', 'investigation-001')
      const decisionAudit = audit.items.find((a) => a.action === 'REVIEW_DECISION_SUBMITTED')
      expect(decisionAudit).toBeDefined()
      expect(decisionAudit!.actorRole).toBe('reviewer')
    })

    it('advances investigation status to "reviewed" after a decision', async () => {
      await svc.submitDecision(
        'investigation-001',
        { disposition: 'escalated', reason: 'Tab navigation combined with focus loss is atypical.' },
        1,
      )
      const inv = await svc.getInvestigation('investigation-001')
      expect(inv.status).toBe('reviewed')
    })

    it('rejects an empty reason', async () => {
      await expect(
        svc.submitDecision('investigation-001', { disposition: 'clear', reason: '   ' }, 1),
      ).rejects.toThrow()
    })

    it('returns 409 on stale version', async () => {
      await expect(
        svc.submitDecision('investigation-001', { disposition: 'clear', reason: 'Fine.' }, 99),
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })
  })

  describe('submitOutcome', () => {
    it('rejects outcome when investigation is not yet reviewed', async () => {
      await expect(
        svc.submitOutcome('investigation-001', { outcome: 'no_action', reason: 'No action needed.' }, 1),
      ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' })
    })

    it('accepts outcome after a review decision has been submitted', async () => {
      // First submit a decision to move to "reviewed"
      await svc.submitDecision(
        'investigation-001',
        { disposition: 'clear', reason: 'Signals have documented limitations.' },
        1,
      )
      const inv = await svc.getInvestigation('investigation-001')
      const outcome = await svc.submitOutcome(
        'investigation-001',
        { outcome: 'no_action', reason: 'Institutional review confirms no action.' },
        inv.version,
      )
      expect(outcome.outcome).toBe('no_action')
    })

    it('appends a separate audit entry for outcome (distinct from review decision)', async () => {
      await svc.submitDecision(
        'investigation-001',
        { disposition: 'clear', reason: 'Clear.' },
        1,
      )
      const inv = await svc.getInvestigation('investigation-001')
      await svc.submitOutcome(
        'investigation-001',
        { outcome: 'no_action', reason: 'Confirmed.' },
        inv.version,
      )
      const audit = await svc.getAuditEntries('Investigation', 'investigation-001')
      const outcomeAudit = audit.items.find((a) => a.action === 'INSTITUTIONAL_OUTCOME_RECORDED')
      expect(outcomeAudit).toBeDefined()
      expect(outcomeAudit!.actorRole).toBe('administrator')
    })

    it('moves investigation to outcome_recorded', async () => {
      await svc.submitDecision('investigation-001', { disposition: 'clear', reason: 'ok' }, 1)
      const inv1 = await svc.getInvestigation('investigation-001')
      await svc.submitOutcome('investigation-001', { outcome: 'no_action', reason: 'ok' }, inv1.version)
      const inv2 = await svc.getInvestigation('investigation-001')
      expect(inv2.status).toBe('outcome_recorded')
    })
  })

  describe('reviewer cannot set outcome directly', () => {
    it('outcome is rejected if investigation is not reviewed status', async () => {
      // Fresh investigation is "open" — outcome must fail
      await expect(
        svc.submitOutcome('investigation-001', { outcome: 'caution_issued', reason: 'Direct.' }, 1),
      ).rejects.toThrow()
    })
  })
})
