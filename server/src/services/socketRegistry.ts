// ============ SOCKET REGISTRY ============
// In-memory map for O(1) userId → socketId lookups.
// Replaces io.fetchSockets() scans for online/offline checks.

class SocketRegistry {
  private userSockets = new Map<string, Set<string>>()

  add(userId: string, socketId: string): void {
    let sockets = this.userSockets.get(userId)
    if (!sockets) {
      sockets = new Set()
      this.userSockets.set(userId, sockets)
    }
    sockets.add(socketId)
  }

  remove(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId)
    if (!sockets) return
    sockets.delete(socketId)
    if (sockets.size === 0) {
      this.userSockets.delete(userId)
    }
  }

  isOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId)
    return !!sockets && sockets.size > 0
  }

  getSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size ?? 0
  }

  getSocketIds(userId: string): Set<string> {
    return this.userSockets.get(userId) ?? new Set()
  }
}

export const socketRegistry = new SocketRegistry()
