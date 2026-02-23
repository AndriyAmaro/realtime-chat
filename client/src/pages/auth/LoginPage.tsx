import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { Mail } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useFormWithSchema({
    schema: loginSchema,
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginValues) {
    try {
      setServerError(null)
      const data = await authService.login(values)
      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate('/chat', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError('Ocorreu um erro. Tente novamente.')
      }
    }
  }

  async function handleDemoLogin() {
    try {
      setServerError(null)
      const data = await authService.login({
        email: 'andriy@example.com',
        password: 'password123',
      })
      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate('/chat', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError('Ocorreu um erro. Tente novamente.')
      }
    }
  }

  return (
    <AuthCard
      title="Bem-vindo de volta"
      subtitle="Entre na sua conta para continuar"
      className="space-y-8"
      footer={<AuthLink text="Não tem uma conta?" linkText="Criar conta" href="/register" />}
    >
      {serverError && (
        <div className="border-error-base/20 bg-error-base/5 text-error-base rounded-lg border px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      <Form form={form} onSubmit={onSubmit} size="lg" className="space-y-8">
        <div className="space-y-5">
          <ControlledField name="email" control={form.control}>
            {({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="Sua senha"
                    inputSize="lg"
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          </ControlledField>
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-[var(--primary-500)] transition-colors hover:text-[var(--primary-600)]"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <SubmitButton
          variant="primary"
          size="lg"
          fullWidth
          isSubmitting={form.formState.isSubmitting}
          loadingText="Entrando..."
        >
          Entrar
        </SubmitButton>
      </Form>

      <AuthDivider text="Ou" />

      <button
        type="button"
        onClick={handleDemoLogin}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-muted)]"
      >
        Entrar como Demo
      </button>

      <SocialLoginButtons providers={['google', 'github']} variant="compact" disabled />
    </AuthCard>
  )
}
