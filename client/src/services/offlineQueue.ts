import type { TypedSocket } from '@services/socket'
import type { MessageType, SendMessagePayload } from '@/types/socket'

export type PendingStatus = 'pending' | 'failed'

export interface PendingMessage {
  clientId: string
  type: 'send' | 'file'
  payload: SendMessagePayload
  status: PendingStatus
  retries: number
  createdAt: string
  /** Display fields for UI */
  userName: string
  userId: string
}

const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 2000, 4000] // exponential backoff

/**
 * Queues messages when socket is disconnected and flushes on reconnect.
 * Each message gets a clientId (UUID) for idempotency dedup on the server.
 */
export class OfflineQueue {
  private queue: PendingMessage[] = []
  private snapshot: PendingMessage[] = []
  private listeners = new Set<() => void>()

  enqueue(
    content: string,
    roomId: string,
    userId: string,
    userName: string,
    opts?: { type?: MessageType; fileUrl?: string; replyToId?: string }
  ): string {
    const clientId = crypto.randomUUID()
    const payload: SendMessagePayload = {
      roomId,
      content: content.trim(),
      type: opts?.type ?? 'TEXT',
      fileUrl: opts?.fileUrl,
      replyToId: opts?.replyToId,
      clientId,
    }

    this.queue.push({
      clientId,
      type: opts?.fileUrl ? 'file' : 'send',
      payload,
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
      userName,
      userId,
    })

    this.notify()
    return clientId
  }

  async flush(socket: TypedSocket): Promise<void> {
    const pending = this.queue.filter((m) => m.status === 'pending')
    for (const msg of pending) {
      await this.sendWithRetry(socket, msg)
    }
  }

  private async sendWithRetry(socket: TypedSocket, msg: PendingMessage): Promise<void> {
    return new Promise<void>((resolve) => {
      const attempt = () => {
        socket.emit('message:send', msg.payload, (ack) => {
          if (ack.success) {
            this.remove(msg.clientId)
            resolve()
          } else {
            msg.retries++
            if (msg.retries >= MAX_RETRIES) {
              msg.status = 'failed'
              this.notify()
              resolve()
            } else {
              const delay = RETRY_DELAYS[msg.retries - 1] ?? 4000
              setTimeout(attempt, delay)
            }
          }
        })
      }
      attempt()
    })
  }

  retry(clientId: string, socket: TypedSocket): void {
    const msg = this.queue.find((m) => m.clientId === clientId)
    if (!msg || msg.status !== 'failed') return

    msg.status = 'pending'
    msg.retries = 0
    this.notify()
    this.sendWithRetry(socket, msg)
  }

  remove(clientId: string): void {
    this.queue = this.queue.filter((m) => m.clientId !== clientId)
    this.notify()
  }

  getAll(): PendingMessage[] {
    return [...this.queue]
  }

  /** Stable snapshot for useSyncExternalStore (same reference between calls) */
  getSnapshot(): PendingMessage[] {
    return this.snapshot
  }

  clear(): void {
    this.queue = []
    this.notify()
  }

  get size(): number {
    return this.queue.length
  }

  /** Subscribe to queue changes */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.snapshot = [...this.queue]
    for (const listener of this.listeners) {
      listener()
    }
  }
}

// Singleton per app
export const offlineQueue = new OfflineQueue()
