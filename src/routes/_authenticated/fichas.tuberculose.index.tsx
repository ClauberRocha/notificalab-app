import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, FilePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CaseImporter } from "@/components/case-importer";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/fichas/tuberculose/")({
  head: () => ({ meta: [{ title: "Fichas — Tuberculose" }] }),
  component: FichasTuberculosePage,
});

type CaseRow = {
  id: string;
  numero_ficha: string | null;
  nome_paciente: string;
  data_notificacao: string;
  status: string;
  forma: string | null;
  tipo_entrada: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  em_investigacao: "Em investigação",
  encerrado: "Encerrado",
};

const FORMA_LABEL: Record<string, string> = {
  pulmonar: "Pulmonar",
  extrapulmonar: "Extrapulmonar",
  pulmonar_extrapulmonar: "Pulmonar + Extrap.",
};

const ENTRADA_LABEL: Record<string, string> = {
  caso_novo: "Caso novo",
  recidiva: "Recidiva",
  reingresso_apos_abandono: "Reingresso",
  nao_sabe: "Não sabe",
  transferencia: "Transferência",
  pos_obito: "Pós-óbito",
};

function FichasTuberculosePage() {
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { can } = useAuth();
  const canCreate = can("fichas.create");
  const canImport = canCreate || can("fichas.edit");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("tuberculose_cases")
        .select("id, numero_ficha, nome_paciente, data_notificacao, status, forma, tipo_entrada, created_at")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) setError(error.message);
      else setRows((data ?? []) as CaseRow[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/fichas" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="text-2xl font-bold mt-2">Fichas — Tuberculose</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link to="/nova-ficha/tuberculose">
              <FilePlus className="w-4 h-4 mr-1" /> Nova ficha
            </Link>
          </Button>
          {canImport && <CaseImporter agravo="tuberculose" onImported={() => setReloadKey((k) => k + 1)} />}
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">{error}</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma ficha cadastrada ainda.</p>
            <Button asChild>
              <Link to="/nova-ficha/tuberculose"><FilePlus className="w-4 h-4 mr-1" /> Cadastrar primeira ficha</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº da Notificação</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Data notif.</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Tipo entrada</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { window.location.href = `/fichas/tuberculose/${r.id}`; }}>
                  <TableCell className="font-mono text-xs">{r.numero_ficha || "—"}</TableCell>
                  <TableCell className="font-medium">{r.nome_paciente}</TableCell>
                  <TableCell>{new Date(r.data_notificacao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-sm">
                    {r.forma ? (FORMA_LABEL[r.forma] ?? r.forma) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.tipo_entrada ? (ENTRADA_LABEL[r.tipo_entrada] ?? r.tipo_entrada) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.status === "encerrado" ? "secondary" : "default"}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
