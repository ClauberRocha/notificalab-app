import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Children, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { updateCase } from "@/lib/offline/db";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  CheckCircle,
  FileText,
  Pencil,
  Save,
  X,
  Printer,
  FileDown,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { getSemanaEpidemiologica } from "@/data/semana-epd";
import { getSeNumber } from "@/lib/seUtils";
import { SoftDeleteCaseDialog } from "@/components/soft-delete-case-dialog";
import { useCaseViewAudit } from "@/hooks/use-case-view-audit";
import { logAction } from "@/lib/log-service";

type AnyObj = Record<string, unknown>;
type TableName = keyof Database["public"]["Tables"];

function getSE(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const isoDate = dateStr.slice(0, 10);
  const mapped = getSemanaEpidemiologica(isoDate);
  if (mapped !== null) return String(mapped);
  const dateObj = new Date(dateStr);
  const computed = getSeNumber(dateObj);
  return computed > 0 ? String(computed) : "";
}

const LABEL_MAP: Record<string, string> = {
  sim: "Sim",
  nao: "Não",
  ignorado: "Ignorado",
  masculino: "Masculino",
  feminino: "Feminino",
  em_investigacao: "Em Aberto",
  encerrado: "Encerrado",
  confirmado: "Confirmado",
  descartado: "Descartado",
  cura: "Cura",
  obito: "Óbito",
  laboratorial: "Laboratorial",
  clinico_epidemiologico: "Clínico-epidemiológico",
  clinico: "Clínico",
  positiva: "Positiva",
  negativa: "Negativa",
  nao_realizada: "Não Realizada",
  urbana: "Urbana",
  rural: "Rural",
  periurbana: "Periurbana",
  branca: "Branca",
  preta: "Preta",
  amarela: "Amarela",
  parda: "Parda",
  indigena: "Indígena",
  anos: "anos",
  meses: "meses",
  dias: "dias",
  horas: "horas",
  individual: "Individual",
  surto: "Surto",
  internado: "Internado(a)",
  obito_agravo: "Óbito pelo agravo",
  obito_outras_causas: "Óbito por outras causas",
  obito_em_investigacao: "Óbito em investigação",

  // Doenças Pré-Existentes / Antecedentes
  diabetes: "Diabetes",
  hipertensao: "Hipertensão",
  doencas_autoimunes: "Doenças autoimunes",
  doencas_hematologicas: "Doenças hematológicas",
  doenca_acido_peptica: "Doença ácido-péptica",
  hepatopatias: "Hepatopatias",
  doenca_renal_cronica: "Doença renal crônica",
  obesidade: "Obesidade",
  cardiopatia: "Doença cardiovascular crônica",
  pneumopatia: "Doença respiratória crônica (DPOC/asma)",
  doenca_neurologica: "Doença neurológica crônica",
  imunodepressao: "Imunodepressão / imunossupressão",
  hiv_aids: "HIV/AIDS",
  tuberculose: "Tuberculose",
  neoplasia: "Neoplasia (câncer)",
  transplantado: "Transplantado",
  gestante_alto_risco: "Gestante de alto risco",
  puerpera: "Puérpera (até 45 dias)",
  sindrome_down: "Síndrome de Down",
  tabagismo: "Tabagismo",
  etilismo: "Etilismo",
  desnutricao: "Desnutrição",
  nefropatia: "Doença renal crônica",
  hepatopatia: "Doença hepática crônica",
  doenca_hematologica: "Doença hematológica crônica",

  // Vacinas
  bcg: "BCG",
  hepatite_b: "Hepatite B",
  penta: "Penta (DTP+Hib+HepB)",
  dtp: "DTP (Tríplice bacteriana)",
  dt_adulto: "dT (Dupla adulto)",
  dtpa: "dTpa (gestante)",
  vip_vop: "Poliomielite (VIP/VOP)",
  rotavirus: "Rotavírus",
  pneumo_10: "Pneumocócica 10-valente",
  pneumo_23: "Pneumocócica 23-valente",
  meningo_c: "Meningocócica C",
  meningo_acwy: "Meningocócica ACWY",
  meningo_b: "Meningocócica B",
  febre_amarela: "Febre amarela",
  triplice_viral: "Tríplice viral (SCR)",
  tetra_viral: "Tetra viral (SCRV)",
  varicela: "Varicela",
  hpv: "HPV",
  influenza: "Influenza",
  covid_19: "COVID-19",
  hepatite_a: "Hepatite A",
  raiva: "Raiva (humana)",

  // Sintomas comuns (Dados Clínicos)
  febre: "Febre",
  calafrios: "Calafrios",
  sudorese: "Sudorese",
  cefaleia: "Cefaleia",
  mialgia: "Mialgia",
  artralgia: "Artralgia",
  dor_retroocular: "Dor retroocular",
  tosse: "Tosse",
  coriza: "Coriza",
  dor_garganta: "Dor de garganta",
  dispneia: "Dispneia",
  dor_toracica: "Dor torácica",
  nausea: "Náusea",
  vomito: "Vômito",
  diarreia: "Diarreia",
  dor_abdominal: "Dor abdominal",
  exantema: "Exantema",
  prurido: "Prurido",
  conjuntivite: "Conjuntivite",
  rigidez_nuca: "Rigidez de nuca",
  convulsao: "Convulsão",
  alteracao_consciencia: "Alteração da consciência",
  petequias: "Petéquias",
  hemorragia: "Hemorragia",
  ictericia: "Icterícia",
  perda_olfato_paladar: "Perda de olfato/paladar",
  fadiga: "Fadiga / astenia",
  linfadenopatia: "Linfadenopatia",
  hepatoesplenomegalia: "Hepato/esplenomegalia",
  lesao_pele: "Lesão de pele",
};

