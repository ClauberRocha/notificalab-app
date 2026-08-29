// Server-only: geração/reenvio de senha temporária com validação de DNS.

export type TempPasswordEmailStatus =
  | "sent"
  | "dns_pending"
  | "suppressed"
  | "error"
  | "no_email";

export interface IssueTempPasswordResult {
  id: string;
  email: string | null;
  password: string;
  emailStatus: TempPasswordEmailStatus;
  dnsMissing: string[];
}

/** Senha temporária legível (fácil de ditar) e forte o bastante. */
export function generateReadablePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const symbols = "!@#$%&*";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  let core = "";
  for (let i = 0; i < 10; i++) core += alphabet[bytes[i]! % alphabet.length];
  const symbol = symbols[bytes[10]! % symbols.length];
  const digits = String(((bytes[11]! << 8) | bytes[12]!) % 100).padStart(2, "0");
  return `${core.slice(0, 5)}-${core.slice(5)}${symbol}${digits}`;
}

/**
 * Define uma nova senha temporária para o usuário, marca troca obrigatória
 * e tenta avisar por e-mail (bloqueado quando o DNS público não está pronto).
 */
export async function issueTemporaryPassword(
  userId: string,
  actor: { id: string; email?: string | null; role?: string | null },
): Promise<IssueTempPasswordResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const tempPassword = generateReadablePassword();

  const { data: updated, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    {
      password: tempPassword,
      user_metadata: { must_change_password: true },
    },
  );
  if (error) throw new Error(error.message);

  const targetEmail = updated.user?.email ?? null;
  let emailStatus: TempPasswordEmailStatus = targetEmail ? "sent" : "no_email";
  let dnsMissing: string[] = [];

  if (targetEmail) {
    try {
      const { sendTemplateEmail } = await import(
        "@/lib/email-templates/send-email"
      );
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();

      const result = await sendTemplateEmail("temp-password", targetEmail, {
        templateData: {
          fullName: profile?.full_name ?? null,
          loginUrl: "https://notificalab.consulti.slz.br/auth",
        },
        idempotencyKey: `temp-password-${userId}-${Date.now()}`,
      });

      if (result.sent) {
        emailStatus = "sent";
      } else if (result.reason === "sender_dns_not_ready") {
        emailStatus = "dns_pending";
        dnsMissing = result.missing;
      } else {
        emailStatus = "suppressed";
      }
    } catch (e) {
      console.error("Falha ao enviar e-mail de senha temporária:", e);
      emailStatus = "error";
      const { logEmailAttempt } = await import("@/lib/email-audit.server");
      await logEmailAttempt({
        result: "erro",
        template: "temp-password",
        recipient: targetEmail,
        errorMessage: e instanceof Error ? e.message : String(e),
        actor,
        entityId: userId,
      });
    }
  }

  return {
    id: userId,
    email: targetEmail,
    password: tempPassword,
    emailStatus,
    dnsMissing,
  };
}
