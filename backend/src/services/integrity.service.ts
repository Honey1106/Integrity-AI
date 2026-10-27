import { getDb, isUsingMemoryFallback, getMemStore, getMongoClient } from '../db.js'
import type {
  Assessment,
  Session,
  Signal,
  Investigation,
  ReviewDecision,
  InstitutionalOutcome,
  AuditEntry,
  DashboardStats,
  Disposition,
  InstitutionalOutcomeValue,
  ActorRole,
} from '../types.js'

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function isoNow(): string {
  return new Date().toISOString()
}

export class IntegrityBackendService {
  async listAssessments(page = 1, pageSize = 20) {
    if (isUsingMemoryFallback() || !getDb()) {
      const items = getMemStore().assessments
      const start = (page - 1) * pageSize
      return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize }
    }
    const db = getDb()!
    const col = db.collection<Assessment>('assessments')
    const total = await col.countDocuments()
    const items = await col.find().skip((page - 1) * pageSize).limit(pageSize).toArray()
    return { items, total, page, pageSize }
  }

  async getSession(id: string): Promise<Session> {
    if (isUsingMemoryFallback() || !getDb()) {
      const session = getMemStore().sessions.find((s) => s.id === id)
      if (!session) throw Object.assign(new Error(`Session not found: ${id}`), { status: 404 })
      return structuredClone(session)
    }
    const db = getDb()!
    const session = await db.collection<Session>('sessions').findOne({ id })
    if (!session) throw Object.assign(new Error(`Session not found: ${id}`), { status: 404 })
    return session
  }

  async listSessions(params?: { status?: string; assessmentId?: string; search?: string; page?: number; pageSize?: number }) {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 20

    if (isUsingMemoryFallback() || !getDb()) {
      let items = [...getMemStore().sessions]
      if (params?.status && params.status !== 'all') {
        items = items.filter((s) => s.status === params.status)
      }
      if (params?.assessmentId && params.assessmentId !== 'all') {
        items = items.filter((s) => s.assessmentId === params.assessmentId)
      }
      if (params?.search) {
        const q = params.search.toLowerCase()
        items = items.filter((s) => s.id.toLowerCase().includes(q) || s.candidateId.toLowerCase().includes(q))
      }
      const start = (page - 1) * pageSize
      return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize }
    }

    const db = getDb()!
    const query: Record<string, unknown> = {}
    if (params?.status && params.status !== 'all') query.status = params.status
    if (params?.assessmentId && params.assessmentId !== 'all') query.assessmentId = params.assessmentId
    if (params?.search) {
      query.$or = [
        { id: { $regex: params.search, $options: 'i' } },
        { candidateId: { $regex: params.search, $options: 'i' } },
      ]
    }

    const col = db.collection<Session>('sessions')
    const total = await col.countDocuments(query)
    const items = await col.find(query).skip((page - 1) * pageSize).limit(pageSize).toArray()
    return { items, total, page, pageSize }
  }

  async getSessionSignals(sessionId: string, page = 1, pageSize = 20) {
    if (isUsingMemoryFallback() || !getDb()) {
      const items = getMemStore().signals
        .filter((s) => s.sessionId === sessionId)
        .sort((a, b) => a.sequence - b.sequence)
      const start = (page - 1) * pageSize
      return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize }
    }
    const db = getDb()!
    const col = db.collection<Signal>('signals')
    const total = await col.countDocuments({ sessionId })
    const items = await col.find({ sessionId }).sort({ sequence: 1 }).skip((page - 1) * pageSize).limit(pageSize).toArray()
    return { items, total, page, pageSize }
  }

  async listSignals(params?: { category?: string; severity?: string; requiresHumanReview?: boolean; sessionId?: string; search?: string; page?: number; pageSize?: number }) {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 20

    if (isUsingMemoryFallback() || !getDb()) {
      let items = [...getMemStore().signals]
      if (params?.category && params.category !== 'all') items = items.filter((s) => s.category === params.category)
      if (params?.severity && params.severity !== 'all') items = items.filter((s) => s.severity === params.severity)
      if (params?.requiresHumanReview !== undefined) items = items.filter((s) => s.requiresHumanReview === params.requiresHumanReview)
      if (params?.sessionId) items = items.filter((s) => s.sessionId === params.sessionId)
      if (params?.search) {
        const q = params.search.toLowerCase()
        items = items.filter((s) => s.explanation.toLowerCase().includes(q) || s.sessionId.toLowerCase().includes(q))
      }
      items.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      const start = (page - 1) * pageSize
      return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize }
    }

    const db = getDb()!
    const query: Record<string, unknown> = {}
    if (params?.category && params.category !== 'all') query.category = params.category
    if (params?.severity && params.severity !== 'all') query.severity = params.severity
    if (params?.requiresHumanReview !== undefined) query.requiresHumanReview = params.requiresHumanReview
    if (params?.sessionId) query.sessionId = params.sessionId
    if (params?.search) {
      query.$or = [
        { explanation: { $regex: params.search, $options: 'i' } },
        { sessionId: { $regex: params.search, $options: 'i' } },
      ]
    }

    const col = db.collection<Signal>('signals')
    const total = await col.countDocuments(query)
    const items = await col.find(query).sort({ occurredAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray()
    return { items, total, page, pageSize }
  }

  async getInvestigation(id: string): Promise<Investigation> {
    if (isUsingMemoryFallback() || !getDb()) {
      const inv = getMemStore().investigations.find((i) => i.id === id)
      if (!inv) throw Object.assign(new Error(`Investigation not found: ${id}`), { status: 404 })
      return structuredClone(inv)
    }
    const db = getDb()!
    const inv = await db.collection<Investigation>('investigations').findOne({ id })
    if (!inv) throw Object.assign(new Error(`Investigation not found: ${id}`), { status: 404 })
    return inv
  }

  async listInvestigations(page = 1, pageSize = 20) {
    if (isUsingMemoryFallback() || !getDb()) {
      const items = getMemStore().investigations
      const start = (page - 1) * pageSize
      return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize }
    }
    const db = getDb()!
    const col = db.collection<Investigation>('investigations')
    const total = await col.countDocuments()
    const items = await col.find().skip((page - 1) * pageSize).limit(pageSize).toArray()
    return { items, total, page, pageSize }
  }

  async getInvestigationBySession(sessionId: string): Promise<Investigation | null> {
    if (isUsingMemoryFallback() || !getDb()) {
      const inv = getMemStore().investigations.find((i) => i.sessionId === sessionId)
      return inv ? structuredClone(inv) : null
    }
    const db = getDb()!
    return await db.collection<Investigation>('investigations').findOne({ sessionId })
  }

  async getInvestigationDecisions(investigationId: string): Promise<ReviewDecision[]> {
    if (isUsingMemoryFallback() || !getDb()) {
      return structuredClone(getMemStore().decisions.filter((d) => d.investigationId === investigationId))
    }
    const db = getDb()!
    return await db.collection<ReviewDecision>('decisions').find({ investigationId }).sort({ version: 1 }).toArray()
  }

  async getInvestigationOutcomes(investigationId: string): Promise<InstitutionalOutcome[]> {
    if (isUsingMemoryFallback() || !getDb()) {
      return structuredClone(getMemStore().outcomes.filter((o) => o.investigationId === investigationId))
    }
    const db = getDb()!
    return await db.collection<InstitutionalOutcome>('outcomes').find({ investigationId }).sort({ version: 1 }).toArray()
  }

  async submitDecision(
    investigationId: string,
    input: { disposition: Disposition; reason: string; notes?: string; expectedVersion: number },
    actor: { actorId?: string; actorLabel?: string; actorRole?: ActorRole } = {},
  ): Promise<ReviewDecision> {
    if (!input.reason?.trim()) {
      throw Object.assign(new Error('Validation error: rationale is mandatory for reviewer decisions.'), { status: 422, code: 'VALIDATION_ERROR' })
    }

    const reviewerId = actor.actorId || 'demo-reviewer'
    const actorLabel = actor.actorLabel || 'Reviewer Dr. Sarah Chen'

    if (isUsingMemoryFallback() || !getDb()) {
      const inv = getMemStore().investigations.find((i) => i.id === investigationId)
      if (!inv) throw Object.assign(new Error(`Investigation not found: ${investigationId}`), { status: 404 })
      if (inv.version !== input.expectedVersion) {
        throw Object.assign(new Error('Conflict: investigation was updated by another reviewer.'), { status: 409, code: 'CONFLICT' })
      }

      const prior = getMemStore().decisions.filter((d) => d.investigationId === investigationId).sort((a, b) => b.version - a.version)[0]
      const decision: ReviewDecision = {
        id: newId('decision'),
        investigationId,
        disposition: input.disposition,
        reason: input.reason.trim(),
        notes: input.notes?.trim() || null,
        reviewerId,
        decidedAt: isoNow(),
        version: (prior?.version ?? 0) + 1,
        supersedesId: prior?.id ?? null,
      }

      getMemStore().decisions.push(decision)
      inv.status = 'reviewed'
      inv.version += 1

      const audit: AuditEntry = {
        id: newId('audit'),
        occurredAt: decision.decidedAt,
        actorType: 'reviewer',
        actorId: reviewerId,
        actorLabel,
        actorRole: 'reviewer',
        action: 'REVIEW_DECISION_SUBMITTED',
        targetType: 'Investigation',
        targetId: investigationId,
        correlationId: investigationId,
        summary: `Review decision "${decision.disposition}" committed for investigation ${investigationId}.`,
        before: { status: 'under_review', version: input.expectedVersion },
        after: { status: 'reviewed', decisionId: decision.id, disposition: decision.disposition },
        schemaVersion: 1,
      }
      getMemStore().audit.push(audit)
      return structuredClone(decision)
    }

    const db = getDb()!
    const client = getMongoClient()!
    const session = client.startSession()

    try {
      let resultDecision: ReviewDecision | null = null

      await session.withTransaction(async () => {
        const inv = await db.collection<Investigation>('investigations').findOne({ id: investigationId }, { session })
        if (!inv) throw Object.assign(new Error(`Investigation not found: ${investigationId}`), { status: 404 })
        if (inv.version !== input.expectedVersion) {
          throw Object.assign(new Error('Conflict: investigation was updated by another reviewer.'), { status: 409, code: 'CONFLICT' })
        }

        const latestDec = await db.collection<ReviewDecision>('decisions').find({ investigationId }, { session }).sort({ version: -1 }).limit(1).toArray()
        const decision: ReviewDecision = {
          id: newId('decision'),
          investigationId,
          disposition: input.disposition,
          reason: input.reason.trim(),
          notes: input.notes?.trim() || null,
          reviewerId,
          decidedAt: isoNow(),
          version: (latestDec[0]?.version ?? 0) + 1,
          supersedesId: latestDec[0]?.id ?? null,
        }

        await db.collection<ReviewDecision>('decisions').insertOne(decision, { session })
        await db.collection<Investigation>('investigations').updateOne(
          { id: investigationId },
          { $set: { status: 'reviewed' }, $inc: { version: 1 } },
          { session },
        )

        const audit: AuditEntry = {
          id: newId('audit'),
          occurredAt: decision.decidedAt,
          actorType: 'reviewer',
          actorId: reviewerId,
          actorLabel,
          actorRole: 'reviewer',
          action: 'REVIEW_DECISION_SUBMITTED',
          targetType: 'Investigation',
          targetId: investigationId,
          correlationId: investigationId,
          summary: `Review decision "${decision.disposition}" committed for investigation ${investigationId}.`,
          before: { status: inv.status, version: input.expectedVersion },
          after: { status: 'reviewed', decisionId: decision.id, disposition: decision.disposition },
          schemaVersion: 1,
        }
        await db.collection<AuditEntry>('audit').insertOne(audit, { session })
        resultDecision = decision
      })

      return resultDecision!
    } finally {
      await session.endSession()
    }
  }

  async submitOutcome(
    investigationId: string,
    input: { outcome: InstitutionalOutcomeValue; reason: string; expectedVersion: number },
    actor: { actorId?: string; actorLabel?: string; actorRole?: ActorRole } = {},
  ): Promise<InstitutionalOutcome> {
    if (!input.reason?.trim()) {
      throw Object.assign(new Error('Validation error: rationale is mandatory for institutional outcomes.'), { status: 422, code: 'VALIDATION_ERROR' })
    }

    const adminId = actor.actorId || 'demo-administrator'
    const actorLabel = actor.actorLabel || 'Administrator Dean M. Vance'

    if (isUsingMemoryFallback() || !getDb()) {
      const inv = getMemStore().investigations.find((i) => i.id === investigationId)
      if (!inv) throw Object.assign(new Error(`Investigation not found: ${investigationId}`), { status: 404 })
      if (inv.version !== input.expectedVersion) {
        throw Object.assign(new Error('Conflict: record was modified.'), { status: 409, code: 'CONFLICT' })
      }
      if (inv.status !== 'reviewed') {
        throw Object.assign(new Error('Precondition failed: institutional outcome requires investigation status "reviewed".'), { status: 422, code: 'PRECONDITION_FAILED' })
      }

      const prior = getMemStore().outcomes.filter((o) => o.investigationId === investigationId).sort((a, b) => b.version - a.version)[0]
      const outcome: InstitutionalOutcome = {
        id: newId('outcome'),
        investigationId,
        outcome: input.outcome,
        reason: input.reason.trim(),
        administratorId: adminId,
        decidedAt: isoNow(),
        version: (prior?.version ?? 0) + 1,
        supersedesId: prior?.id ?? null,
      }

      getMemStore().outcomes.push(outcome)
      inv.status = 'outcome_recorded'
      inv.version += 1

      const audit: AuditEntry = {
        id: newId('audit'),
        occurredAt: outcome.decidedAt,
        actorType: 'administrator',
        actorId: adminId,
        actorLabel,
        actorRole: 'administrator',
        action: 'INSTITUTIONAL_OUTCOME_RECORDED',
        targetType: 'Investigation',
        targetId: investigationId,
        correlationId: investigationId,
        summary: `Institutional outcome "${outcome.outcome}" recorded for investigation ${investigationId}.`,
        before: { status: 'reviewed', version: input.expectedVersion },
        after: { status: 'outcome_recorded', outcomeId: outcome.id, outcome: outcome.outcome },
        schemaVersion: 1,
      }
      getMemStore().audit.push(audit)
      return structuredClone(outcome)
    }

    const db = getDb()!
    const client = getMongoClient()!
    const session = client.startSession()

    try {
      let resultOutcome: InstitutionalOutcome | null = null

      await session.withTransaction(async () => {
        const inv = await db.collection<Investigation>('investigations').findOne({ id: investigationId }, { session })
        if (!inv) throw Object.assign(new Error(`Investigation not found: ${investigationId}`), { status: 404 })
        if (inv.version !== input.expectedVersion) {
          throw Object.assign(new Error('Conflict: record was modified.'), { status: 409, code: 'CONFLICT' })
        }
        if (inv.status !== 'reviewed') {
          throw Object.assign(new Error('Precondition failed: institutional outcome requires status "reviewed".'), { status: 422, code: 'PRECONDITION_FAILED' })
        }

        const latest = await db.collection<InstitutionalOutcome>('outcomes').find({ investigationId }, { session }).sort({ version: -1 }).limit(1).toArray()
        const outcome: InstitutionalOutcome = {
          id: newId('outcome'),
          investigationId,
          outcome: input.outcome,
          reason: input.reason.trim(),
          administratorId: adminId,
          decidedAt: isoNow(),
          version: (latest[0]?.version ?? 0) + 1,
          supersedesId: latest[0]?.id ?? null,
        }

        await db.collection<InstitutionalOutcome>('outcomes').insertOne(outcome, { session })
        await db.collection<Investigation>('investigations').updateOne(
          { id: investigationId },
          { $set: { status: 'outcome_recorded' }, $inc: { version: 1 } },
          { session },
        )

        const audit: AuditEntry = {
          id: newId('audit'),
          occurredAt: outcome.decidedAt,
          actorType: 'administrator',
          actorId: adminId,
          actorLabel,
          actorRole: 'administrator',
          action: 'INSTITUTIONAL_OUTCOME_RECORDED',
          targetType: 'Investigation',
          targetId: investigationId,
          correlationId: investigationId,
          summary: `Institutional outcome "${outcome.outcome}" recorded for investigation ${investigationId}.`,
          before: { status: 'reviewed', version: input.expectedVersion },
          after: { status: 'outcome_recorded', outcomeId: outcome.id, outcome: outcome.outcome },
          schemaVersion: 1,
        }
        await db.collection<AuditEntry>('audit').insertOne(audit, { session })
        resultOutcome = outcome
      })

      return resultOutcome!
    } finally {
      await session.endSession()
    }
  }

  async getAuditEntries(targetType: string, targetId: string, page = 1, pageSize = 20) {
    if (isUsingMemoryFallback() || !getDb()) {
      const items = getMemStore().audit
        .filter((a) => a.targetType === targetType && a.targetId === targetId)
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      const start = (page - 1) * pageSize
      return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize }
    }
    const db = getDb()!
    const col = db.collection<AuditEntry>('audit')
    const query = { targetType, targetId }
    const total = await col.countDocuments(query)
    const items = await col.find(query).sort({ occurredAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray()
    return { items, total, page, pageSize }
  }

  async getAllAuditEntries(params?: { targetType?: string; targetId?: string; actorRole?: string; search?: string; page?: number; pageSize?: number }) {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 20

    if (isUsingMemoryFallback() || !getDb()) {
      let items = [...getMemStore().audit]
      if (params?.targetType && params.targetType !== 'all') items = items.filter((a) => a.targetType === params.targetType)
      if (params?.targetId) items = items.filter((a) => a.targetId.toLowerCase().includes(params.targetId!.toLowerCase()))
      if (params?.actorRole && params.actorRole !== 'all') items = items.filter((a) => a.actorRole === params.actorRole)
      if (params?.search) {
        const q = params.search.toLowerCase()
        items = items.filter(
          (a) =>
            a.summary.toLowerCase().includes(q) ||
            a.action.toLowerCase().includes(q) ||
            a.actorLabel.toLowerCase().includes(q) ||
            a.targetId.toLowerCase().includes(q),
        )
      }
      items.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      const start = (page - 1) * pageSize
      return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize }
    }

    const db = getDb()!
    const query: Record<string, unknown> = {}
    if (params?.targetType && params.targetType !== 'all') query.targetType = params.targetType
    if (params?.targetId) query.targetId = { $regex: params.targetId, $options: 'i' }
    if (params?.actorRole && params.actorRole !== 'all') query.actorRole = params.actorRole
    if (params?.search) {
      query.$or = [
        { summary: { $regex: params.search, $options: 'i' } },
        { action: { $regex: params.search, $options: 'i' } },
        { targetId: { $regex: params.search, $options: 'i' } },
      ]
    }

    const col = db.collection<AuditEntry>('audit')
    const total = await col.countDocuments(query)
    const items = await col.find(query).sort({ occurredAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray()
    return { items, total, page, pageSize }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    if (isUsingMemoryFallback() || !getDb()) {
      const store = getMemStore()
      return {
        totalAssessments: store.assessments.length,
        totalSessions: store.sessions.length,
        sessionsRequiringReview: store.sessions.filter((s) => s.status === 'flagged').length,
        activeSessions: store.sessions.filter((s) => s.status === 'active').length,
        clearedSessions: store.sessions.filter((s) => s.status === 'cleared').length,
        submittedSessions: store.sessions.filter((s) => s.status === 'submitted').length,
        openInvestigations: store.investigations.filter((i) => i.status === 'open' || i.status === 'under_review').length,
        pendingReviewerDecisions: store.investigations.filter((i) => i.status === 'open' || i.status === 'under_review').length,
        recordedOutcomes: store.outcomes.length,
        signalsAwaitingTriage: store.signals.filter((s) => s.requiresHumanReview).length,
      }
    }

    const db = getDb()!
    const [totalAssessments, totalSessions, flaggedSessions, activeSessions, clearedSessions, submittedSessions, openInvs, outcomesCount, signalsCount] =
      await Promise.all([
        db.collection('assessments').countDocuments(),
        db.collection('sessions').countDocuments(),
        db.collection('sessions').countDocuments({ status: 'flagged' }),
        db.collection('sessions').countDocuments({ status: 'active' }),
        db.collection('sessions').countDocuments({ status: 'cleared' }),
        db.collection('sessions').countDocuments({ status: 'submitted' }),
        db.collection('investigations').countDocuments({ status: { $in: ['open', 'under_review'] } }),
        db.collection('outcomes').countDocuments(),
        db.collection('signals').countDocuments({ requiresHumanReview: true }),
      ])

    return {
      totalAssessments,
      totalSessions,
      sessionsRequiringReview: flaggedSessions,
      activeSessions,
      clearedSessions,
      submittedSessions,
      openInvestigations: openInvs,
      pendingReviewerDecisions: openInvs,
      recordedOutcomes: outcomesCount,
      signalsAwaitingTriage: signalsCount,
    }
  }
}

export const integrityService = new IntegrityBackendService()
