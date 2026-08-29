// Server-only: auditoria detalhada de tentativas de envio de e-mail.
// Nunca lança erro — auditoria não pode quebrar a operação principal.

export type EmailAttemptResult =
  | 'enviado'
  | 'bloqueado_dns'
  | 'suprimido'
  | 'erro'

export interface EmailAttemptLog {
  result: EmailAttemptResult
  template: string
  recipient: string
  /** Registros DNS ausentes no momento da tentativa. */
  dnsMissing?: string[]
  /** Horário da verificação de DNS utilizada. */
  dnsCheckedAt?: string
  errorMessage?: string
  actor?: { id?: string | null; email?: string | null; role?: string | null }
  entityId?: string | null
}

const RESULT_DESCRIPTION: Record<EmailAttemptResult, string> = {
  enviado: 'E-mail enviado',
  bloqueado_dns: 'Envio bloqueado: DNS do domínio de envio não propagado',
  suprimido: 'Envio bloqueado: destinatário na lista de supressão',
  erro: 'Falha no envio do e-mail',
}

export async function logEmailAttempt(entry: EmailAttemptLog): Promise<void> {
  try {
    const { supabaseAdmin } = await import(
      '@/integrations/supabase/client.server'
    )

    const parts = [
      RESULT_DESCRIPTION[entry.result],
      `modelo: ${entry.template}`,
      `destinatário: ${entry.recipient}`,
    ]
    if (entry.dnsMissing && entry.dnsMissing.length > 0) {
      parts.push(`registros faltando: ${entry.dnsMissing.join(', ')}`)
    }
    if (entry.errorMessage) parts.push(`erro: ${entry.errorMessage}`)

    await supabaseAdmin.from('system_logs').insert({
      action: `email_${entry.result}`,
      description: parts.join(' — '),
      user_id: entry.actor?.id ?? null,
      user_email: entry.actor?.email ?? null,
      user_role: entry.actor?.role ?? null,
      entity_type: 'email',
      entity_id: entry.entityId ?? null,
      metadata: {
        result: entry.result,
        template: entry.template,
        recipient: entry.recipient,
        dns_missing: entry.dnsMissing ?? [],
        dns_checked_at: entry.dnsCheckedAt ?? null,
        error_message: entry.errorMessage ?? null,
        attempted_at: new Date().toISOString(),
      } as never,
    })
  } catch {
    // silencioso por design
  }
}
