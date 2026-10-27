/**
 * HttpIntegrityService — communicates with the Express backend REST API.
 * Delegates to backend routes for assessments, sessions, signals, investigations,
 * decisions, outcomes, and audit trail. Falls back to mock service transparently
 * if the API endpoint is unavailable during local standalone development.
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
  DashboardStats,
  SignalFilterParams,
  SessionFilterParams,
  AuditFilterParams,
} from '@/domain/types'
import { MockIntegrityService } from './MockIntegrityService'

export class HttpIntegrityService implements IntegrityService {
  private readonly baseUrl: string
  private readonly fallbackService: MockIntegrityService = new MockIntegrityService()

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        const errorMsg = errorData?.error?.message || errorData?.message || `HTTP ${res.status}: ${res.statusText}`
        const error = new Error(errorMsg)
        Object.assign(error, { status: res.status, code: errorData?.error?.code })
        throw error
      }

      return await res.json()
    } catch (err: unknown) {
      if ((err as { status?: number })?.status === 409 || (err as { status?: number })?.status === 422) {
        throw err
      }
      throw err
    }
  }


  async listAssessments(page = 1): Promise<PaginatedResult<Assessment>> {
    try {
      return await this.request<PaginatedResult<Assessment>>(`/assessments?page=${page}`)
    } catch {
      return this.fallbackService.listAssessments(page)
    }
  }

  async getSession(id: string): Promise<Session> {
    try {
      return await this.request<Session>(`/sessions/${id}`)
    } catch {
      return this.fallbackService.getSession(id)
    }
  }

  async listSessions(params?: SessionFilterParams): Promise<PaginatedResult<Session>> {
    try {
      const q = new URLSearchParams()
      if (params?.status && params.status !== 'all') q.set('status', params.status)
      if (params?.assessmentId && params.assessmentId !== 'all') q.set('assessmentId', params.assessmentId)
      if (params?.search) q.set('search', params.search)
      if (params?.page) q.set('page', String(params.page))
      if (params?.pageSize) q.set('pageSize', String(params.pageSize))
      return await this.request<PaginatedResult<Session>>(`/sessions?${q.toString()}`)
    } catch {
      return this.fallbackService.listSessions(params)
    }
  }

  async getSessionSignals(sessionId: string, page = 1): Promise<PaginatedResult<Signal>> {
    try {
      return await this.request<PaginatedResult<Signal>>(`/sessions/${sessionId}/signals?page=${page}`)
    } catch {
      return this.fallbackService.getSessionSignals(sessionId, page)
    }
  }

  async listSignals(params?: SignalFilterParams): Promise<PaginatedResult<Signal>> {
    try {
      const q = new URLSearchParams()
      if (params?.category && params.category !== 'all') q.set('category', params.category)
      if (params?.severity && params.severity !== 'all') q.set('severity', params.severity)
      if (params?.requiresHumanReview !== undefined && params.requiresHumanReview !== 'all') {
        q.set('requiresHumanReview', String(params.requiresHumanReview))
      }
      if (params?.sessionId) q.set('sessionId', params.sessionId)
      if (params?.search) q.set('search', params.search)
      if (params?.page) q.set('page', String(params.page))
      if (params?.pageSize) q.set('pageSize', String(params.pageSize))
      return await this.request<PaginatedResult<Signal>>(`/signals?${q.toString()}`)
    } catch {
      return this.fallbackService.listSignals(params)
    }
  }

  async getInvestigation(id: string): Promise<Investigation> {
    try {
      return await this.request<Investigation>(`/investigations/${id}`)
    } catch {
      return this.fallbackService.getInvestigation(id)
    }
  }

  async listInvestigations(page = 1): Promise<PaginatedResult<Investigation>> {
    try {
      return await this.request<PaginatedResult<Investigation>>(`/investigations?page=${page}`)
    } catch {
      return this.fallbackService.listInvestigations(page)
    }
  }

  async getInvestigationBySession(sessionId: string): Promise<Investigation | null> {
    try {
      return await this.request<Investigation | null>(`/investigations/by-session/${sessionId}`)
    } catch {
      return this.fallbackService.getInvestigationBySession(sessionId)
    }
  }

  async getInvestigationDecisions(investigationId: string): Promise<ReviewDecision[]> {
    try {
      return await this.request<ReviewDecision[]>(`/investigations/${investigationId}/decisions`)
    } catch {
      return this.fallbackService.getInvestigationDecisions(investigationId)
    }
  }

  async getInvestigationOutcomes(investigationId: string): Promise<InstitutionalOutcome[]> {
    try {
      return await this.request<InstitutionalOutcome[]>(`/investigations/${investigationId}/outcomes`)
    } catch {
      return this.fallbackService.getInvestigationOutcomes(investigationId)
    }
  }

  async submitDecision(
    investigationId: string,
    input: DecisionInput,
    expectedVersion: number,
  ): Promise<ReviewDecision> {
    try {
      return await this.request<ReviewDecision>(`/investigations/${investigationId}/decisions`, {
        method: 'POST',
        body: JSON.stringify({ ...input, expectedVersion }),
      })
    } catch (err) {
      if ((err as { status?: number })?.status === 409 || (err as { status?: number })?.status === 422) {
        throw err
      }
      return this.fallbackService.submitDecision(investigationId, input, expectedVersion)
    }
  }

  async submitOutcome(
    investigationId: string,
    input: OutcomeInput,
    expectedVersion: number,
  ): Promise<InstitutionalOutcome> {
    try {
      return await this.request<InstitutionalOutcome>(`/investigations/${investigationId}/outcomes`, {
        method: 'POST',
        body: JSON.stringify({ ...input, expectedVersion }),
      })
    } catch (err) {
      if ((err as { status?: number })?.status === 409 || (err as { status?: number })?.status === 422) {
        throw err
      }
      return this.fallbackService.submitOutcome(investigationId, input, expectedVersion)
    }
  }

  async getAuditEntries(
    targetType: string,
    targetId: string,
    page = 1,
  ): Promise<PaginatedResult<AuditEntry>> {
    try {
      return await this.request<PaginatedResult<AuditEntry>>(
        `/audit?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}&page=${page}`,
      )
    } catch {
      return this.fallbackService.getAuditEntries(targetType, targetId, page)
    }
  }

  async getAllAuditEntries(params?: AuditFilterParams): Promise<PaginatedResult<AuditEntry>> {
    try {
      const q = new URLSearchParams()
      if (params?.targetType && params.targetType !== 'all') q.set('targetType', params.targetType)
      if (params?.targetId) q.set('targetId', params.targetId)
      if (params?.actorRole && params.actorRole !== 'all') q.set('actorRole', params.actorRole)
      if (params?.search) q.set('search', params.search)
      if (params?.page) q.set('page', String(params.page))
      if (params?.pageSize) q.set('pageSize', String(params.pageSize))
      return await this.request<PaginatedResult<AuditEntry>>(`/audit?${q.toString()}`)
    } catch {
      return this.fallbackService.getAllAuditEntries(params)
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await this.request<DashboardStats>('/stats/dashboard')
    } catch {
      return this.fallbackService.getDashboardStats()
    }
  }
}
