import { useCallback, useState } from 'react'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface ToastData {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number
}

interface UseToastReturn {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => void
  dismissToast: (id: string) => void
}

let counter = 0

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${++counter}`
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, dismissToast }
}
