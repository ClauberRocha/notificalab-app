import { useMemo, useState } from "react";
import { Loader2, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  buildRows,
  fieldsForAgravo,
  guessField,
  type ParsedRow,
} from "@/lib/dengue-chik-import";

const IGNORE = "__ignore__";

export function DengueChikImporter({
  agravo,
  onImported,
}: {
  agravo: "dengue" | "chikungunya";
  onImported: () => void;
}) {
  const { user } = useAuth();
  const fields = useMemo(() => fieldsForAgravo(agravo), [agravo]);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<unknown[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"file" | "map" | "preview">("file");
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setFileName("");
    setHeaders([]);
    setDataRows([]);
    setMapping({});
    setStep("file");
    setImporting(false);
  };

  const readFile = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: "" });
      const rows = matrix.filter((r) => Array.isArray(r) && r.some((c) => String(c ?? "").trim() !== ""));
      if (rows.length < 2) {
        toast.error("A planilha precisa ter cabeçalho e ao menos uma linha de dados.");
        return;
      }
      const hdr = (rows[0] as unknown[]).map((h) => String(h ?? "").trim());
      const auto: Record<string, string> = {};
      hdr.forEach((h) => {
        auto[h] = guessField(h, fields) ?? IGNORE;
      });
      setFileName(file.name);
      setHeaders(hdr);
      setDataRows(rows.slice(1) as unknown[][]);
      setMapping(auto);
      setStep("map");
    } catch {
      toast.error("Não foi possível ler o arquivo. Use .xlsx, .xls ou .csv.");
    }
  };

  const mappedFieldNames = Object.values(mapping).filter((v) => v && v !== IGNORE);
  const missingRequired = fields.filter((f) => f.required && !mappedFieldNames.includes(f.name));

  const parsed: ParsedRow[] = useMemo(
    () => (step === "preview" ? buildRows(headers, dataRows, mapping, fields) : []),
    [step, headers, dataRows, mapping, fields],
  );
  const valid = parsed.filter((r) => r.errors.length === 0);
  const invalid = parsed.filter((r) => r.errors.length > 0);

  const handleImport = async () => {
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    if (valid.length === 0) return;
    setImporting(true);
    try {
      // duplicidade de Nº da Notificação já existente no banco
      const fichas = valid
        .map((r) => r.payload["numero_ficha"])
        .filter((v): v is string => typeof v === "string" && v !== "");
      let existing = new Set<string>();
      if (fichas.length > 0) {
        const { data } = await supabase
          .from("dengue_chikungunya_cases")
          .select("numero_ficha")
          .in("numero_ficha", fichas);
        existing = new Set((data ?? []).map((d) => d.numero_ficha).filter(Boolean) as string[]);
      }
      const toInsert = valid.filter((r) => {
        const f = r.payload["numero_ficha"];
        return !(typeof f === "string" && existing.has(f));
      });
      const skipped = valid.length - toInsert.length;
      if (toInsert.length === 0) {
        toast.error("Todas as fichas já existem no sistema (Nº da Notificação duplicado).");
        setImporting(false);
        return;
      }

      const payloads = toInsert.map((r) => ({ ...r.payload, agravo, user_id: user.id }));
      const CHUNK = 200;
      let inserted = 0;
      for (let i = 0; i < payloads.length; i += CHUNK) {
        const { error } = await supabase
          .from("dengue_chikungunya_cases")
          .insert(payloads.slice(i, i + CHUNK) as never);
        if (error) throw error;
        inserted += Math.min(CHUNK, payloads.length - i);
      }
      toast.success(
        `${inserted} ficha(s) importada(s).` +
          (skipped > 0 ? ` ${skipped} ignorada(s) por duplicidade.` : "") +
          (invalid.length > 0 ? ` ${invalid.length} com erro não importada(s).` : ""),
      );
      setOpen(false);
      reset();
      onImported();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao importar fichas.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-1" /> Importar planilha
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar planilha — {agravo === "dengue" ? "Dengue" : "Chikungunya"}</DialogTitle>
          <DialogDescription>
            Formatos aceitos: .xlsx, .xls e .csv. A primeira linha deve conter os nomes das colunas.
          </DialogDescription>
        </DialogHeader>

        {step === "file" && (
          <label className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 text-center cursor-pointer hover:bg-muted/40">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm font-medium">Clique para selecionar ou arraste a planilha aqui</span>
            <span className="text-xs text-muted-foreground">.xlsx, .xls ou .csv</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void readFile(f);
                e.target.value = "";
              }}
            />
          </label>
        )}

        {step === "map" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Arquivo: <span className="font-medium text-foreground">{fileName}</span> — {dataRows.length} linha(s).
              Confira o mapeamento das colunas.
            </p>
            {missingRequired.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-destructive border border-destructive/30 bg-destructive/5 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <span>
                  Campos obrigatórios não mapeados: {missingRequired.map((f) => f.label).join(", ")}
                </span>
              </div>
            )}
            <div className="border rounded-lg divide-y max-h-[45vh] overflow-y-auto">
              {headers.map((h) => (
                <div key={h} className="p-2 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm flex-1 truncate" title={h}>
                    {h || "(sem nome)"}
                  </span>
                  <Select
                    value={mapping[h] ?? IGNORE}
                    onValueChange={(v) => setMapping((m) => ({ ...m, [h]: v }))}
                  >
                    <SelectTrigger className="sm:w-72">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={IGNORE}>Ignorar coluna</SelectItem>
                      {fields.map((f) => (
                        <SelectItem key={f.name} value={f.name}>
                          {f.label}
                          {f.required ? " *" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={reset}>
                Trocar arquivo
              </Button>
              <Button onClick={() => setStep("preview")} disabled={missingRequired.length > 0}>
                Ver prévia
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="w-3 h-3" /> {valid.length} válidas
              </Badge>
              <Badge variant={invalid.length ? "destructive" : "outline"} className="gap-1">
                <AlertTriangle className="w-3 h-3" /> {invalid.length} com erro
              </Badge>
            </div>

            <div className="border rounded-lg overflow-x-auto max-h-[35vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Linha</TableHead>
                    <TableHead>Nº Notificação</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data notif.</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.slice(0, 10).map((r) => (
                    <TableRow key={r.line}>
                      <TableCell className="text-xs">{r.line}</TableCell>
                      <TableCell className="font-mono text-xs">{String(r.payload["numero_ficha"] ?? "—")}</TableCell>
                      <TableCell className="text-sm">{String(r.payload["nome_paciente"] ?? "—")}</TableCell>
                      <TableCell className="text-sm">{String(r.payload["data_notificacao"] ?? "—")}</TableCell>
                      <TableCell>
                        {r.errors.length === 0 ? (
                          <Badge variant="secondary">Válida</Badge>
                        ) : (
                          <Badge variant="destructive">Erro</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {parsed.length > 10 && (
              <p className="text-xs text-muted-foreground">Mostrando as 10 primeiras de {parsed.length} linhas.</p>
            )}

            {invalid.length > 0 && (
              <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-3 max-h-40 overflow-y-auto text-sm space-y-1">
                {invalid.slice(0, 50).map((r) => (
                  <p key={r.line}>
                    <span className="font-medium">Linha {r.line}:</span>{" "}
                    {r.errors.map((e) => `${e.label} — ${e.message}`).join("; ")}
                  </p>
                ))}
                {invalid.length > 50 && <p className="text-xs">… e mais {invalid.length - 50} linha(s).</p>}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("map")} disabled={importing}>
                Voltar ao mapeamento
              </Button>
              <Button onClick={handleImport} disabled={importing || valid.length === 0}>
                {importing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                Importar {valid.length} ficha(s)
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
