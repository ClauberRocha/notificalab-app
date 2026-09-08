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

export const Route = createFileRoute("/_authenticated/fichas/hanseniase/")({
  head: () => ({ meta: [{ title: "Fichas — Hanseníase" }] }),
  component: FichasHanseniasePage,
});

type CaseRow = {
  id: string;
  numero_ficha: string | null;
  nome_paciente: string;
  data_notificacao: string;
  status: string;
  classificacao_operacional: string | null;
  forma_clinica: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  em_investigacao: "Em investigação",
  encerrado: "Encerrado",
};

const CLASSIF_OP_LABEL: Record<string, string> = {
  PB: "Paucibacilar",
  MB: "Multibacilar",
};

const FORMA_LABEL: Record<string, string> = {
  I: "Indeterminada",
  T: "Tuberculoide",
  D: "Dimorfa",
  V: "Virchowiana",
  nao_classificado: "Não classificado",
};

function FichasHanseniasePage() {
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { can } = useAuth();
  const canCreate = can("fichas.create");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("hanseniase_cases")
        .select("id, numero_ficha, nome_paciente, data_notificacao, status, classificacao_operacional, forma_clinica, created_at")
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
          <h1 className="text-2xl font-bold mt-2">Fichas — Hanseníase</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link to="/nova-ficha/hanseniase">
              <FilePlus className="w-4 h-4 mr-1" /> Nova ficha
            </Link>
          </Button>
          {canCreate && <CaseImporter agravo="hanseniase" onImported={() => setReloadKey((k) => k + 1)} />}
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
              <Link to="/nova-ficha/hanseniase"><FilePlus className="w-4 h-4 mr-1" /> Cadastrar primeira ficha</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº da Notificação</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Data notif.</TableHead>
                <TableHead>Forma clínica</TableHead>
                <TableHead>Classif.</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { window.location.href = `/fichas/hanseniase/${r.id}`; }}>
                  <TableCell className="font-mono text-xs">{r.numero_ficha || "—"}</TableCell>
                  <TableCell className="font-medium">{r.nome_paciente}</TableCell>
                  <TableCell>{new Date(r.data_notificacao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    {r.forma_clinica ? (
                      <span className="text-sm">{FORMA_LABEL[r.forma_clinica] ?? r.forma_clinica}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.classificacao_operacional ? (
                      <Badge variant="outline">
                        {CLASSIF_OP_LABEL[r.classificacao_operacional] ?? r.classificacao_operacional}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
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
