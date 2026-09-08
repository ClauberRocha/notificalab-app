import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, FilePlus, Loader2, Upload } from "lucide-react";
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
  const canImport = canCreate || can("fichas.edit");

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
          {canImport && <MeningiteImporter onSuccess={() => setReloadKey((prev) => prev + 1)} />}
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

function MeningiteImporter({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [fileText, setFileText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [mapped, setMapped] = useState<Record<string, string>>({});
  const [unmapped, setUnmapped] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    totalProcessed: number;
    totalSuccess: number;
    totalError: number;
    errors: { line: number; patientName: string; errorDetail: string }[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setFileText(text);
      const rows = parseCSV(text);
      if (rows.length === 0) {
        toast.error("O arquivo CSV está vazio.");
        return;
      }
      setParsedRows(rows);
      const headers = rows[0];
      
      const mappedCols: Record<string, string> = {};
      const unmappedCols: string[] = [];
      
      headers.forEach((header) => {
        const normalized = normalizeHeader(header);
        let matchedField: string | null = null;
        
        for (const [fieldName, possibleNames] of Object.entries(FIELD_MAPPING)) {
          const match = possibleNames.some(name => {
            const normalizedName = normalizeHeader(name);
            return normalized === normalizedName || normalized.replace(/\s/g, "_") === normalizedName;
          });
          if (match) {
            matchedField = fieldName;
            break;
          }
        }
        
        if (matchedField) {
          mappedCols[header] = matchedField;
        } else {
          unmappedCols.push(header);
        }
      });
      
      setMapped(mappedCols);
      setUnmapped(unmappedCols);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleImport = async () => {
    if (parsedRows.length <= 1) return;
    if (!user) {
      toast.error("Você precisa estar logado para importar.");
      return;
    }
    
    setImporting(true);
    const headers = parsedRows[0];
    const dataRows = parsedRows.slice(1);
    
    let totalSuccess = 0;
    let totalError = 0;
    const errorsList: { line: number; patientName: string; errorDetail: string }[] = [];
    
    for (let idx = 0; idx < dataRows.length; idx++) {
      const row = dataRows[idx];
      const lineNum = idx + 2;
      
      if (row.length === 0 || (row.length === 1 && row[0] === "")) continue;
      
      try {
        const payload: Record<string, any> = {
          user_id: user.id,
          agravo: "outras_meningites",
          status: "em_investigacao"
        };
        
        headers.forEach((header, colIdx) => {
          const fieldName = mapped[header];
          if (fieldName) {
            const val = row[colIdx] ?? "";
            
            if (["municipio_notificacao", "municipio_residencia", "municipio_hospital", "municipio_unidade_investigador"].includes(fieldName)) {
              payload[fieldName] = normalizeText(val);
            }
            else if (["regional", "macroregiao"].includes(fieldName)) {
              payload[fieldName] = normalizeText(val);
            }
            else if (["codigo_ibge_notificacao", "codigo_ibge_residencia", "codigo_unidade_saude", "codigo_hospital"].includes(fieldName)) {
              payload[fieldName] = normalizeIbge(val);
            }
            else if (fieldName.startsWith("data_") || fieldName === "data_notificacao" || fieldName === "data_nascimento") {
              const isoDate = parseDateToIso(val);
              if (isoDate) {
                payload[fieldName] = isoDate;
              } else if (val.trim() !== "") {
                throw new Error(`Data inválida: "${val}" no campo ${header}`);
              }
            }
            else if (fieldName === "idade") {
              const num = Number(val);
              payload[fieldName] = isNaN(num) ? null : num;
            }
            else {
              payload[fieldName] = val.trim();
            }
          }
        });
        
        if (!payload.nome_paciente || payload.nome_paciente.trim() === "") {
          throw new Error("Nome do paciente é obrigatório");
        }
        if (!payload.data_notificacao || payload.data_notificacao.trim() === "") {
          throw new Error("Data da notificação é obrigatória");
        }
        
        const { error } = await supabase
          .from("meningite_cases")
          .insert(payload);
          
        if (error) {
          throw new Error(error.message);
        }
        
        totalSuccess++;
      } catch (err: any) {
        totalError++;
        const nameHeaderIdx = headers.indexOf(headers.find(h => mapped[h] === "nome_paciente") || "");
        const patientName = nameHeaderIdx !== -1 ? row[nameHeaderIdx] : "";
        errorsList.push({
          line: lineNum,
          patientName: String(patientName || "(Desconhecido)"),
          errorDetail: err instanceof Error ? err.message : String(err)
        });
      }
    }
    
    setResult({
      totalProcessed: dataRows.length,
      totalSuccess,
      totalError,
      errors: errorsList
    });
    
    setImporting(false);
    toast.success("Importação concluída!");
    onSuccess();
  };

  const handleClose = () => {
    setOpen(false);
    setFileText(null);
    setFileName("");
    setMapped({});
    setUnmapped([]);
    setParsedRows([]);
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" /> Importar Fichas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Fichas de Meningite</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV com as fichas para importá-las para o sistema.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="border border-dashed border-muted-foreground/30 rounded-xl p-6 text-center hover:bg-muted/10 transition">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              id="csv-file-input" 
              className="hidden" 
            />
            <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm font-semibold text-primary">Selecione o arquivo CSV</span>
              <span className="text-xs text-muted-foreground">Formato aceito: .csv (separado por vírgulas)</span>
            </label>
          </div>

          {fileName && (
            <div className="bg-muted/40 p-3 rounded-lg flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground truncate max-w-[400px]">{fileName}</span>
              <span className="text-muted-foreground">{parsedRows.length - 1} linhas detectadas</span>
            </div>
          )}

          {parsedRows.length > 0 && !result && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Colunas Mapeadas com Correspondência ({Object.keys(mapped).length})
                </h4>
                <div className="grid grid-cols-2 gap-1.5 max-h-[150px] overflow-y-auto border rounded-lg p-2.5 bg-muted/20">
                  {Object.entries(mapped).map(([header, fieldName]) => (
                    <div key={header} className="text-xs flex items-center justify-between border-b pb-1">
                      <span className="text-muted-foreground font-mono truncate mr-2" title={header}>{header}</span>
                      <span className="font-semibold text-emerald-600 font-mono truncate" title={fieldName}>&rarr; {fieldName}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Colunas Sem Correspondência ({unmapped.length})
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto border rounded-lg p-2.5 bg-muted/20">
                  {unmapped.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Nenhuma coluna ficou sem mapeamento.</span>
                  ) : (
                    unmapped.map((col) => (
                      <span key={col} className="text-[10px] bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-0.5 rounded font-mono truncate max-w-[150px]" title={col}>
                        {col}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="border rounded-xl p-3 bg-muted/30 text-center">
                  <p className="text-[11px] text-muted-foreground uppercase">Processadas</p>
                  <p className="text-2xl font-bold text-foreground">{result.totalProcessed}</p>
                </div>
                <div className="border rounded-xl p-3 bg-emerald-500/10 border-emerald-500/20 text-center">
                  <p className="text-[11px] text-emerald-700 uppercase">Sucesso</p>
                  <p className="text-2xl font-bold text-emerald-600">{result.totalSuccess}</p>
                </div>
                <div className="border rounded-xl p-3 bg-destructive/10 border-destructive/20 text-center">
                  <p className="text-[11px] text-destructive uppercase">Erros</p>
                  <p className="text-2xl font-bold text-destructive">{result.totalError}</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                    Detalhamento dos Erros
                  </h4>
                  <div className="border rounded-lg max-h-[180px] overflow-y-auto text-xs bg-muted/20 p-2 divide-y">
                    {result.errors.map((err, i) => (
                      <div key={i} className="py-2 flex justify-between gap-4">
                        <span className="font-semibold text-muted-foreground min-w-[70px]">Linha {err.line}</span>
                        <span className="font-medium text-foreground truncate max-w-[200px]">{err.patientName}</span>
                        <span className="text-destructive font-mono text-[11px] flex-1 text-right">{err.errorDetail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            {result ? "Fechar" : "Cancelar"}
          </Button>
          {parsedRows.length > 0 && !result && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Importando...
                </>
              ) : (
                "Confirmar Importação"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
