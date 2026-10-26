import { useEffect, useState, type ReactNode } from "react";
import { Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { CONFIDENTIALITY_TERM, hasAcceptedCurrentTerm } from "@/lib/confidentiality-term";

export function ConfidentialityGate({ userId, onSignOut, children }: {
  userId: string;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const [acceptedFor, setAcceptedFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const acceptanceKey = `${userId}:${CONFIDENTIALITY_TERM.version}`;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setAcceptedFor(null);
    setError(null);
    (async () => {
      try {
        const { data, error: readError } = await supabase.from("aceites_termo")
          .select("user_id, versao_termo")
          .eq("user_id", userId).eq("versao_termo", CONFIDENTIALITY_TERM.version).maybeSingle();
        if (readError) throw readError;
        if (active && hasAcceptedCurrentTerm(data, userId)) setAcceptedFor(acceptanceKey);
      } catch {
        if (active) setError("Não foi possível verificar o aceite. Tente novamente para continuar.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [userId, acceptanceKey, attempt]);

  async function accept() {
    setSaving(true);
    setError(null);
    try {
      const { error: writeError } = await supabase.from("aceites_termo")
        .insert({ user_id: userId, versao_termo: CONFIDENTIALITY_TERM.version });
      // Another tab may already have accepted this version; always read it back.
      if (writeError && writeError.code !== "23505") throw writeError;
      const { data, error: readError } = await supabase.from("aceites_termo")
        .select("user_id, versao_termo")
        .eq("user_id", userId).eq("versao_termo", CONFIDENTIALITY_TERM.version).maybeSingle();
      if (readError || !hasAcceptedCurrentTerm(data, userId)) throw readError ?? new Error("Aceite não confirmado");
      setAcceptedFor(acceptanceKey);
    } catch {
      setError("Não foi possível confirmar o aceite. Tente novamente; o acesso permanece bloqueado.");
    } finally {
      setSaving(false);
    }
  }

  if (acceptedFor === acceptanceKey) return <>{children}</>;
  return (
    <div className="min-h-screen bg-background">
      <Dialog open>
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-2xl max-h-[90dvh] flex flex-col [&>button]:hidden"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Termo de confidencialidade</DialogTitle>
            <DialogDescription>Versão {CONFIDENTIALITY_TERM.version}</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto min-h-0 space-y-4 text-sm leading-relaxed text-foreground">
            {CONFIDENTIALITY_TERM.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={onSignOut} disabled={saving}><LogOut className="h-4 w-4 mr-2" />Sair</Button>
            {error && <Button variant="outline" onClick={() => setAttempt((value) => value + 1)} disabled={loading || saving}>Tentar novamente</Button>}
            <Button onClick={accept} disabled={loading || saving || Boolean(error)}>
              {(loading || saving) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Li e aceito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}