const mapOne = (raw: string): string => {
  const key = raw.trim().toLowerCase();
  if (LABEL_MAP[key]) return LABEL_MAP[key];
  // Title case fallback for plain words (e.g. "feminino" -> "Feminino")
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const lbl = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "";
  const s = String(v);
  if (s.includes(",")) {
    return s.split(",").map(mapOne).join(", ");
  }
  return mapOne(s);
};

function calcIdade(dobIso: string | null | undefined): number | null {
  if (!dobIso) return null;
  const dob = new Date(dobIso);
  if (isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 0 ? age : null;
}

function calcFaixaEtaria(idade: number | null): string | null {
  if (idade === null) return null;
  if (idade < 1) return "< 1 ano";
  if (idade <= 10) return "1 a 10 anos";
  if (idade <= 20) return "11 a 20 anos";
  if (idade <= 30) return "21 a 30 anos";
  if (idade <= 40) return "31 a 40 anos";
  if (idade <= 50) return "41 a 50 anos";
  if (idade <= 60) return "51 a 60 anos";
  if (idade <= 70) return "61 a 70 anos";
  return "Acima de 70 anos";
}

const ibgeMuniCache = new Map<string, Map<string, string>>();
function normMuni(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}
async function fetchIbgeForMunicipio(
  uf: string,
  municipio: string,
): Promise<string | null> {
  const ufKey = (uf || "MA").toUpperCase();
  let map = ibgeMuniCache.get(ufKey);
  if (!map) {
    try {
      const res = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufKey}/municipios`,
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { id: number; nome: string }[];
      map = new Map(data.map((d) => [normMuni(d.nome), String(d.id)]));
      ibgeMuniCache.set(ufKey, map);
    } catch {
      return null;
    }
  }
  return map.get(normMuni(municipio)) ?? null;
}

const humanizeLabel = (key: string): string => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bUf\b/g, "UF")
    .replace(/\bCep\b/g, "CEP")
    .replace(/\bIbge\b/g, "IBGE")
    .replace(/\bSus\b/g, "SUS");
};

const isDateField = (k: string) => k.startsWith("data_");

const fmtDate = (d: unknown): string | null => {
  if (!d || typeof d !== "string") return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : format(dt, "dd/MM/yyyy");
};

const SKIP_KEYS = new Set([
  "id",
  "user_id",
  "created_at",
  "updated_at",
  "agravo",
  "status",
  "nome_paciente",
  "semana_epidemiologica",
]);

// Field grouping by prefix/keyword
const SECTIONS: Array<{ title: string; match: (k: string) => boolean }> = [
  {
    title: "Dados Gerais",
    match: (k) =>
      [
        "numero_ficha",
        "tipo_notificacao",
        "data_notificacao",
        "uf_notificacao",
        "municipio_notificacao",
        "codigo_ibge_notificacao",
        "unidade_saude",
        "codigo_unidade_saude",
        "data_primeiros_sintomas",
        "data_investigacao",
      ].includes(k),
  },
  {
    title: "Paciente",
    match: (k) =>
      [
        "data_nascimento",
        "idade",
        "faixa_etaria",
        "tipo_idade",
        "sexo",
        "gestante",
        "raca_cor",
        "escolaridade",
        "numero_cartao_sus",
        "nome_mae",
        "ocupacao",
      ].includes(k),
  },
  {
    title: "Residência",
    match: (k) =>
      [
        "uf_residencia",
        "municipio_residencia",
        "codigo_ibge_residencia",
        "distrito",
        "bairro",
        "logradouro",
        "numero_endereco",
        "complemento",
        "cep",
        "ponto_referencia",
        "telefone",
        "zona",
        "pais",
      ].includes(k),
  },
  {
    title: "Antecedentes / Vacinação",
    match: (k) =>
      k.startsWith("vacina") ||
      k.startsWith("doses_") ||
      k.startsWith("data_ultima_dose") ||
      k.startsWith("contato_") ||
      k.startsWith("nome_contato") ||
      k.startsWith("endereco_contato") ||
      k.startsWith("antecedente"),
  },
  {
    title: "Hospitalização",
    match: (k) =>
      k.includes("hospital") ||
      k === "data_internacao" ||
      k === "uf_hospital" ||
      k === "municipio_hospital",
  },
  {
    title: "Laboratório",
    match: (k) =>
      k.startsWith("resultado_") ||
      k.startsWith("exame_") ||
      k.startsWith("coleta_") ||
      k.startsWith("data_coleta") ||
      k.startsWith("material_") ||
      k.includes("toxigenicidade") ||
      k.startsWith("provas_"),
  },
  {
    title: "Tratamento",
    match: (k) =>
      k.startsWith("utilizou_") ||
      k.startsWith("antibiotico") ||
      k.startsWith("data_aplicacao") ||
      k.startsWith("data_adm_") ||
      k.startsWith("medidas_") ||
      k.startsWith("quimioprofilaxia") ||
      k.startsWith("tratamento"),
  },
  {
    title: "Investigação Epidemiológica",
    match: (k) =>
      k.startsWith("numero_comunicantes") ||
      k.startsWith("casos_secundarios") ||
      k.startsWith("quantidade_comunicantes") ||
      k.startsWith("portadores_") ||
      k.startsWith("identificacao_"),
  },
  {
    title: "Conclusão",
    match: (k) =>
      k.startsWith("classificacao") ||
      k.startsWith("criterio") ||
      k === "evolucao" ||
      k === "data_obito" ||
      k === "data_encerramento" ||
      k === "doenca_relacionada_trabalho" ||
      k.startsWith("especificacao_"),
  },
  {
    title: "Investigador",
    match: (k) =>
      k.startsWith("nome_investigador") ||
      k.startsWith("funcao_investigador") ||
      k.startsWith("municipio_unidade_investigador") ||
      k.startsWith("codigo_unidade_investigador"),
  },
];

const JSON_SECTIONS: Record<string, string> = {
  sinais_sintomas: "Sinais e Sintomas",
  complicacoes: "Complicações",
  doencas_preexistentes: "Doenças Preexistentes",
  vacinacao: "Vacinação",
  resultados_laboratoriais: "Resultados Laboratoriais",
  exame_quimiocitologico: "Exame Quimiocitológico",
  localizacao_pseudomembrana: "Localização da Pseudomembrana",
  manifestacoes: "Manifestações",
  avaliacao_neurologica: "Avaliação Neurológica",
  exame_fisico: "Exame Físico",
};

function InfoItem({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean" && !value) return null;
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground mt-0.5 break-words">
        {typeof value === "boolean" ? "Sim" : String(value)}
      </p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  const hasContent = Children.toArray(children).some(Boolean);
  if (!hasContent) return null;
  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {children}
      </CardContent>
    </Card>
  );
}

function renderField(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const label = humanizeLabel(key);
  if (isDateField(key)) {
    return <InfoItem key={key} label={label} value={fmtDate(value)} />;
  }
  return <InfoItem key={key} label={label} value={lbl(value)} />;
}

const BOOL_FIELDS = new Set(["doenca_relacionada_trabalho"]);

function EditField({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = humanizeLabel(fieldKey);
  const isDate = isDateField(fieldKey);
  const isBool = typeof value === "boolean" || BOOL_FIELDS.has(fieldKey);
  const longText = fieldKey.startsWith("observ") || fieldKey.includes("descricao");
  const str =
    value === null || value === undefined
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);

  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      {isBool ? (
        <Select
          value={value === true ? "true" : value === false ? "false" : ""}
          onValueChange={(v) => onChange(v === "" ? null : v === "true")}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Sim</SelectItem>
            <SelectItem value="false">Não</SelectItem>
          </SelectContent>
        </Select>
      ) : isDate ? (
        <Input
          type="date"
          value={str.slice(0, 10)}
          onChange={(e) => onChange(e.target.value || null)}
          className="h-9"
        />
      ) : longText ? (
        <Textarea
          value={str}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <Input
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
        />
      )}
    </div>
  );
}

export interface CaseDetailProps {
  tableName: TableName;
  agravo: string;
  agravoLabel: string;
  listPath: string;
  id: string;
  /** Extra filter when one table holds multiple agravos */
  agravoColumnValue?: string;
}

export function CaseDetail({
  tableName,
  agravo,
  agravoLabel,
  listPath,
  id,
}: CaseDetailProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canDelete = can("fichas.delete");
  const canEdit = can("fichas.edit");

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AnyObj>({});
  const [exportingPdf, setExportingPdf] = useState(false);
  const [ibgeResLookup, setIbgeResLookup] = useState<string | null>(null);

  const queryKey = [agravo, "case", id];
  const listKey = [agravo, "cases"];

  const { data: ficha, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName as never)
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw error;
      return (data as AnyObj | null) ?? null;
    },
  });

  useCaseViewAudit(tableName, id, Boolean(ficha));

  const encerrarMutation = useMutation({
    mutationFn: async () => {
      const { error } = await updateCase(tableName, id, {
        status: "encerrado",
        data_encerramento: new Date().toISOString().split("T")[0],
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: listKey });
      toast.success("Caso encerrado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: AnyObj) => {
      const { error } = await updateCase(tableName, id, payload as Record<string, unknown>);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: listKey });
      toast.success("Ficha atualizada com sucesso.");
      setEditing(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (!editing && ficha) setDraft(ficha);
  }, [ficha, editing]);

  useEffect(() => {
    if (!ficha) return;
    const existing = ficha.codigo_ibge_residencia as string | undefined;
    const muni = ficha.municipio_residencia as string | undefined;
    if (existing || !muni) {
      setIbgeResLookup(null);
      return;
    }
    const uf = (ficha.uf_residencia as string | undefined) || "MA";
    let cancelled = false;
    fetchIbgeForMunicipio(uf, muni).then((code) => {
      if (!cancelled) setIbgeResLookup(code);
    });
    return () => {
      cancelled = true;
    };
  }, [ficha]);

  // Auto-enter edit mode when navigated with ?edit=1
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") === "1" && ficha && canEdit && !editing) {
      setDraft(ficha);
      setEditing(true);
      params.delete("edit");
      const qs = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (qs ? `?${qs}` : ""),
      );
    }
  }, [ficha, canEdit, editing]);

  const handleExportPdf = async () => {
    const node = document.getElementById("ficha-pdf-root");
    if (!node) return;
    setExportingPdf(true);
    try {
      const { exportElementToPdf } = await import("@/lib/pdf-export");
      const nome = (ficha?.nome_paciente as string) || "ficha";
      const result = await exportElementToPdf(node, {
        filename: `${nome}_${id.slice(0, 8)}`,
      });
      if (result.ok) {
        await logAction({ action: "export_pdf", entity_type: tableName, entity_id: id, description: "Exportação de ficha em PDF", metadata: { agravo } });
        toast.success(`PDF exportado (${result.pages} pág, ${result.totalMs.toFixed(0)}ms).`);
      } else {
        const isColor = result.logs.some(
          (l) => l.step === "fail" && l.meta?.isColorParseError,
        );
        toast.error(
          isColor
            ? "Falha ao exportar PDF: cor não suportada pelo renderizador. Atualize a página e tente novamente."
            : `Falha ao exportar PDF: ${result.error}`,
        );
      }
    } finally {
      setExportingPdf(false);
    }
  };


  const setDraftField = (key: string, value: unknown) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setDraftJsonField = (group: string, key: string, value: unknown) =>
    setDraft((d) => ({
      ...d,
      [group]: { ...(d[group] as AnyObj | undefined), [key]: value },
    }));

  const handleSave = () => {
    const READONLY = new Set([
      "id",
      "user_id",
      "created_at",
      "updated_at",
    ]);
    const payload: AnyObj = {};
    for (const k of Object.keys(draft)) {
      if (READONLY.has(k)) continue;
      payload[k] = draft[k];
    }
    saveMutation.mutate(payload);
  };

  const handleCancel = () => {
    if (ficha) setDraft(ficha);
    setEditing(false);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ficha) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Ficha não encontrada.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to={listPath}>Voltar</Link>
        </Button>
      </div>
    );
  }

  const status = ficha.status as string | undefined;
  const obs = ficha.observacoes_adicionais as string | undefined;

  // Derived values (display-only)
  const idadeCalc = calcIdade(ficha.data_nascimento as string | undefined);
  const idadeFinal =
    ficha.idade !== null && ficha.idade !== undefined && ficha.idade !== ""
      ? Number(ficha.idade)
      : idadeCalc;
  const faixaEtariaFinal =
    (ficha.faixa_etaria as string | undefined) ||
    calcFaixaEtaria(idadeFinal ?? null);


  const enrichedFicha: AnyObj = {
    ...ficha,
    idade: idadeFinal ?? ficha.idade,
    faixa_etaria: faixaEtariaFinal ?? ficha.faixa_etaria,
    codigo_ibge_residencia:
      (ficha.codigo_ibge_residencia as string | undefined) || ibgeResLookup || "",
  };

  const allKeys = Array.from(
    new Set([...Object.keys(ficha), "faixa_etaria", "codigo_ibge_residencia"]),
  ).filter((k) => !SKIP_KEYS.has(k));

  const jsonGroups: Array<{ key: string; title: string; obj: AnyObj }> = [];
  const flatKeys: string[] = [];

  for (const k of allKeys) {
    if (k === "observacoes_adicionais") continue;
    const v = ficha[k];
    if (JSON_SECTIONS[k] && v && typeof v === "object") {
      jsonGroups.push({ key: k, title: JSON_SECTIONS[k], obj: v as AnyObj });
    } else {
      flatKeys.push(k);
    }
  }

  const encerDias =
    ficha.data_encerramento && ficha.data_primeiros_sintomas
      ? differenceInDays(
          new Date(ficha.data_encerramento as string),
          new Date(ficha.data_primeiros_sintomas as string),
        )
      : null;

  return (
    <div id="ficha-pdf-root" className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/fichas">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {(ficha.nome_paciente as string) || "(sem nome)"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {agravo !== "outras_meningites" && (
                  <Badge className="bg-primary/10 text-primary border border-primary/20">
                    {agravoLabel}
                  </Badge>
                )}
                <Badge
                  variant={status === "encerrado" ? "secondary" : "default"}
                >
                  {lbl(status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing && status !== "encerrado" && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => encerrarMutation.mutate()}
              disabled={encerrarMutation.isPending}
            >
              <CheckCircle className="w-4 h-4" /> Encerrar
            </Button>
          )}
          {!editing && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
          )}
          {!editing && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportPdf}
              disabled={exportingPdf}
            >
              {exportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              Exportar PDF
            </Button>
          )}
          {!editing && canEdit && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (ficha) setDraft(ficha);
                setEditing(true);
              }}
            >
              <Pencil className="w-4 h-4" /> Editar
            </Button>
          )}
          {editing && (
            <>
              <Button
                variant="default"
                className="gap-2"
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}{" "}
                Salvar
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleCancel}
                disabled={saveMutation.isPending}
              >
                <X className="w-4 h-4" /> Cancelar
              </Button>
            </>
          )}
          {!editing && canDelete && (
            <SoftDeleteCaseDialog table={tableName} id={id} onDeleted={() => navigate({ to: listPath })}>
                <Button
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </Button>
            </SoftDeleteCaseDialog>
          )}
        </div>
      </div>

      {editing && (
        <SectionCard title="Identificação">
          <>
            <EditField
              fieldKey="nome_paciente"
              value={draft.nome_paciente}
              onChange={(v) => setDraftField("nome_paciente", v)}
            />
            <EditField
              fieldKey="status"
              value={draft.status}
              onChange={(v) => setDraftField("status", v)}
            />
          </>
        </SectionCard>
      )}



      {SECTIONS.map((section) => {
        const keys = flatKeys.filter((k) => section.match(k));
        if (keys.length === 0) return null;
        return (
          <SectionCard key={section.title} title={section.title}>
            <>
              {section.title === "Paciente" ? (
                <InfoItem label="Nome" value={ficha.nome_paciente} />
              ) : null}
              {keys.map((k) => (
                <div key={k} className="contents">
                  {editing ? (
                    <EditField
                      fieldKey={k}
                      value={draft[k]}
                      onChange={(v) => setDraftField(k, v)}
                    />
                  ) : (
                    renderField(k, enrichedFicha[k])
                  )}
                  {!editing &&
                    (k === "data_notificacao" ||
                      k === "data" ||
                      k === "data_preenchimento" ||
                      k === "data_diagnostico_notificacao") && (
                      <InfoItem
                        label="Sem.Epd."
                        value={ficha[k] ? getSE(ficha[k] as string) : "—"}
                      />
                    )}
                </div>
              ))}
              {section.title === "Conclusão" && encerDias !== null ? (
                <InfoItem label="Encer./Dias" value={String(encerDias)} />
              ) : null}
            </>
          </SectionCard>
        );
      })}

      {/* Outros campos não categorizados */}
      {(() => {
        const used = new Set<string>();
        SECTIONS.forEach((s) => flatKeys.forEach((k) => s.match(k) && used.add(k)));
        const leftover = flatKeys.filter((k) => !used.has(k));
        if (leftover.length === 0 && editing) return null;
        return (
          <SectionCard title="Outras Informações">
            <>
              {leftover.map((k) =>
                editing ? (
                  <EditField
                    key={k}
                    fieldKey={k}
                    value={draft[k]}
                    onChange={(v) => setDraftField(k, v)}
                  />
                ) : (
                  renderField(k, enrichedFicha[k])
                ),
              )}
              {!editing && !leftover.includes("data_encerramento") && (
                <InfoItem
                  label="Data do Encerramento"
                  value={fmtDate(ficha.data_encerramento) ?? "—"}
                />
              )}
            </>
          </SectionCard>
        );
      })()}

      {jsonGroups.map(({ key: groupKey, title, obj }) => {
        const source = (editing ? (draft[groupKey] as AnyObj | undefined) : obj) ?? {};
        const entries = editing ? Object.entries(obj) : Object.entries(source);
        if (entries.length === 0) return null;
        return (
          <SectionCard key={title} title={title}>
            <>
              {entries.map(([k, v]) =>
                editing ? (
                  <EditField
                    key={k}
                    fieldKey={k}
                    value={(source as AnyObj)[k] ?? v}
                    onChange={(nv) => setDraftJsonField(groupKey, k, nv)}
                  />
                ) : v === null || v === undefined || v === "" ? null : (
                  <InfoItem key={k} label={humanizeLabel(k)} value={lbl(v)} />
                ),
              )}
            </>
          </SectionCard>
        );
      })}

      {(editing || obs) && (
        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-primary">
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                rows={4}
                value={(draft.observacoes_adicionais as string) ?? ""}
                onChange={(e) =>
                  setDraftField("observacoes_adicionais", e.target.value)
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {obs}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
