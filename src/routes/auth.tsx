import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { logAuthEvent } from "@/lib/audit.functions";
import { loginSuccessFeedback, needsPasswordChange } from "@/lib/must-change-password";



export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Notifica-MA Intelligence" },
      { name: "description", content: "Acesse sua conta no Notifica-MA Intelligence — Plataforma Estadual de Monitoramento e Decisão em Saúde." },
    ],
  }),
  component: AuthPage,
});

type AuthErrorType = "credentials" | "rate_limit" | "network" | "unknown";

const errorMessages: Record<AuthErrorType, string> = {
  credentials:
    "E-mail ou senha incorretos. Verifique os dados e tente novamente. Se esqueceu a senha, clique em \"Esqueci minha senha\" para redefini-la.",
  rate_limit:
    "Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar novamente.",
  network:
    "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.",
  unknown:
    "Não foi possível entrar. Verifique os dados e tente novamente.",
};

function classifyAuthError(err: unknown): AuthErrorType {
  if (!(err instanceof Error)) return "unknown";
  const msg = err.message.toLowerCase();
  if (
    msg.includes("invalid login credentials") ||
    msg.includes("invalid email or password") ||
    msg.includes("user not found") ||
    msg.includes("email not confirmed") ||
    msg.includes("invalid credentials")
  ) {
    return "credentials";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests") || msg.includes("over_email_send_rate_limit")) {
    return "rate_limit";
  }
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")) {
    return "network";
  }
  return "unknown";
}

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthErrorType | null>(null);
  const [mode, setMode] = useState<"login" | "recovery">("login");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      void logAuthEvent({
        data: { action: "login", email, userId: data.user?.id ?? null },
      });
      // Confere a marca de troca obrigatória direto no servidor para dar um
      // retorno preciso sobre pendências.
      const { data: fresh } = await supabase.auth.getUser();
      const feedback = loginSuccessFeedback(fresh.user ?? data.user);
      toast.success(feedback.title, { description: feedback.description });
      navigate({ to: "/" });

    } catch (err) {
      const type = classifyAuthError(err);
      setAuthError(type);
      toast.error(errorMessages[type]);
      void logAuthEvent({
        data: { action: "login_failed", email, reason: `motivo: ${type}` },
      });
    } finally {
      setLoading(false);
    }
  };
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      toast.error("Informe seu e-mail para receber o link de redefinição");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      const type = classifyAuthError(error);
      // Não revelamos se o e-mail existe; só sinalizamos limite/rede.
      if (type === "rate_limit" || type === "network") {
        toast.error(errorMessages[type]);
        return;
      }
    }
    void logAuthEvent({
      data: { action: "password_reset_requested", email: recoveryEmail },
    });
    setRecoverySent(true);
  };




  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Não foi possível entrar com Google");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img
            src="/logo-ses.png?v=2"
            alt="Governo do Maranhão"
            className="h-20 mx-auto mb-6 object-contain"
          />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Notifica-MA Intelligence
          </h1>
          <p className="text-xs text-primary font-medium mt-1">
            Plataforma Estadual de Monitoramento e Decisão em Saúde
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-4">
            {mode === "recovery" ? "Recuperar senha" : "Entrar"}
          </h2>
        </div>

        {mode === "recovery" ? (
          recoverySent ? (
            <div className="space-y-4 bg-card border rounded-2xl p-6 text-sm">
              <p className="text-foreground">
                Se o e-mail <strong>{recoveryEmail}</strong> estiver cadastrado, enviamos um
                link para redefinir sua senha. O link é válido por tempo limitado e pode ser
                usado uma única vez.
              </p>
              <p className="text-muted-foreground text-xs">
                Não recebeu? Verifique a caixa de spam ou tente novamente em alguns minutos.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRecoverySent(false);
                  setMode("login");
                }}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Voltar para o login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 bg-card border rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">
                Informe o e-mail cadastrado e enviaremos um link para você criar uma nova senha.
              </p>
              <div>
                <label className="text-sm font-medium" htmlFor="recovery-email">E-mail</label>
                <input
                  id="recovery-email"
                  required
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="voce@exemplo.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full text-xs text-primary hover:underline"
              >
                Voltar para o login
              </button>
            </form>
          )
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-2xl p-6">
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="voce@exemplo.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Senha</label>
            <div className="relative mt-1">
              <input
                required
                minLength={6}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 pr-10 py-2 text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {authError && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
            >
              {errorMessages[authError]}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setRecoveryEmail(email);
              setRecoverySent(false);
              setAuthError(null);
              setMode("recovery");
            }}
            className="text-xs text-primary hover:underline"
          >
            Esqueci minha senha
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Aguarde..." : "Entrar"}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
          >
            Continuar com Google
          </button>

          <p className="text-center text-xs text-muted-foreground">
            O acesso é concedido apenas por administradores. Fale com a
            coordenação para solicitar sua conta.
          </p>

        </form>
        )}


        <footer className="mt-6 text-center text-xs text-muted-foreground/70 space-y-0.5">
          <p>Desenvolvido por GERTEC/ConsulTI</p>
          <p>+55 (98) 98600-1270</p>
          <p>v. {import.meta.env.VITE_APP_VERSION ?? "1.0.0"}</p>
        </footer>
      </div>
    </div>
  );
}
