import { Router } from 'express'
import { integrityService } from '../services/integrity.service.js'

export const auditRouter = Router()

auditRouter.get('/', async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1
    const pageSize = req.query.pageSize ? parseInt(String(req.query.pageSize), 10) : 20
    const targetType = req.query.targetType ? String(req.query.targetType) : undefined
    const targetId = req.query.targetId ? String(req.query.targetId) : undefined
    const actorRole = req.query.actorRole ? String(req.query.actorRole) : undefined
    const search = req.query.search ? String(req.query.search) : undefined

    if (targetType && targetId) {
      const result = await integrityService.getAuditEntries(targetType, targetId, page, pageSize)
      res.json(result)
      return
    }

    const result = await integrityService.getAllAuditEntries({ targetType, targetId, actorRole, search, page, pageSize })
    res.json(result)
  } catch (err) {
    next(err)
  }
})
