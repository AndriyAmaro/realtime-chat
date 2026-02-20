import { useState, useRef } from 'react'
import { z } from 'zod'
import { Modal } from '@core/organisms/Modal'
import {
  Form,
  ControlledField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  SubmitButton,
  useFormWithSchema,
} from '@core/organisms/Form'
import { Input } from '@core/primitives/Input'
import { Avatar } from '@core/primitives/Avatar'
import { Button } from '@core/primitives/Button'
import { useAuthStore } from '@store/auth.store'
import { useUpdateProfile, useChangePassword } from '@hooks/useProfile'
import { uploadFile } from '@services/upload.service'
import { Camera, User, Lock, Trash2 } from 'lucide-react'

// ============ SCHEMAS ============

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

// ============ PROPS ============

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

// ============ COMPONENT ============

export function ProfileModal({ open, onOpenChange, onSuccess, onError }: ProfileModalProps) {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [section, setSection] = useState<'profile' | 'password'>('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileForm = useFormWithSchema({
    schema: profileSchema,
    defaultValues: { name: user?.name ?? '' },
  })

  const passwordForm = useFormWithSchema({
    schema: passwordSchema,
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onError?.('Selecione um arquivo de imagem')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      onError?.('A imagem deve ter no máximo 5MB')
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleRemoveAvatar() {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function onProfileSubmit(values: ProfileValues) {
    try {
      let avatarUrl: string | null | undefined

      if (avatarFile) {
        setUploading(true)
        const result = await uploadFile(avatarFile)
        avatarUrl = result.url
        setUploading(false)
      } else if (avatarPreview === null && user?.avatar) {
        // User explicitly removed avatar
        avatarUrl = null
      }

      await updateProfile.mutateAsync({
        name: values.name,
        ...(avatarUrl !== undefined ? { avatar: avatarUrl } : {}),
      })

      setAvatarFile(null)
      setAvatarPreview(null)
      onSuccess?.('Perfil atualizado com sucesso')
      onOpenChange(false)
    } catch (err) {
      setUploading(false)
      onError?.(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
    }
  }

  async function onPasswordSubmit(values: PasswordValues) {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      passwordForm.reset()
      onSuccess?.('Senha alterada com sucesso')
      setSection('profile')
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Erro ao alterar senha')
    }
  }

  const displayAvatar = avatarPreview ?? user?.avatar ?? undefined
  const isRemovingAvatar = avatarPreview === null && !avatarFile && user?.avatar

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header>
          <Modal.Title>Configurações do perfil</Modal.Title>
          <Modal.Description>Gerencie suas informações pessoais</Modal.Description>
        </Modal.Header>

        {/* Section tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-[var(--bg-subtle)] p-1">
          <button
            type="button"
            onClick={() => setSection('profile')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              section === 'profile'
                ? 'bg-[var(--bg-base)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Perfil
          </button>
          <button
            type="button"
            onClick={() => setSection('password')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              section === 'password'
                ? 'bg-[var(--bg-base)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            Senha
          </button>
        </div>

        {/* Profile section */}
        {section === 'profile' && (
          <Form form={profileForm} onSubmit={onProfileSubmit} className="space-y-5">
            <Modal.Body className="space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar
                    src={isRemovingAvatar ? undefined : displayAvatar}
                    fallback={user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
                    size="2xl"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary-500 hover:bg-primary-600 absolute right-0 bottom-0 rounded-full border-2 border-[var(--bg-base)] p-1.5 text-white transition-colors"
                    aria-label="Alterar foto"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </div>
                {(avatarPreview || user?.avatar) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="hover:text-error-base flex items-center gap-1 text-xs text-[var(--text-muted)] transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remover foto
                  </button>
                )}
              </div>

              {/* Name */}
              <ControlledField name="name" control={profileForm.control}>
                {({ field }) => (
                  <FormItem>
                    <FormLabel required>Nome</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Seu nome"
                        leftIcon={<User className="h-4 w-4" />}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              </ControlledField>

              {/* Email (read-only) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                  Email
                </label>
                <Input value={user?.email ?? ''} disabled />
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Modal.Close asChild>
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)]"
                >
                  Cancelar
                </button>
              </Modal.Close>
              <SubmitButton
                variant="primary"
                size="md"
                isSubmitting={profileForm.formState.isSubmitting || uploading}
                loadingText="Salvando..."
              >
                Salvar perfil
              </SubmitButton>
            </Modal.Footer>
          </Form>
        )}

        {/* Password section */}
        {section === 'password' && (
          <Form form={passwordForm} onSubmit={onPasswordSubmit} className="space-y-5">
            <Modal.Body className="space-y-4">
              <ControlledField name="currentPassword" control={passwordForm.control}>
                {({ field }) => (
                  <FormItem>
                    <FormLabel required>Senha atual</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Digite sua senha atual"
                        leftIcon={<Lock className="h-4 w-4" />}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              </ControlledField>

              <ControlledField name="newPassword" control={passwordForm.control}>
                {({ field }) => (
                  <FormItem>
                    <FormLabel required>Nova senha</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        leftIcon={<Lock className="h-4 w-4" />}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              </ControlledField>

              <ControlledField name="confirmPassword" control={passwordForm.control}>
                {({ field }) => (
                  <FormItem>
                    <FormLabel required>Confirmar nova senha</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Repita a nova senha"
                        leftIcon={<Lock className="h-4 w-4" />}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              </ControlledField>
            </Modal.Body>

            <Modal.Footer>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  passwordForm.reset()
                  setSection('profile')
                }}
              >
                Voltar
              </Button>
              <SubmitButton
                variant="primary"
                size="md"
                isSubmitting={passwordForm.formState.isSubmitting}
                loadingText="Alterando..."
              >
                Alterar senha
              </SubmitButton>
            </Modal.Footer>
          </Form>
        )}
      </Modal.Content>
    </Modal>
  )
}
