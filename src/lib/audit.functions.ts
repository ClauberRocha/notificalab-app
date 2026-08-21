import { createServerFn } from "@tanstack/react-start";

/**
 * Ações de auditoria de autenticação/segurança.
 * Este endpoint é público por necessidade (tentativas de login falhas não têm
 * sessão), portanto: ações são restritas a uma allowlist, textos são truncados
 * e nenhum dado sensível (senha, token) é aceito ou gravado.
 */
export const AUTH_AUDIT_ACTIONS = [
  "login",
  "login_failed",
  "logoff",
  "password_reset_requested",
  "password_reset_completed",
  "password_changed",
] as const;

export type AuthAuditAction = (typeof AUTH_AUDIT_ACTIONS)[number];

type AuthAuditInput = {
  action: AuthAuditAction;
  email?: string | null;
  userId?: string | null;
  reason?: string | null;
};

function clean(value: string | null | undefined, max: number): string | null {
  if (!value) return null;
  return value.trim().slice(0, max) || null;
}

const DESCRIPTIONS: Record<AuthAuditAction, string> = {
  login: "Login realizado com sucesso",
  login_failed: "Tentativa de login malsucedida",
  logoff: "Encerramento de sessão",
  password_reset_requested: "Solicitação de redefinição de senha por e-mail",
  password_reset_completed: "Redefinição de senha concluída via link de e-mail",
  password_changed: "Senha alterada pelo próprio usuário",
};

export const logAuthEvent = createServerFn({ method: "POST" })
  .inputValidator((input: AuthAuditInput) => {
    if (!AUTH_AUDIT_ACTIONS.includes(input?.action)) {
      throw new Error("Ação de auditoria inválida");
    }
    return {
      action: input.action,
      email: clean(input.email, 160),
      userId: clean(input.userId, 40),
      reason: clean(input.reason, 120),
    } satisfies AuthAuditInput;
  })
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import(
        "@/integrations/supabase/client.server"
      );

      let userName: string | null = null;
      let userRole: string | null = null;

      if (data.userId) {
        const [{ data: profile }, { data: roles }] = await Promise.all([
          supabaseAdmin
            .from("profiles")
            .select("full_name")
            .eq("id", data.userId)
            .maybeSingle(),
          supabaseAdmin
            .from("user_roles")
            .select("role")
            .eq("user_id", data.userId),
        ]);
        userName = profile?.full_name ?? null;
        const list = (roles ?? []) as Array<{ role: string }>;
        userRole =
          list.find((r) => r.role === "admin")?.role ??
          list.find((r) => r.role === "gestor")?.role ??
          list[0]?.role ??
          null;
      }

      const description = data.reason
        ? `${DESCRIPTIONS[data.action]} — ${data.reason}`
        : DESCRIPTIONS[data.action];

      await supabaseAdmin.from("system_logs").insert({
        action: data.action,
        description,
        user_id: data.userId ?? null,
        user_name: userName,
        user_email: data.email ?? null,
        user_role: userRole,
        entity_type: "auth",
        entity_id: null,
        metadata: null as never,
      });
    } catch {
      // auditoria nunca deve quebrar o fluxo do usuário
    }
    return { ok: true };
  });
