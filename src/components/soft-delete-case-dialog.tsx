import { useState, type ReactElement } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deletionReasonSchema } from "@/lib/case-lifecycle";
import { logAction } from "@/lib/log-service";

export function SoftDeleteCaseDialog({ table, id, children, onDeleted }: {
  table: string; id: string; children: ReactElement; onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();
  async function remove() {
    const parsed = deletionReasonSchema.safeParse(reason);
    if (!parsed.success) { toast.error("Informe o motivo da exclusão."); return; }
    setPending(true);
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Entre novamente para excluir a ficha.");
      const { data, error } = await supabase.from(table as never)
        .update({ deleted_at: new Date().toISOString(), deleted_by: auth.user.id, motivo_exclusao: parsed.data } as never)
        .eq("id", id).is("deleted_at", null).select("id").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Ficha indisponível ou exclusão não permitida.");
      await logAction({ action: "delete", entity_type: table, entity_id: id, description: "Exclusão lógica de ficha" });
      await queryClient.invalidateQueries();
      setOpen(false);
      toast.success("Ficha excluída. Registro preservado para auditoria.");
      onDeleted?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir a ficha.");
    } finally { setPending(false); }
  }
  return <Dialog open={open} onOpenChange={(next) => { if (pending) return; setOpen(next); if (next) setReason(""); }}>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Excluir ficha?</DialogTitle>
        <DialogDescription>A ficha sairá das listas e dos relatórios. O registro, o motivo e o responsável serão preservados.</DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Label htmlFor={`delete-reason-${id}`}>Motivo da exclusão</Label>
        <Textarea id={`delete-reason-${id}`} value={reason} onChange={(event) => setReason(event.target.value)} disabled={pending} required />
      </div>
      <DialogFooter>
        <Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>Cancelar</Button>
        <Button variant="destructive" disabled={pending || !reason.trim()} onClick={remove}>
          {pending && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar exclusão
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}