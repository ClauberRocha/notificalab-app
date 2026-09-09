import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, FilePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CaseImporter } from "@/components/case-importer";
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
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  parseCSV,
  FIELD_MAPPING,
  normalizeHeader,
  normalizeText,
  normalizeIbge,
  parseDateToIso,
} from "@/lib/meningite-import-helper";

export type MeningiteAgravo = "outras_meningites";

type CaseRow = {
  id: string;
  numero_ficha: string | null;
  nome_paciente: string;
  data_notificacao: string;
  status: string;
  classificacao_caso: string | null;
  especificacao_confirmado: string | null;
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

const TITLE_MAP: Record<
  MeningiteAgravo,
  { title: string; novaPath: "/nova-ficha/outras-meningites" }
> = {
  outras_meningites: { title: "Outras Meningites", novaPath: "/nova-ficha/outras-meningites" },
};

export function MeningiteListPage({ agravo }: { agravo: MeningiteAgravo }) {
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { can } = useAuth();
  const canCreate = can("fichas.create");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("meningite_cases")
        .select("id, numero_ficha, nome_paciente, data_notificacao, status, classificacao_caso, especificacao_confirmado, created_at")
        .eq("agravo", agravo)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) setError(error.message);
      else setRows((data ?? []) as CaseRow[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [agravo, reloadKey]);

  const { title, novaPath } = TITLE_MAP[agravo];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/fichas" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="text-2xl font-bold mt-2">Fichas — {title}</h1>
        </div>
        <div className="flex gap-2">
          <CaseImporter agravo="outras_meningites" onImported={() => setReloadKey((prev) => prev + 1)} />
          {canCreate && (
            <Button asChild>
              <Link to={novaPath}>
                <FilePlus className="w-4 h-4 mr-1" /> Nova ficha
              </Link>
            </Button>
          )}
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
            {canCreate && (
              <Button asChild>
                <Link to={novaPath}><FilePlus className="w-4 h-4 mr-1" /> Cadastrar primeira ficha</Link>
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
                <TableHead>Classificação</TableHead>
                <TableHead>Especificação</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const slug = "outras-meningites";
                return (
                <TableRow
                  key={r.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => { window.location.href = `/fichas/${slug}/${r.id}`; }}
                >
                  <TableCell className="font-mono text-xs">{r.numero_ficha || "—"}</TableCell>
                  <TableCell className="font-medium">{r.nome_paciente}</TableCell>
                  <TableCell>{new Date(r.data_notificacao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    {r.classificacao_caso ? (
                      <Badge variant={r.classificacao_caso === "confirmado" ? "destructive" : "outline"}>
                        {CLASSIF_LABEL[r.classificacao_caso] ?? r.classificacao_caso}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.especificacao_confirmado ? (
                      <span>{r.especificacao_confirmado.replace(/_/g, " ")}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.status === "encerrado" ? "secondary" : "default"}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

