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

export const Route = createFileRoute("/_authenticated/fichas/coqueluche/")({
  head: () => ({ meta: [{ title: "Fichas — Coqueluche" }] }),
  component: FichasPage,
});

type CaseRow = {
  id: string;
  numero_ficha: string | null;
  nome_paciente: string;
  data_notificacao: string;
  status: string;
  classificacao_final: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  em_investigacao: "Em investigação",
  encerrado: "Encerrado",
};

const CLASSIF_LABEL: Record<string, string> = {
  confirmado: "Confirmado",
  descartado: "Descartado",
};

function FichasPage() {
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
        .from("coqueluche_cases")
        .select("id, numero_ficha, nome_paciente, data_notificacao, status, classificacao_final, created_at")
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
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="text-2xl font-bold mt-2">Fichas cadastradas</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link to="/nova-ficha/coqueluche">
              <FilePlus className="w-4 h-4 mr-1" /> Nova ficha
            </Link>
          </Button>
          {canCreate && <CaseImporter agravo="coqueluche" onImported={() => setReloadKey((k) => k + 1)} />}
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
              <Link to="/nova-ficha/coqueluche"><FilePlus className="w-4 h-4 mr-1" /> Cadastrar primeira ficha</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº da Notificação</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Data notif.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Classificação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.numero_ficha || "—"}</TableCell>
                  <TableCell className="font-medium">{r.nome_paciente}</TableCell>
                  <TableCell>{new Date(r.data_notificacao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "encerrado" ? "secondary" : "default"}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.classificacao_final ? (
                      <Badge variant={r.classificacao_final === "confirmado" ? "destructive" : "outline"}>
                        {CLASSIF_LABEL[r.classificacao_final]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
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
