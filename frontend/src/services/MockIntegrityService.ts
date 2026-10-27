/**
 * MockIntegrityService — satisfies the IntegrityService interface using
 * deterministic in-memory fixtures. No network calls. No external dependencies.
 *
 * In a real deployment this would be replaced by HttpIntegrityService.
 * The mock simulates realistic latency and supports mutation for the
 * review/outcome/audit path (decision and outcome append to in-memory state).
 */

import type {
  IntegrityService,
  PaginatedResult,
  DecisionInput,
  OutcomeInput,
} from './IntegrityService'
import type {
  Assessment,
  Session,
  Signal,
  Investigation,
  ReviewDecision,
  InstitutionalOutcome,
  AuditEntry,
} from '@/domain/types'
import {
  DEMO_ASSESSMENTS,
  DEMO_SESSIONS,
  DEMO_SIGNALS,
  DEMO_INVESTIGATIONS,
  DEMO_DECISIONS,
  DEMO_AUDIT,
} from '@/mocks/fixtures'

const SIMULATED_DELAY_MS = 400

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function paginate<T>(items: T[], page = 1, pageSize = 20): PaginatedResult<T> {
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  }
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function isoNow(): string {
  return new Date().toISOString()
}

export class MockIntegrityService implements IntegrityService {
  // Mutable in-memory state — mirrors what the API would persist
  private readonly assessments: Assessment[] = structuredClone(DEMO_ASSESSMENTS)
  private readonly sessions: Session[] = structuredClone(DEMO_SESSIONS)
  private readonly signals: Signal[] = structuredClone(DEMO_SIGNALS)
  private readonly investigations: Investigation[] = structuredClone(DEMO_INVESTIGATIONS)
  private readonly decisions: ReviewDecision[] = structuredClone(DEMO_DECISIONS)
  private readonly outcomes: InstitutionalOutcome[] = []
  private readonly audit: AuditEntry[] = structuredClone(DEMO_AUDIT)

  async listAssessments(page = 1): Promise<PaginatedResult<Assessment>> {
    await delay(SIMULATED_DELAY_MS)
    return paginate(this.assessments, page)
  }

  async getSession(id: string): Promise<Session> {
    await delay(SIMULATED_DELAY_MS)
    const session = this.sessions.find((s) => s.id === id)
    if (!session) throw new Error(`Session not found: ${id}`)
    return structuredClone(session)
  }

  async listSessions(page = 1): Promise<PaginatedResult<Session>> {
    await delay(SIMULATED_DELAY_MS)
    return paginate(this.sessions, page)
  }

  async getSessionSignals(sessionId: string, page = 1): Promise<PaginatedResult<Signal>> {
    await delay(SIMULATED_DELAY_MS)
    const filtered = this.signals
      .filter((s) => s.sessionId === sessionId)
      .sort((a, b) => a.sequence - b.sequence)
    return paginate(filtered, page)
  }

  async getInvestigation(id: string): Promise<Investigation> {
    await delay(SIMULATED_DELAY_MS)
    const inv = this.investigations.find((i) => i.id === id)
    if (!inv) throw new Error(`Investigation not found: ${id}`)
    return structuredClone(inv)
  }

  async getInvestigationDecisions(investigationId: string): Promise<ReviewDecision[]> {
    await delay(SIMULATED_DELAY_MS)
    return structuredClone(this.decisions.filter((d) => d.investigationId === investigationId))
  }

