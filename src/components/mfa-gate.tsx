import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";

type Stage = "loading" | "ok" | "enroll" | "challenge";

/** Perfis obrigados a usar MFA (aal2). */
export const MFA_REQUIRED_ROLES = ["admin", "gestor"] as const;

export function mfaRequired(role: string | null | undefined): boolean {
  return role === "admin" || role === "gestor";
}

export function MfaGate({
  role,
  onSignOut,
  children,
}: {
  role: string | null;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const [stage, setStage] = useState<Stage>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!active) return;
      if (aal?.currentLevel === "aal2") return setStage("ok");
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verified = factors?.totp?.find((f) => f.status === "verified");
      if (verified) {
        setFactorId(verified.id);
        return setStage("challenge");
      }
      if (!mfaRequired(role)) return setStage("ok");
      // Remove cadastros incompletos antes de gerar um novo QR code.
      for (const f of factors?.all ?? []) {
        if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Autenticador ${Date.now()}`,
      });
      if (!active) return;
      if (error || !data) {
        toast.error("Não foi possível iniciar a verificação em duas etapas.");
        return;
      }
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStage("enroll");
    })();
    return () => {
      active = false;
    };
  }, [role]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || !/^\d{6}$/.test(code)) {
      toast.error("Digite o código de 6 dígitos do aplicativo.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setBusy(false);
    if (error) {
      toast.error("Código inválido ou expirado. Tente novamente.");
      setCode("");
      return;
    }
    toast.success("Verificação concluída.");
    setStage("ok");
  };

  if (stage === "ok") return <>{children}</>;
  if (stage === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border border-border/80 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {stage === "enroll" ? "Ative a verificação em duas etapas" : "Verificação em duas etapas"}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {stage === "enroll"
              ? "Escaneie o QR code com um aplicativo autenticador (Google Authenticator, Microsoft Authenticator etc.) e digite o código gerado."
              : "Digite o código de 6 dígitos exibido no seu aplicativo autenticador."}
          </p>
        </div>

        {stage === "enroll" && qr && (
          <div className="flex flex-col items-center gap-2">
            <img src={qr} alt="QR code para o aplicativo autenticador" className="w-44 h-44 rounded-md bg-background p-2 border border-border" />
            {secret && (
              <p className="text-[11px] text-muted-foreground text-center break-all">
                Ou digite a chave: <span className="font-mono text-foreground">{secret}</span>
              </p>
            )}
          </div>
        )}

        <form onSubmit={verify} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="mfa-code">Código</Label>
            <Input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              disabled={busy}
              className="h-9 text-center tracking-[0.4em] font-mono"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={busy} className="w-full h-9">
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Verificar
            </Button>
            <Button type="button" variant="ghost" onClick={onSignOut} disabled={busy} className="w-full h-9 text-muted-foreground">
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
