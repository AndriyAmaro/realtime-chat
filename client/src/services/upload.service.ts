import { useAuthStore } from '@store/auth.store'

interface UploadResult {
  url: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  isImage: boolean
}

/**
 * Upload a file to the server.
 * Uses FormData with multipart/form-data (not JSON).
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  const { accessToken } = useAuthStore.getState()

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/v1/uploads', {
    method: 'POST',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: 'include',
    body: formData,
  })

  const json = (await response.json()) as { success: boolean; data?: UploadResult; error?: string }

  if (!response.ok || !json.data) {
    throw new Error(json.error ?? 'Upload failed')
  }

  return json.data
}
