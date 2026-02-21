import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@core/primitives/Button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] p-4">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--error-base)]/10">
              <AlertTriangle className="h-8 w-8 text-[var(--error-base)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Algo deu errado</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            {this.state.error && (
              <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-[var(--bg-muted)] p-3 text-left text-xs text-[var(--text-secondary)]">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={this.handleGoHome}>
                Ir para início
              </Button>
              <Button variant="primary" size="sm" onClick={this.handleReload}>
                Recarregar
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
