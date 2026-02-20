import { useMutation } from '@tanstack/react-query'
import { authService } from '@services/auth.service'
import { useAuthStore } from '@store/auth.store'
import type { UpdateProfilePayload, ChangePasswordPayload } from '@services/auth.service'

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authService.updateProfile(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
  })
}
