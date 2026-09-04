import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, FilePlus, Loader2 } from "lucide-react";
import { DengueChikImporter } from "@/components/dengue-chik-importer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

type CaseRow = {
  id: string;
  numero_ficha: string | null;
  nome_paciente: string;
  data_notificacao: string;
  status: string;
  classificacao: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  em_investigacao: "Em Aberto",
  encerrado: "Encerrado",
};

const CLASSIF_LABEL: Record<string, string> = {
  descartado: "Descartado",
  dengue: "Dengue",
  dengue_sinais_alarme: "Dengue c/ alarme",
  dengue_grave: "Dengue grave",
  chikungunya: "Chikungunya",
};

export function AgravoListPage({
  agravo,
  title,
  novaFichaPath,
}: {
  agravo: "dengue" | "chikungunya";
  title: string;
  novaFichaPath: string;
}) {
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { can } = useAuth();
  const canCreate = can("fichas.create");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dengue_chikungunya_cases")
      .select("id, numero_ficha, nome_paciente, data_notificacao, status, classificacao, created_at")
      .eq("agravo", agravo)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else {
      setError(null);
      setRows((data ?? []) as CaseRow[]);
    }
    setLoading(false);
  }, [agravo]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/fichas" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="text-2xl font-bold mt-2">{title}</h1>
        </div>
        {canCreate && (
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link to={novaFichaPath}>
                <FilePlus className="w-4 h-4 mr-1" /> Nova ficha
              </Link>
            </Button>
            <DengueChikImporter agravo={agravo} onImported={() => void load()} />
          </div>
        )}
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
            {canCreate && (
              <Button asChild>
                <Link to={novaFichaPath}>
                  <FilePlus className="w-4 h-4 mr-1" /> Cadastrar primeira ficha
                </Link>
              </Button>
            )}
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
                <TableRow
                  key={r.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    window.location.href = `/fichas/${agravo}/${r.id}`;
                  }}
                >
                  <TableCell className="font-mono text-xs">{r.numero_ficha || "—"}</TableCell>
                  <TableCell className="font-medium">{r.nome_paciente}</TableCell>
                  <TableCell>{new Date(r.data_notificacao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "encerrado" ? "secondary" : "default"}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.classificacao ? (
                      <Badge variant={r.classificacao === "descartado" ? "outline" : "destructive"}>
                        {CLASSIF_LABEL[r.classificacao] ?? r.classificacao}
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

