import { createApp } from './app.js'
import { connectDB } from './db.js'

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000

async function startServer() {
  await connectDB()
  const app = createApp()

  const server = app.listen(PORT, () => {
    console.log(`[IntegrityAI Backend] Server listening on http://localhost:${PORT}`)
  })

  const shutdown = async () => {
    server.close(() => {
      process.exit(0)
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err)
  process.exit(1)
})
