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

export const Route = createFileRoute("/_authenticated/fichas/srag/")({
  head: () => ({ meta: [{ title: "Fichas — SRAG" }] }),
  component: FichasSragPage,
});

type CaseRow = {
  id: string;
  numero_ficha: string | null;
  nome_paciente: string;
  data_preenchimento: string;
  status: string;
  classificacao_final: string | null;
  evolucao: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  em_investigacao: "Em investigação",
  encerrado: "Encerrado",
};

const CLASSIF_LABEL: Record<string, string> = {
  srag_influenza: "SRAG por Influenza",
  srag_outros_virus_respiratorios: "Outros vírus respiratórios",
  srag_outros_agentes: "Outros agentes",
  srag_nao_especificada: "Não especificada",
};

const EVOL_LABEL: Record<string, string> = {
  alta_cura: "Alta / Cura",
  obito: "Óbito",
  ignorado: "Ignorado",
};

function FichasSragPage() {
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
        .from("srag_cases")
        .select("id, numero_ficha, nome_paciente, data_preenchimento, status, classificacao_final, evolucao, created_at")
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
          <h1 className="text-2xl font-bold mt-2">Fichas — SRAG</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link to="/nova-ficha/srag">
              <FilePlus className="w-4 h-4 mr-1" /> Nova ficha
            </Link>
          </Button>
          {canCreate && <CaseImporter agravo="srag" onImported={() => setReloadKey((k) => k + 1)} />}
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
              <Link to="/nova-ficha/srag"><FilePlus className="w-4 h-4 mr-1" /> Cadastrar primeira ficha</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº da Notificação</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Data preench.</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead>Evolução</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { window.location.href = `/fichas/srag/${r.id}`; }}>
                  <TableCell className="font-mono text-xs">{r.numero_ficha || "—"}</TableCell>
                  <TableCell className="font-medium">{r.nome_paciente}</TableCell>
                  <TableCell>{new Date(r.data_preenchimento).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    {r.classificacao_final ? (
                      <Badge variant={r.classificacao_final === "srag_influenza" ? "destructive" : "outline"}>
                        {CLASSIF_LABEL[r.classificacao_final] ?? r.classificacao_final}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.evolucao ? (EVOL_LABEL[r.evolucao] ?? r.evolucao) : <span className="text-muted-foreground">—</span>}
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
