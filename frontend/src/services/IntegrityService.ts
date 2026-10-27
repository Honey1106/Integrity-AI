/**
 * IntegrityService — the interface that the UI depends on.
 * The mock implementation satisfies this fully.
 * A future HttpIntegrityService will replace it when the backend is ready.
 *
 * See ARCHITECTURE.md: React routes -> feature hooks -> IntegrityService interface
 */

import type {
  Assessment,
  Session,
  Signal,
  Investigation,
  ReviewDecision,
  InstitutionalOutcome,
  AuditEntry,
  Disposition,
  InstitutionalOutcomeValue,
  DashboardStats,
  SignalFilterParams,
  SessionFilterParams,
  AuditFilterParams,
} from '@/domain/types'

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface DecisionInput {
  disposition: Disposition
  reason: string
  notes?: string
}

export interface OutcomeInput {
  outcome: InstitutionalOutcomeValue
  reason: string
}

export interface IntegrityService {
  // Assessments
  listAssessments(page?: number): Promise<PaginatedResult<Assessment>>

  // Sessions
  getSession(id: string): Promise<Session>
  listSessions(params?: SessionFilterParams): Promise<PaginatedResult<Session>>
  getSessionSignals(sessionId: string, page?: number): Promise<PaginatedResult<Signal>>

  // Signals Triage Queue
  listSignals(params?: SignalFilterParams): Promise<PaginatedResult<Signal>>

  // Investigations
  getInvestigation(id: string): Promise<Investigation>
  listInvestigations(page?: number): Promise<PaginatedResult<Investigation>>
  getInvestigationBySession(sessionId: string): Promise<Investigation | null>
  getInvestigationDecisions(investigationId: string): Promise<ReviewDecision[]>
  getInvestigationOutcomes(investigationId: string): Promise<InstitutionalOutcome[]>
  submitDecision(investigationId: string, input: DecisionInput, expectedVersion: number): Promise<ReviewDecision>

  // Outcomes (administrator only in workflow)
  submitOutcome(investigationId: string, input: OutcomeInput, expectedVersion: number): Promise<InstitutionalOutcome>

  // Audit
  getAuditEntries(
    targetType: string,
    targetId: string,
    page?: number,
  ): Promise<PaginatedResult<AuditEntry>>
  getAllAuditEntries(params?: AuditFilterParams): Promise<PaginatedResult<AuditEntry>>

  // Dashboard Aggregates
  getDashboardStats(): Promise<DashboardStats>
}

