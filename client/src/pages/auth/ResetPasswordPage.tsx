import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthCard, AuthLink } from '@core/patterns/AuthCard'
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
import { PasswordInput } from '@core/patterns/PasswordInput'
import { authService } from '@services/auth.service'
import { ApiError } from '@services/api'
import { CheckCircle, AlertTriangle } from 'lucide-react'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useFormWithSchema({
    schema: resetPasswordSchema,
    defaultValues: { password: '', confirmPassword: '' },
  })

  // Auto-redirect to login after success
  useEffect(() => {
    if (!isSuccess) return
    const timer = setTimeout(() => navigate('/login', { replace: true }), 3000)
    return () => clearTimeout(timer)
  }, [isSuccess, navigate])

  if (!token) {
    return (
      <AuthCard
        title="Link inválido"
        subtitle="O link de redefinição está incompleto"
        footer={<AuthLink text="Voltar para" linkText="Login" href="/login" />}
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--error-base)]/10">
            <AlertTriangle className="h-8 w-8 text-[var(--error-base)]" />
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            O link que você usou não contém um token válido. Solicite um novo link de redefinição.
          </p>
        </div>
      </AuthCard>
    )
  }

  if (isSuccess) {
    return (
      <AuthCard
        title="Senha redefinida"
        subtitle="Sua senha foi alterada com sucesso"
        footer={<AuthLink text="Ir para" linkText="Login" href="/login" />}
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success-base)]/10">
            <CheckCircle className="h-8 w-8 text-[var(--success-base)]" />
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            Você será redirecionado para o login em instantes...
          </p>
        </div>
      </AuthCard>
    )
  }

  async function onSubmit(values: ResetPasswordValues) {
    try {
      setServerError(null)
      await authService.resetPassword({ token: token!, password: values.password })
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setServerError('Este link expirou ou já foi utilizado. Solicite um novo.')
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
      title="Redefinir senha"
      subtitle="Crie uma nova senha para sua conta"
      className="space-y-8"
      footer={<AuthLink text="Lembrou a senha?" linkText="Voltar para Login" href="/login" />}
    >
      {serverError && (
        <div className="border-error-base/20 bg-error-base/5 text-error-base rounded-lg border px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      <Form form={form} onSubmit={onSubmit} size="lg" className="space-y-8">
        <div className="space-y-5">
          <ControlledField name="password" control={form.control}>
            {({ field }) => (
              <FormItem>
                <FormLabel>Nova senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="Crie uma nova senha"
                    inputSize="lg"
                    showStrength
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          </ControlledField>

          <ControlledField name="confirmPassword" control={form.control}>
            {({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="Confirme a nova senha"
                    inputSize="lg"
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
          loadingText="Redefinindo..."
        >
          Redefinir senha
        </SubmitButton>
      </Form>
    </AuthCard>
  )
}
