import express from 'express'
import cors from 'cors'
import { assessmentRouter } from './routes/assessment.routes.js'
import { sessionRouter } from './routes/session.routes.js'
import { signalRouter } from './routes/signal.routes.js'
import { investigationRouter } from './routes/investigation.routes.js'
import { auditRouter } from './routes/audit.routes.js'
import { statsRouter } from './routes/stats.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  // Routes
  app.use('/api/assessments', assessmentRouter)
  app.use('/api/sessions', sessionRouter)
  app.use('/api/signals', signalRouter)
  app.use('/api/investigations', investigationRouter)
  app.use('/api/audit', auditRouter)
  app.use('/api/stats', statsRouter)

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'IntegrityAI Backend' })
  })

  // Error handling
  app.use(errorHandler)

  return app
}
