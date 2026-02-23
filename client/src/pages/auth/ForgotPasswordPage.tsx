import { useState } from 'react'
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
import { Input } from '@core/primitives/Input'
import { authService } from '@services/auth.service'
import { ApiError } from '@services/api'
import { Mail, CheckCircle } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)

  const form = useFormWithSchema({
    schema: forgotPasswordSchema,
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      setServerError(null)
      await authService.forgotPassword(values)
      setIsSent(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError('Ocorreu um erro. Tente novamente.')
      }
    }
  }

  if (isSent) {
    return (
      <AuthCard
        title="Email enviado"
        subtitle="Verifique sua caixa de entrada"
        footer={<AuthLink text="Voltar para" linkText="Login" href="/login" />}
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success-base)]/10">
            <CheckCircle className="h-8 w-8 text-[var(--success-base)]" />
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            Se este email estiver cadastrado, você receberá um link para redefinir sua senha. O link
            expira em 15 minutos.
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Esqueceu a senha?"
      subtitle="Digite seu email para receber um link de redefinição"
      className="space-y-8"
      footer={<AuthLink text="Lembrou a senha?" linkText="Voltar para Login" href="/login" />}
    >
      {serverError && (
        <div className="border-error-base/20 bg-error-base/5 text-error-base rounded-lg border px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      <Form form={form} onSubmit={onSubmit} size="lg" className="space-y-8">
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

        <SubmitButton
          variant="primary"
          size="lg"
          fullWidth
          isSubmitting={form.formState.isSubmitting}
          loadingText="Enviando..."
        >
          Enviar link de redefinição
        </SubmitButton>
      </Form>
    </AuthCard>
  )
}
