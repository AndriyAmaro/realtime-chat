import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthCard, AuthDivider, AuthLink } from '@core/patterns/AuthCard'
import { SocialLoginButtons } from '@core/patterns/SocialLoginButtons'
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
import { PasswordInput } from '@core/patterns/PasswordInput'
import { authService } from '@services/auth.service'
import { useAuthStore } from '@store/auth.store'
import { ApiError } from '@services/api'
import { Mail, User } from 'lucide-react'

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useFormWithSchema({
    schema: registerSchema,
    defaultValues: { name: '', email: '', password: '' },
  })

  async function onSubmit(values: RegisterValues) {
    try {
      setServerError(null)
      const data = await authService.register(values)
      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate('/chat', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setServerError('Este email já está registrado.')
        } else if (err.status === 422 && err.data) {
          const fieldErrors = err.data as Record<string, string[]>
          for (const [field, messages] of Object.entries(fieldErrors)) {
            if (field in registerSchema.shape) {
              form.setError(field as keyof RegisterValues, {
                message: messages[0],
              })
            }
          }
        } else {
          setServerError(err.message)
        }
      } else {
        setServerError('Ocorreu um erro. Tente novamente.')
      }
    }
  }

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Comece a conversar em tempo real"
      className="space-y-8"
      footer={<AuthLink text="Já tem uma conta?" linkText="Entrar" href="/login" />}
    >
      {serverError && (
        <div className="border-error-base/20 bg-error-base/5 text-error-base rounded-lg border px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      <Form form={form} onSubmit={onSubmit} size="lg" className="space-y-8">
        <div className="space-y-5">
          <ControlledField name="name" control={form.control}>
            {({ field }) => (
              <FormItem>
                <FormLabel required>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Seu nome"
                    leftIcon={<User className="h-4 w-4" />}
                    inputSize="lg"
                    autoComplete="name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          </ControlledField>

          <ControlledField name="email" control={form.control}>
            {({ field }) => (
              <FormItem>
                <FormLabel required>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="seu@email.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                    inputSize="lg"
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          </ControlledField>

          <ControlledField name="password" control={form.control}>
            {({ field }) => (
              <FormItem>
                <FormLabel required>Senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="Crie uma senha"
                    inputSize="lg"
                    showStrength
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          </ControlledField>
        </div>

        <SubmitButton
          variant="primary"
          size="lg"
          fullWidth
          isSubmitting={form.formState.isSubmitting}
          loadingText="Criando conta..."
        >
          Criar conta
        </SubmitButton>
      </Form>

      <AuthDivider text="Ou" />

      <SocialLoginButtons providers={['google', 'github']} variant="compact" disabled />
    </AuthCard>
  )
}
