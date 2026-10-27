import { Router } from 'express'
import { integrityService } from '../services/integrity.service.js'

export const investigationRouter = Router()

investigationRouter.get('/', async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1
    const result = await integrityService.listInvestigations(page)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

investigationRouter.get('/by-session/:sessionId', async (req, res, next) => {
  try {
    const result = await integrityService.getInvestigationBySession(req.params.sessionId)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

investigationRouter.get('/:id', async (req, res, next) => {
  try {
    const inv = await integrityService.getInvestigation(req.params.id)
    res.json(inv)
  } catch (err) {
    next(err)
  }
})

investigationRouter.get('/:id/decisions', async (req, res, next) => {
  try {
    const decisions = await integrityService.getInvestigationDecisions(req.params.id)
    res.json(decisions)
  } catch (err) {
    next(err)
  }
})

investigationRouter.get('/:id/outcomes', async (req, res, next) => {
  try {
    const outcomes = await integrityService.getInvestigationOutcomes(req.params.id)
    res.json(outcomes)
  } catch (err) {
    next(err)
  }
})

investigationRouter.post('/:id/decisions', async (req, res, next) => {
  try {
    const { disposition, reason, notes, expectedVersion } = req.body
    if (expectedVersion === undefined) {
      throw Object.assign(new Error('expectedVersion is required for concurrency control'), { status: 422 })
    }

    const decision = await integrityService.submitDecision(
      req.params.id,
      { disposition, reason, notes, expectedVersion },
      { actorRole: 'reviewer', actorLabel: 'Reviewer Dr. Sarah Chen' },
    )
    res.status(201).json(decision)
  } catch (err) {
    next(err)
  }
})

investigationRouter.post('/:id/outcomes', async (req, res, next) => {
  try {
    const { outcome, reason, expectedVersion } = req.body
    if (expectedVersion === undefined) {
      throw Object.assign(new Error('expectedVersion is required for concurrency control'), { status: 422 })
    }

    const rec = await integrityService.submitOutcome(
      req.params.id,
      { outcome, reason, expectedVersion },
      { actorRole: 'administrator', actorLabel: 'Administrator Dean M. Vance' },
    )
    res.status(201).json(rec)
  } catch (err) {
    next(err)
  }
})
