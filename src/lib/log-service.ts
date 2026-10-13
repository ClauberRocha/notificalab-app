import { supabase } from "@/integrations/supabase/client";
import { recordCaseAudit } from "@/lib/case-audit.functions";

export type LogAction =
  | "login"
  | "logoff"
  | "create"
  | "update"
  | "delete"
  | "view_case"
  | "export_pdf"
  | "export_csv"
  | "invite_user"
  | "block_user"
  | "other";

export interface LogInput {
  action: LogAction;
  description?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
}

export async function logAction(input: LogInput): Promise<void> {
  try {
    if (["view_case", "export_pdf", "export_csv", "delete"].includes(input.action)) {
      await recordCaseAudit({ data: input });
      return;
    }
    const { data: auth } = await supabase.auth.getUser();
    const u = auth.user;

    let user_role: string | null = null;
    if (u) {
      const { data: roles } = await supabase
        .from("user_roles" as never)
        .select("role")
        .eq("user_id", u.id);
      const list = (roles ?? []) as Array<{ role: string }>;
      user_role = list.find((r) => r.role === "admin")?.role ?? list[0]?.role ?? null;
    }

    const user_name =
      (u?.user_metadata?.full_name as string | undefined) ||
      (u?.user_metadata?.name as string | undefined) ||
      u?.email?.split("@")[0] ||
      null;

    await (supabase.from("system_logs" as never) as unknown as {
      insert: (row: Record<string, unknown>) => Promise<unknown>;
    }).insert({
      action: input.action,
      description: input.description ?? null,
      user_id: u?.id ?? null,
      user_name,
      user_email: u?.email ?? null,
      user_role,
      entity_type: input.entity_type ?? null,
      entity_id: input.entity_id ?? null,
      metadata: input.metadata ?? null,
    });
  } catch {
    // logging must never break user flows
  }
}
