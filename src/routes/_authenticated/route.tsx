import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, LogOut, KeyRound } from "lucide-react";
import { OfflineBanner } from "@/components/offline-banner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";
import { logAuthEvent } from "@/lib/audit.functions";
import { needsPasswordChange } from "@/lib/must-change-password";


type AppRole = "admin" | "gestor" | "user";

const ROLE_RANK: Record<AppRole, number> = {
  admin: 3,
  gestor: 2,
  user: 1,
};

function resolveHighestRole(rows: Array<{ role: string }> | null | undefined): AppRole {
  const valid = (rows ?? []).filter(
    (row): row is { role: AppRole } =>
      row.role === "admin" || row.role === "gestor" || row.role === "user",
  );
  if (valid.length === 0) return "user";
  return valid.reduce((best, row) =>
    ROLE_RANK[row.role] > ROLE_RANK[best] ? row.role : best,
  "user" as AppRole);
}

// In-memory cache of role per user id for the current tab session.
// Avoids re-querying user_roles on every navigation.
const roleCache = new Map<string, AppRole>();

async function getRoleCached(userId: string): Promise<AppRole> {
  const cached = roleCache.get(userId);
  if (cached) return cached;
  const { data: rows, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) {
    console.error("Falha ao carregar perfil de acesso:", error.message);
    throw error;
  }
  const role = resolveHighestRole(rows);
  roleCache.set(userId, role);
  return role;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // getSession() reads from localStorage (instant) instead of hitting the auth API.
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      throw redirect({ to: "/auth" });
    }

    // Conta bloqueada: encerra a sessão imediatamente.
    const { data: profile } = await supabase
      .from("profiles")
      .select("blocked")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.blocked) {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth" });
    }

    const role = await getRoleCached(user.id);
    const path = location.pathname;

    // Permissões por perfil aplicadas também na rota (não só no menu),
    // para bloquear acesso por URL direta a telas sensíveis.
    const blockedByRole: Record<AppRole, string[]> = {
      admin: [],
      // Gestor pode consultar as fichas cadastradas (somente leitura),
      // mas não cadastra fichas nem gerencia usuários.
      gestor: ["/nova-ficha", "/usuarios"],
      user: ["/painel", "/usuarios", "/logs"],
    };

    if (blockedByRole[role].some((prefix) => path.startsWith(prefix))) {
      throw redirect({ to: "/" });
    }

    return { user, role };
  },

  component: AuthenticatedLayout,
});


function AuthenticatedLayout() {
  const { session, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  // null = ainda não confirmado pelo servidor. A tela de troca obrigatória só
  // aparece quando o servidor confirma a marca (o token local pode estar
  // defasado após uma redefinição de senha).
  const [mustChange, setMustChange] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setMustChange(needsPasswordChange(data.user));
    });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);


  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setSaving(true);
    try {
      // 1) Troca a senha. O próprio servidor recusa se for igual à atual.
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("different from the old") || msg.includes("should be different")) {
          toast.error("A nova senha não pode ser igual à senha temporária. Escolha uma senha diferente.");
        } else if (msg.includes("weak") || msg.includes("pwned") || msg.includes("compromised")) {
          toast.error("Escolha uma senha mais forte — esta é muito comum ou vazada.");
        } else {
          toast.error(error.message || "Erro ao alterar a senha.");
        }
        setSaving(false);
        return;
      }

      // 2) Limpa a marca de troca obrigatória em chamada separada e confirma.
      const { error: metaErr } = await supabase.auth.updateUser({
        data: { must_change_password: false },
      });
      if (metaErr) throw metaErr;

      const { data: refreshed } = await supabase.auth.getUser();
      if (needsPasswordChange(refreshed.user)) {
        toast.error("Senha alterada, mas a exigência de troca não pôde ser removida. Entre em contato com o suporte.");
        setSaving(false);
        return;
      }

      await logAuthEvent({
        data: {
          action: "password_changed",
          email: refreshed.user?.email ?? null,
          userId: refreshed.user?.id ?? null,
        },
      }).catch(() => undefined);

      toast.success("Senha alterada com sucesso!");
      setMustChange(false);
      window.location.reload();

    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar a senha.");
    } finally {
      setSaving(false);
    }
  };

  if (mustChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm bg-card border border-border/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="text-center space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Alteração de Senha Obrigatória</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Por segurança, você deve definir uma nova senha no seu primeiro acesso.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={saving}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={saving}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" disabled={saving} className="w-full tech-gradient text-white border-0 h-9">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Alterando...
                  </>
                ) : (
                  "Alterar Senha"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => signOut()}
                className="w-full text-muted-foreground hover:text-foreground h-9"
                disabled={saving}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-12 items-center gap-2 border-b border-border bg-card/50 px-3">
            <SidebarTriggerWithTooltip />
            <span className="text-sm font-bold tracking-tight md:hidden">Notifica-MA Intelligence</span>
          </header>
          <OfflineBanner />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function SidebarTriggerWithTooltip() {
  const { state } = useSidebar();
  const label = state === "collapsed" ? "Expandir menu" : "Recolher menu";
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger aria-label={label} />
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

