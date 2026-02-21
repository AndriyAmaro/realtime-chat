import { createChildLogger } from '../config/logger.js'

const log = createChildLogger('shutdown')

interface ShutdownTask {
  name: string
  fn: () => Promise<void>
}

class ShutdownService {
  private tasks: ShutdownTask[] = []
  private _isShuttingDown = false

  get isShuttingDown(): boolean {
    return this._isShuttingDown
  }

  /** Register a cleanup task to run during graceful shutdown. */
  register(name: string, fn: () => Promise<void>): void {
    this.tasks.push({ name, fn })
  }

  /** Execute all shutdown tasks in registration order. */
  async execute(signal: string): Promise<void> {
    if (this._isShuttingDown) {
      log.warn('Shutdown already in progress, ignoring duplicate signal')
      return
    }

    this._isShuttingDown = true
    log.info({ signal }, 'Graceful shutdown initiated')

    for (const task of this.tasks) {
      try {
        log.info({ task: task.name }, `Executing: ${task.name}`)
        await task.fn()
        log.info({ task: task.name }, `Completed: ${task.name}`)
      } catch (err) {
        log.error({ err, task: task.name }, `Failed: ${task.name}`)
      }
    }

    log.info('All shutdown tasks completed')
  }
}

export const shutdownService = new ShutdownService()
