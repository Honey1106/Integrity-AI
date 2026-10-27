import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isWin = process.platform === 'win32'
const npmCmd = isWin ? 'npm.cmd' : 'npm'

console.log('\n[IntegrityAI] Launching Backend and Frontend...\n')

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: resolve(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
})

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: resolve(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true,
})

function cleanup() {
  backend.kill()
  frontend.kill()
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
