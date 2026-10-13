import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { CASE_TABLES } from "./case-lifecycle";

const auditSchema = z.object({
  action: z.enum(["view_case", "export_pdf", "export_csv", "delete"]),
  entity_type: z.enum([...CASE_TABLES, "painel"]),
  entity_id: z.string().uuid().optional(),
  description: z.string().max(240).optional(),
  metadata: z.object({
    agravo: z.string().max(80).optional(),
    quantidade: z.number().int().nonnegative().optional(),
    tipo: z.string().max(80).optional(),
  }).optional(),
});

export const recordCaseAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => auditSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (data.action === "view_case" && (!data.entity_id || data.entity_type === "painel")) {
      throw new Error("Ficha inválida.");
    }
    if (data.entity_id && data.entity_type !== "painel") {
      const { data: row, error } = await context.supabase.from(data.entity_type)
        .select("id").eq("id", data.entity_id).maybeSingle();
      if (error || !row) throw new Error("Ficha indisponível.");
    }
    const [{ data: profile }, { data: roles }] = await Promise.all([
      context.supabase.from("profiles").select("full_name, email").eq("id", context.userId).maybeSingle(),
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
    ]);
    const role = roles?.find((r) => r.role === "admin")?.role ?? roles?.find((r) => r.role === "gestor")?.role ?? roles?.[0]?.role ?? null;
    const { error } = await context.supabase.from("system_logs").insert({
      action: data.action,
      description: data.description ?? data.action,
      user_id: context.userId,
      user_name: profile?.full_name ?? null,
      user_email: profile?.email ?? null,
      user_role: role,
      entity_type: data.entity_type,
      entity_id: data.entity_id ?? null,
      metadata: data.metadata ?? null,
    });
    if (error) throw new Error("Não foi possível registrar a auditoria.");
    return { ok: true };
  });