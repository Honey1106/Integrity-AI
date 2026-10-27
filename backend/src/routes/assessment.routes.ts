import { Router } from 'express'
import { integrityService } from '../services/integrity.service.js'

export const assessmentRouter = Router()

assessmentRouter.get('/', async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1
    const result = await integrityService.listAssessments(page)
    res.json(result)
  } catch (err) {
    next(err)
  }
})
