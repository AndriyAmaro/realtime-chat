import { Routes, Route } from 'react-router-dom'
import { Button } from '@core/primitives/Button'
import { ThemeToggle } from '@core/primitives/ThemeToggle'
import { Badge } from '@core/primitives/Badge'
import { Avatar } from '@core/primitives/Avatar'
import { Spinner } from '@core/primitives/Spinner'

function DesignSystemTest() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Pulse Design System - Chat
          </h1>
          <ThemeToggle />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Avatars & Badges</h2>
          <div className="flex items-center gap-4">
            <Avatar fallback="AC" size="sm" />
            <Avatar fallback="JS" size="md" />
            <Avatar fallback="RD" size="lg" />
            <Badge variant="default">Online</Badge>
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Away</Badge>
            <Badge variant="destructive">Offline</Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Loading</h2>
          <div className="flex items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DesignSystemTest />} />
    </Routes>
  )
}
