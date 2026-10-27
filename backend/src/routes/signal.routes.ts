import { Router } from 'express'
import { integrityService } from '../services/integrity.service.js'

export const signalRouter = Router()

signalRouter.get('/', async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1
    const pageSize = req.query.pageSize ? parseInt(String(req.query.pageSize), 10) : 20
    const category = req.query.category ? String(req.query.category) : undefined
    const severity = req.query.severity ? String(req.query.severity) : undefined
    const requiresHumanReview = req.query.requiresHumanReview !== undefined ? req.query.requiresHumanReview === 'true' : undefined
    const sessionId = req.query.sessionId ? String(req.query.sessionId) : undefined
    const search = req.query.search ? String(req.query.search) : undefined

    const result = await integrityService.listSignals({ category, severity, requiresHumanReview, sessionId, search, page, pageSize })
    res.json(result)
  } catch (err) {
    next(err)
  }
})
