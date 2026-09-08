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

export const Route = createFileRoute("/_authenticated/fichas/epizootia/")({
  head: () => ({ meta: [{ title: "Fichas — Epizootia" }] }),
  component: FichasEpizootiaPage,
});

type CaseRow = {
  id: string;
  numero_ficha: string | null;
  municipio_notificacao: string;
  data_notificacao: string;
  status: string;
  ambiente: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  em_investigacao: "Em investigação",
  encerrado: "Encerrado",
};

function FichasEpizootiaPage() {
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
        .from("epizootia_cases")
        .select("id, numero_ficha, municipio_notificacao, data_notificacao, status, ambiente, created_at")
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
          <h1 className="text-2xl font-bold mt-2">Fichas — Epizootia</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link to="/nova-ficha/epizootia">
              <FilePlus className="w-4 h-4 mr-1" /> Nova ficha
            </Link>
          </Button>
          {canImport && <CaseImporter agravo="epizootia" onImported={() => setReloadKey((k) => k + 1)} />}
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
              <Link to="/nova-ficha/epizootia"><FilePlus className="w-4 h-4 mr-1" /> Cadastrar primeira ficha</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº da Notificação</TableHead>
                <TableHead>Município</TableHead>
                <TableHead>Data notif.</TableHead>
                <TableHead>Ambiente</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { window.location.href = `/fichas/epizootia/${r.id}`; }}>
                  <TableCell className="font-mono text-xs">{r.numero_ficha || "—"}</TableCell>
                  <TableCell className="font-medium">{r.municipio_notificacao}</TableCell>
                  <TableCell>{new Date(r.data_notificacao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.ambiente ?? "—"}</TableCell>
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
