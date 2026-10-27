import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { connectDB } from '../db.js'

describe('IntegrityAI Backend REST API', () => {
  let app: ReturnType<typeof createApp>

  beforeAll(async () => {
    await connectDB()
    app = createApp()
  })

  it('GET /api/health returns status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('GET /api/assessments returns paginated list', async () => {
    const res = await request(app).get('/api/assessments')
    expect(res.status).toBe(200)
    expect(res.body.items).toBeDefined()
    expect(res.body.items.length).toBeGreaterThan(0)
  })

  it('GET /api/sessions returns sessions with filtering support', async () => {
    const res = await request(app).get('/api/sessions?status=flagged')
    expect(res.status).toBe(200)
    expect(res.body.items.every((s: { status: string }) => s.status === 'flagged')).toBe(true)
  })

  it('GET /api/signals returns triage telemetry observations', async () => {
    const res = await request(app).get('/api/signals?requiresHumanReview=true')
    expect(res.status).toBe(200)
    expect(res.body.items.every((s: { requiresHumanReview: boolean }) => s.requiresHumanReview)).toBe(true)
  })

  it('POST /api/investigations/:id/decisions rejects empty reason with 422', async () => {
    const res = await request(app)
      .post('/api/investigations/investigation-001/decisions')
      .send({ disposition: 'clear', reason: '  ', expectedVersion: 1 })
    expect(res.status).toBe(422)
  })

  it('POST /api/investigations/:id/decisions rejects stale version with 409 CONFLICT', async () => {
    const res = await request(app)
      .post('/api/investigations/investigation-001/decisions')
      .send({ disposition: 'clear', reason: 'Legitimate explanation.', expectedVersion: 999 })
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT')
  })

  it('POST /api/investigations/:id/outcomes rejects outcome if status is not reviewed with 422', async () => {
    const res = await request(app)
      .post('/api/investigations/investigation-001/outcomes')
      .send({ outcome: 'no_action', reason: 'Premature outcome.', expectedVersion: 1 })
    expect(res.status).toBe(422)
  })

  it('POST /api/investigations/:id/decisions accepts valid decision and appends audit', async () => {
    const invRes = await request(app).get('/api/investigations/investigation-001')
    const currentVersion = invRes.body.version

    const res = await request(app)
      .post('/api/investigations/investigation-001/decisions')
      .send({
        disposition: 'needs_follow_up',
        reason: 'Focus deviation combined with secondary window opening requires candidate clarification.',
        expectedVersion: currentVersion,
      })

    expect(res.status).toBe(201)
    expect(res.body.disposition).toBe('needs_follow_up')

    // Verify investigation status advanced
    const updatedInv = await request(app).get('/api/investigations/investigation-001')
    expect(updatedInv.body.status).toBe('reviewed')

    // Verify audit entry created
    const auditRes = await request(app).get('/api/audit?targetType=Investigation&targetId=investigation-001')
    expect(auditRes.body.items.some((a: { action: string }) => a.action === 'REVIEW_DECISION_SUBMITTED')).toBe(true)
  })

  it('POST /api/investigations/:id/outcomes accepts outcome after reviewed state', async () => {
    const invRes = await request(app).get('/api/investigations/investigation-001')
    expect(invRes.body.status).toBe('reviewed')

    const res = await request(app)
      .post('/api/investigations/investigation-001/outcomes')
      .send({
        outcome: 'caution_issued',
        reason: 'Administrative board issued standard academic caution regarding window deviations.',
        expectedVersion: invRes.body.version,
      })

    expect(res.status).toBe(201)
    expect(res.body.outcome).toBe('caution_issued')

    // Verify status advanced to outcome_recorded
    const finalInv = await request(app).get('/api/investigations/investigation-001')
    expect(finalInv.body.status).toBe('outcome_recorded')
  })
})
