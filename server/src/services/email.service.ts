import { env } from '../config/env.js'
import { createChildLogger } from '../config/logger.js'

const log = createChildLogger('email')

interface SendResetEmailParams {
  to: string
  name: string
  resetLink: string
}

export const emailService = {
  async sendResetEmail({ to, name, resetLink }: SendResetEmailParams): Promise<void> {
    if (!env.RESEND_API_KEY) {
      log.info({ to, resetLink }, 'Reset email (no RESEND_API_KEY — logging link)')
      return
    }

    const { Resend } = await import('resend')
    const resend = new Resend(env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Pulse Chat <onboarding@resend.dev>',
      to,
      subject: 'Redefinir sua senha',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1a1a1a;">Olá, ${name}!</h2>
          <p style="color: #444; line-height: 1.6;">
            Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:
          </p>
          <a href="${resetLink}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Redefinir senha
          </a>
          <p style="color: #888; font-size: 14px; line-height: 1.5;">
            Este link expira em 15 minutos. Se você não solicitou a redefinição, ignore este email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 12px;">Pulse Chat</p>
        </div>
      `,
    })

    log.info({ to }, 'Reset email sent via Resend')
  },
}
