import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Redefinir senha — Notifica-MA Intelligence" },
      {
        name: "description",
        content:
          "Defina uma nova senha para acessar o Notifica-MA Intelligence, plataforma estadual de monitoramento em saúde.",
      },
      { property: "og:title", content: "Redefinir senha — Notifica-MA Intelligence" },
      {
        property: "og:description",
        content: "Defina uma nova senha de acesso ao Notifica-MA Intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
        setLinkError(null);
      }
    });

    const run = async () => {
      // Link expirado/inválido: o Supabase devolve o erro no fragmento da URL.
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashError = hash.get("error_description") ?? hash.get("error");
      if (hashError) {
        setLinkError(
          "Este link de redefinição é inválido ou já expirou. Solicite um novo link na tela de login.",
        );
        return;
      }

      // Fluxo PKCE: troca o code da URL por uma sessão de recuperação.
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        if (error) {
          setLinkError(
            "Este link de redefinição é inválido ou já expirou. Solicite um novo link na tela de login.",
          );
          return;
        }
        setReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (active) setReady(Boolean(data.session));
    };

    void run();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("different from the old") || msg.includes("should be different")) {
        toast.error("A nova senha deve ser diferente da senha anterior.");
      } else if (msg.includes("weak") || msg.includes("pwned") || msg.includes("compromised")) {
        toast.error("Escolha uma senha mais forte — esta é muito comum ou vazada.");
      } else {
        toast.error("Não foi possível atualizar a senha. Solicite um novo link e tente de novo.");
      }
      return;
    }
    toast.success("Senha atualizada com sucesso");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Redefinir senha</h1>
        {!ready ? (
          <div className="bg-card border rounded-2xl p-6 text-sm text-muted-foreground text-center">
            Abra esta página pelo link enviado ao seu e-mail para definir uma nova senha.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-2xl p-6">
            <div>
              <label className="text-sm font-medium">Nova senha</label>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Confirmar nova senha</label>
              <input
                required
                type="password"
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
