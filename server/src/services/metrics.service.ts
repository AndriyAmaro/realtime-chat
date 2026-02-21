/**
 * In-memory metrics collector.
 * Tracks HTTP requests, socket events, and system health.
 * No external dependencies — everything stays in process memory.
 */

interface HttpMetric {
  totalRequests: number
  totalDuration: number
  statusCodes: Record<string, number>
  methods: Record<string, number>
  slowestRequests: Array<{ method: string; url: string; duration: number; timestamp: string }>
}

interface SocketMetric {
  totalConnections: number
  currentConnections: number
  totalDisconnections: number
  events: Record<string, number>
}

export interface MetricsSnapshot {
  uptime: number
  timestamp: string
  http: HttpMetric & { averageDuration: number }
  socket: SocketMetric
  memory: NodeJS.MemoryUsage
  process: { pid: number; nodeVersion: string; platform: string }
}

class MetricsService {
  private startTime = Date.now()

  private http: HttpMetric = {
    totalRequests: 0,
    totalDuration: 0,
    statusCodes: {},
    methods: {},
    slowestRequests: [],
  }

  private socket: SocketMetric = {
    totalConnections: 0,
    currentConnections: 0,
    totalDisconnections: 0,
    events: {},
  }

  // ---- HTTP ----

  recordHttpRequest(method: string, url: string, statusCode: number, duration: number): void {
    this.http.totalRequests++
    this.http.totalDuration += duration

    const statusKey = String(statusCode)
    this.http.statusCodes[statusKey] = (this.http.statusCodes[statusKey] ?? 0) + 1
    this.http.methods[method] = (this.http.methods[method] ?? 0) + 1

    // Keep top 10 slowest
    this.http.slowestRequests.push({
      method,
      url,
      duration,
      timestamp: new Date().toISOString(),
    })
    this.http.slowestRequests.sort((a, b) => b.duration - a.duration)
    if (this.http.slowestRequests.length > 10) {
      this.http.slowestRequests = this.http.slowestRequests.slice(0, 10)
    }
  }

  // ---- Socket ----

  recordSocketConnection(): void {
    this.socket.totalConnections++
    this.socket.currentConnections++
  }

  recordSocketDisconnection(): void {
    this.socket.totalDisconnections++
    this.socket.currentConnections = Math.max(0, this.socket.currentConnections - 1)
  }

  recordSocketEvent(eventName: string): void {
    this.socket.events[eventName] = (this.socket.events[eventName] ?? 0) + 1
  }

  // ---- Snapshot ----

  getSnapshot(): MetricsSnapshot {
    return {
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      http: {
        ...this.http,
        averageDuration:
          this.http.totalRequests > 0
            ? Math.round(this.http.totalDuration / this.http.totalRequests)
            : 0,
      },
      socket: { ...this.socket },
      memory: process.memoryUsage(),
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
      },
    }
  }
}

export const metricsService = new MetricsService()
