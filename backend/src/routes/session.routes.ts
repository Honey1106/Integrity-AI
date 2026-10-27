import { Router } from 'express'
import { integrityService } from '../services/integrity.service.js'

export const sessionRouter = Router()

sessionRouter.get('/', async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1
    const pageSize = req.query.pageSize ? parseInt(String(req.query.pageSize), 10) : 20
    const status = req.query.status ? String(req.query.status) : undefined
    const assessmentId = req.query.assessmentId ? String(req.query.assessmentId) : undefined
    const search = req.query.search ? String(req.query.search) : undefined

    const result = await integrityService.listSessions({ status, assessmentId, search, page, pageSize })
    res.json(result)
  } catch (err) {
    next(err)
  }
})

sessionRouter.get('/:id', async (req, res, next) => {
  try {
    const session = await integrityService.getSession(req.params.id)
    res.json(session)
  } catch (err) {
    next(err)
  }
})

sessionRouter.get('/:id/signals', async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1
    const result = await integrityService.getSessionSignals(req.params.id, page)
    res.json(result)
  } catch (err) {
    next(err)
  }
})
