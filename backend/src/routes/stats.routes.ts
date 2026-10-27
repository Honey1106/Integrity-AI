import { Router } from 'express'
import { integrityService } from '../services/integrity.service.js'

export const statsRouter = Router()

statsRouter.get('/dashboard', async (_req, res, next) => {
  try {
    const stats = await integrityService.getDashboardStats()
    res.json(stats)
  } catch (err) {
    next(err)
  }
})