  async submitDecision(
    investigationId: string,
    input: DecisionInput,
    expectedVersion: number,
  ): Promise<ReviewDecision> {
    await delay(SIMULATED_DELAY_MS)

    const inv = this.investigations.find((i) => i.id === investigationId)
    if (!inv) throw new Error(`Investigation not found: ${investigationId}`)
    if (inv.version !== expectedVersion) {
      throw Object.assign(new Error('Conflict: investigation was modified by another action.'), {
        code: 'CONFLICT',
        status: 409,
      })
    }
    if (!input.reason.trim()) {
      throw Object.assign(new Error('Validation error: reason is required.'), {
        code: 'VALIDATION_ERROR',
        status: 422,
      })
    }

    const latestDecision = this.decisions
      .filter((d) => d.investigationId === investigationId)
      .sort((a, b) => b.version - a.version)[0]

    const decision: ReviewDecision = {
      id: newId('decision'),
      investigationId,
      disposition: input.disposition,
      reason: input.reason.trim(),
      notes: input.notes?.trim() || null,
      reviewerId: 'demo-reviewer',
      decidedAt: isoNow(),
      version: (latestDecision?.version ?? 0) + 1,
      supersedesId: latestDecision?.id ?? null,
    }

    this.decisions.push(decision)

    // Advance investigation status
    inv.status = 'reviewed'
    inv.version += 1

    // Append audit entry (mirrors what the API transaction does atomically)
    const auditEntry: AuditEntry = {
      id: newId('audit'),
      occurredAt: decision.decidedAt,
      actorType: 'reviewer',
      actorId: 'demo-reviewer',
      actorLabel: '[DEMO] Reviewer',
      actorRole: 'reviewer',
      action: 'REVIEW_DECISION_SUBMITTED',
      targetType: 'Investigation',
      targetId: investigationId,
      correlationId: investigationId,
      summary: `[SIMULATED] Review decision "${decision.disposition}" submitted for investigation ${investigationId}.`,
      before: { status: 'under_review', version: expectedVersion },
      after: { status: 'reviewed', decisionId: decision.id, disposition: decision.disposition },
      schemaVersion: 1,
    }
    this.audit.push(auditEntry)

    return structuredClone(decision)
  }

  async submitOutcome(
    investigationId: string,
    input: OutcomeInput,
    expectedVersion: number,
  ): Promise<InstitutionalOutcome> {
    await delay(SIMULATED_DELAY_MS)

    const inv = this.investigations.find((i) => i.id === investigationId)
    if (!inv) throw new Error(`Investigation not found: ${investigationId}`)
    if (inv.version !== expectedVersion) {
      throw Object.assign(new Error('Conflict: investigation was modified.'), {
        code: 'CONFLICT',
        status: 409,
      })
    }
    if (inv.status !== 'reviewed') {
      throw Object.assign(
        new Error('Institutional outcome requires investigation status "reviewed".'),
        { code: 'PRECONDITION_FAILED', status: 422 },
      )
    }
    if (!input.reason.trim()) {
      throw Object.assign(new Error('Validation error: reason is required.'), {
        code: 'VALIDATION_ERROR',
        status: 422,
      })
    }

    const latestOutcome = this.outcomes
      .filter((o) => o.investigationId === investigationId)
      .sort((a, b) => b.version - a.version)[0]

    const outcome: InstitutionalOutcome = {
      id: newId('outcome'),
      investigationId,
      outcome: input.outcome,
      reason: input.reason.trim(),
      administratorId: 'demo-administrator',
      decidedAt: isoNow(),
      version: (latestOutcome?.version ?? 0) + 1,
      supersedesId: latestOutcome?.id ?? null,
    }

    this.outcomes.push(outcome)

    inv.status = 'outcome_recorded'
    inv.version += 1

    const auditEntry: AuditEntry = {
      id: newId('audit'),
      occurredAt: outcome.decidedAt,
      actorType: 'administrator',
      actorId: 'demo-administrator',
      actorLabel: '[DEMO] Administrator',
      actorRole: 'administrator',
      action: 'INSTITUTIONAL_OUTCOME_RECORDED',
      targetType: 'Investigation',
      targetId: investigationId,
      correlationId: investigationId,
      summary: `[SIMULATED] Institutional outcome "${outcome.outcome}" recorded by administrator for investigation ${investigationId}.`,
      before: { status: 'reviewed', version: expectedVersion },
      after: { status: 'outcome_recorded', outcomeId: outcome.id, outcome: outcome.outcome },
      schemaVersion: 1,
    }
    this.audit.push(auditEntry)

    return structuredClone(outcome)
  }

  async getAuditEntries(
    targetType: string,
    targetId: string,
    page = 1,
  ): Promise<PaginatedResult<AuditEntry>> {
    await delay(SIMULATED_DELAY_MS)
    const filtered = this.audit
      .filter((a) => a.targetType === targetType && a.targetId === targetId)
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    return paginate(filtered, page)
  }
}
