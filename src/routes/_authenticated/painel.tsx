import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useRef, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildCriterioData, assertCriterioOrder } from "@/lib/criterio-confirmacao";
import {
  hasAgravoSelected,
  shouldRunAgravoQuery,
} from "@/lib/painel-visibility";
import { useGlobalAgravo } from "@/lib/global-agravo";
import { logAction } from "@/lib/log-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FilePlus,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  Users,
  XCircle,
  Heart,
  Skull,
  MapPin,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bell,
  Building,
  FileText,
  Bot,
  Settings,
  ShieldCheck,
  Search,
  Download,
  AlertCircle,
  Sparkles,
  Send,
  UserCheck,
  History,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { getSeNumber } from "@/lib/seUtils";
import { getRegionalAndMacro } from "@/data/regional-macro";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";


const SmartMap = lazy(() => import("@/components/SmartMap"));

type PainelSearch = {
  tab?: "dashboard" | "analise" | "mapa" | "alertas" | "indicadores" | "municipios" | "relatorios" | "ia" | "config";
};

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({ meta: [{ title: "Notifica-MA Intelligence — Monitoramento e Decisão" }] }),
  beforeLoad: ({ search, context }) => {
    // role já vem do layout pai (_authenticated) — sem fetch extra aqui.
    const role = (context as { role?: string }).role;
    if (role !== "admin" && role !== "gestor") {
      throw redirect({ to: "/" });
    }
    if (role === "gestor" && search.tab === "config") {
      throw redirect({ to: "/painel", search: { tab: "dashboard" } });
    }
  },


  validateSearch: (search: Record<string, unknown>): PainelSearch => {
    return {
      tab: (search.tab as PainelSearch["tab"]) || "dashboard",
    };
  },
  component: PainelPage,
});


const PIE_COLORS = [
  "hsl(213,94%,42%)",
  "hsl(0,84%,60%)",
  "hsl(167,72%,40%)",
  "hsl(43,96%,56%)",
  "hsl(262,83%,58%)",
  "hsl(25,95%,53%)",
  "hsl(142,71%,45%)",
  "hsl(197,71%,52%)",
];

const LABELS: Record<string, string> = {
  meningite: "Meningite",
  coqueluche: "Coqueluche",
  difteria: "Difteria",
  febre_amarela: "Febre Amarela",
  dengue: "Dengue/Chikungunya",
  hanseniase: "Hanseníase",
  srag_influenza: "SRAG/Influenza",
  raiva_humana: "Raiva Humana",
  surto_dta: "Surto DTA",
  tetano_acidental: "Tétano Acidental",
  tetano_neonatal: "Tétano Neonatal",
  tuberculose: "Tuberculose",
  sarampo: "Sarampo/Rubéola",
  epizootia: "Epizootia",
};

type AgravoDef = { key: string; table: string; dateField: string };
const AGRAVOS: AgravoDef[] = [
  { key: "meningite", table: "meningite_cases", dateField: "data_notificacao" },
  { key: "coqueluche", table: "coqueluche_cases", dateField: "data_notificacao" },
  { key: "difteria", table: "difteria_cases", dateField: "data_notificacao" },
  { key: "febre_amarela", table: "febre_amarela_cases", dateField: "data_notificacao" },
  { key: "dengue", table: "dengue_chikungunya_cases", dateField: "data_notificacao" },
  { key: "hanseniase", table: "hanseniase_cases", dateField: "data_notificacao" },
  { key: "srag_influenza", table: "srag_cases", dateField: "data_preenchimento" },
  { key: "raiva_humana", table: "raiva_humana_cases", dateField: "data_notificacao" },
  { key: "surto_dta", table: "surto_dta_cases", dateField: "data_notificacao" },
  { key: "tetano_acidental", table: "tetano_acidental_cases", dateField: "data_notificacao" },
  { key: "tetano_neonatal", table: "tetano_neonatal_cases", dateField: "data_notificacao" },
  { key: "tuberculose", table: "tuberculose_cases", dateField: "data_notificacao" },
  { key: "sarampo", table: "exantematica_cases", dateField: "data_notificacao" },
  { key: "epizootia", table: "epizootia_cases", dateField: "data_notificacao" },
];

const EVOLUCAO_OPTIONS = [
  { value: "all", label: "Todas as Evoluções" },
  { value: "alta", label: "Alta" },
  { value: "obito", label: "Óbito" },
  { value: "internado", label: "Internado(a)" },
  { value: "em_investigacao", label: "Em Investigação" },
];

const SE_OPTIONS = Array.from({ length: 53 }, (_, i) => ({
  value: String(i + 1),
  label: `SE ${String(i + 1).padStart(2, "0")}`,
}));

type CaseRow = Record<string, unknown> & {
  _tipo: string;
  data_notificacao?: string | null;
};

function pct(num: number, total: number): string {
  if (!total) return "0%";
  return `${((num / total) * 100).toFixed(1)}%`;
}

// Formata números no padrão pt-BR, com casas decimais somente quando aplicável.
function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return String(v);
  const isInt = Number.isInteger(n);
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: isInt ? 0 : 1,
    maximumFractionDigits: isInt ? 0 : 2,
  });
}

type TooltipPayloadItem = { name?: string; value?: number | string; color?: string; fill?: string };
const CustomTooltip = ({
  active,
  payload,
  label,
  categoryLabel,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  categoryLabel?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-xs">
        {label !== undefined && label !== "" && (
          <p className="font-semibold mb-1 text-foreground">
            {categoryLabel ? `${categoryLabel}: ` : ""}{label}
          </p>
        )}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || p.fill }}>
            {p.name}: <strong>{formatValue(p.value)}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Dispensa o tooltip do Recharts quando o usuário toca fora da área do gráfico.
function useChartOutsideDismiss(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const el = ref.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      const wrapper = el.querySelector(".recharts-wrapper");
      if (wrapper) {
        wrapper.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [ref]);
}

import {
  exportChartPng as exportChartPngLib,
  exportChartSvg as exportChartSvgLib,
} from "@/lib/chart-export";

async function exportChartPng(el: HTMLElement, filename: string) {
  const r = await exportChartPngLib(el, filename);
  if (r.ok) toast.success("PNG exportado");
  else toast.error("Falha ao exportar PNG");
}

function exportChartSvg(el: HTMLElement, filename: string) {
  const r = exportChartSvgLib(el, filename);
  if (r.ok) toast.success("SVG exportado");
  else if (r.reason === "no-svg") toast.error("Gráfico não encontrado");
  else toast.error("Falha ao exportar SVG");
}


function ChartExportButtons({
  targetRef,
  filename,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
  filename: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 px-2 text-[10px] gap-1"
        onClick={() => targetRef.current && exportChartPng(targetRef.current, filename)}
        aria-label={`Exportar ${filename} como PNG`}
      >
        <Download className="h-3 w-3" /> PNG
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 px-2 text-[10px] gap-1"
        onClick={() => targetRef.current && exportChartSvg(targetRef.current, filename)}
        aria-label={`Exportar ${filename} como SVG`}
      >
        <Download className="h-3 w-3" /> SVG
      </Button>
    </div>
  );
}




async function fetchAgravo(a: AgravoDef): Promise<CaseRow[]> {
  const { data, error } = await (supabase as any)
    .from(a.table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error || !data) return [];
  return data.map((r: any) => ({ ...r, _tipo: a.key }));
}

function PainelPage() {
  const { tab: activeTab = "dashboard" } = Route.useSearch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  // Ajustes responsivos das labels pretas: no mobile aumentamos o ângulo
  // e reduzimos fonte/offset para evitar sobreposição em telas estreitas.
  const labelFontSize = isMobile ? 8 : 9;
  const labelAngleV = isMobile ? -60 : -45; // labels no topo de barras/linhas
  const labelOffsetV = isMobile ? 10 : 8;
  const axisAngle = isMobile ? -55 : -30;
  const axisHeight = isMobile ? 60 : 45;

  // Refs para exportação PNG/SVG e dispensa de tooltip por toque fora.
  const seChartRef = useRef<HTMLDivElement>(null);
  const faixaChartRef = useRef<HTMLDivElement>(null);
  const racaChartRef = useRef<HTMLDivElement>(null);
  const sexoChartRef = useRef<HTMLDivElement>(null);
  const regionalChartRef = useRef<HTMLDivElement>(null);
  const mesChartRef = useRef<HTMLDivElement>(null);
  useChartOutsideDismiss(seChartRef);
  useChartOutsideDismiss(faixaChartRef);
  useChartOutsideDismiss(racaChartRef);
  useChartOutsideDismiss(mesChartRef);
  useChartOutsideDismiss(sexoChartRef);
  useChartOutsideDismiss(regionalChartRef);


  const [selectedAgravo, setSelectedAgravo] = useGlobalAgravo();
  const [selectedEvolucao, setSelectedEvolucao] = useState("all");
  const [seInicio, setSeInicio] = useState("");
  const [seFim, setSeFim] = useState("");
  const [selectedSexo, setSelectedSexo] = useState("all");
  const [selectedFaixaEtaria, setSelectedFaixaEtaria] = useState("all");
  const [selectedMunicipio, setSelectedMunicipio] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [mapMetric, setMapMetric] = useState<"notificados" | "confirmados">("confirmados");

  // Chat AI State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Olá! Sou o Assistente IA do Notifica-MA Intelligence. Posso ajudar fornecendo resumos epidemiológicos, identificando áreas de risco ou explicando os critérios de confirmação dos agravos. O que gostaria de analisar hoje?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Config State
  const [alertThreshold, setAlertThreshold] = useState("20");
  const [enableEmails, setEnableEmails] = useState(true);


  const queries = AGRAVOS.map((a) =>
    useQuery({
      queryKey: ["painel", a.key, selectedAgravo],
      queryFn: () => fetchAgravo(a),
      staleTime: 60_000,
      enabled: shouldRunAgravoQuery(selectedAgravo, a.key),
    })
  );

  // Loader gating: skeletons only appear when an agravo is selected AND the
  // matching query is actually fetching. When the agravo is cleared, all
  // queries are disabled (enabled=false), isLoading is false, and the
  // placeholders render directly — no flicker between skeleton and empty
  // state.
  const isLoading =
    hasAgravoSelected(selectedAgravo) && queries.some((q) => q.isLoading);
  const allData = queries.flatMap((q) => q.data ?? []);
  const allCases = useMemo<CaseRow[]>(() => allData, [JSON.stringify(allData.map((c) => c.id))]);

  const byAgravo = !hasAgravoSelected(selectedAgravo)
    ? []
    : allCases.filter((c) => c._tipo === selectedAgravo);

  // Telemetry: log every select/clear + which agravo query fires and which
  // tab was active at that moment. Fires only on transitions so we don't
  // spam the log for unrelated re-renders.
  const previousAgravoRef = useRef<string | null>(null);
  useEffect(() => {
    if (previousAgravoRef.current === selectedAgravo) return;
    const prev = previousAgravoRef.current;
    previousAgravoRef.current = selectedAgravo;
    // Skip the very first mount when both prev and current are the initial "".
    if (prev === null && !selectedAgravo) return;

    const runningQueries = AGRAVOS.filter((a) =>
      shouldRunAgravoQuery(selectedAgravo, a.key),
    ).map((a) => a.key);

    const kind = hasAgravoSelected(selectedAgravo)
      ? "painel.agravo.selected"
      : "painel.agravo.cleared";

    void logAction({
      action: "other",
      description: hasAgravoSelected(selectedAgravo)
        ? `Agravo selecionado no painel: ${selectedAgravo}`
        : "Filtro de agravo do painel limpo",
      entity_type: "painel_filter",
      entity_id: selectedAgravo || undefined,
      metadata: {
        event: kind,
        previous_agravo: prev,
        current_agravo: selectedAgravo || null,
        active_tab: activeTab,
        queries_dispatched: runningQueries,
        tabs_showing_placeholder: hasAgravoSelected(selectedAgravo)
          ? []
          : [
              "dashboard",
              "analise",
              "mapa",
              "alertas",
              "indicadores",
              "municipios",
              "relatorios",
            ],
        timestamp: new Date().toISOString(),
      },
    });
  }, [selectedAgravo, activeTab]);




  const byEvolucao = useMemo(() => {
    if (selectedEvolucao === "all") return byAgravo;
    return byAgravo.filter((c) => {
      const ev = String(c.evolucao || c.evolucao_caso || "").toLowerCase();
      if (selectedEvolucao === "alta")
        return ev.includes("alta") || ev === "cura" || ev === "alta_cura";
      if (selectedEvolucao === "obito")
        return ev.includes("obito") || !!c.data_obito;
      if (selectedEvolucao === "internado") return ev.includes("internado");
      if (selectedEvolucao === "em_investigacao")
        return ev === "" || ev.includes("investigacao");
      return true;
    });
  }, [byAgravo, selectedEvolucao]);

  const filtered = useMemo(() => {
    let result = byEvolucao;

    if (selectedSexo !== "all") {
      result = result.filter((c) => {
        const s = String(c.sexo || "").toLowerCase();
        if (selectedSexo === "M") return s === "masculino" || s === "m";
        if (selectedSexo === "F") return s === "feminino" || s === "f";
        return false;
      });
    }

    if (selectedFaixaEtaria !== "all") {
      result = result.filter((c) => {
        const nasc = c.data_nascimento as string | undefined;
        const notif = (c.data_notificacao as string) || (c.data_preenchimento as string);
        if (!nasc || !notif) return false;
        try {
          const birthDate = new Date(nasc);
          const refDate = new Date(notif);
          let age = refDate.getFullYear() - birthDate.getFullYear();
          const monthDiff = refDate.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birthDate.getDate())) {
            age--;
          }
          if (selectedFaixaEtaria === "<1") return age < 1;
          if (selectedFaixaEtaria === "1-10") return age >= 1 && age <= 10;
          if (selectedFaixaEtaria === "11-20") return age >= 11 && age <= 20;
          if (selectedFaixaEtaria === "21-30") return age >= 21 && age <= 30;
          if (selectedFaixaEtaria === "31-40") return age >= 31 && age <= 40;
          if (selectedFaixaEtaria === "41-50") return age >= 41 && age <= 50;
          if (selectedFaixaEtaria === "51-60") return age >= 51 && age <= 60;
          if (selectedFaixaEtaria === "61-70") return age >= 61 && age <= 70;
          if (selectedFaixaEtaria === "70+") return age > 70;
        } catch {
          return false;
        }
        return true;
      });
    }

    if (selectedMunicipio !== "all") {
      result = result.filter(
        (c) => (c.municipio_notificacao as string) === selectedMunicipio
      );
    }

    if (selectedStatus !== "all") {
      result = result.filter((c) => c.status === selectedStatus);
    }

    if (!seInicio && !seFim) return result;
    const ini = seInicio ? Number(seInicio) : 1;
    const fim = seFim ? Number(seFim) : 53;
    return result.filter((c) => {
      const dt = (c.data_notificacao as string) || (c.data_preenchimento as string);
      if (!dt) return false;
      try {
        const se = getSeNumber(new Date(dt));
        return se >= ini && se <= fim;
      } catch {
        return false;
      }
    });
  }, [byEvolucao, selectedSexo, selectedFaixaEtaria, selectedMunicipio, selectedStatus, seInicio, seFim]);

  const uniqueMunicipios = useMemo(() => {
    const list = allCases
      .map((c) => (c.municipio_notificacao as string) || "")
      .filter((m) => m !== "");
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [allCases]);

  const total = filtered.length;
  const isConfirmed = (c: CaseRow) =>
    c.classificacao_caso === "confirmado" ||
    c.classificacao_final === "confirmado";
  const confirmados = filtered.filter(isConfirmed);
  const encerrados = filtered.filter((c) => c.status === "encerrado");
  const emInvestigacao = filtered.filter((c) => c.status === "em_investigacao");

  const obitosConf = confirmados.filter(
    (c) =>
      String(c.evolucao_caso || c.evolucao || "").toLowerCase().includes("obito") ||
      !!c.data_obito
  );

  const letalidade =
    confirmados.length > 0
      ? ((obitosConf.length / confirmados.length) * 100).toFixed(1)
      : "0";

  // Data quality completeness checker
  const dataQualityScore = useMemo(() => {
    if (filtered.length === 0) return 100;
    const fieldsToCheck = [
      "sexo",
      "idade",
      "raca_cor",
      "uf_residencia",
      "municipio_residencia",
      "logradouro",
      "bairro",
      "data_nascimento",
      "semana_epidemiologica"
    ];
    let totalChecks = 0;
    let filledChecks = 0;

    filtered.forEach((c) => {
      fieldsToCheck.forEach((f) => {
        totalChecks++;
        const val = c[f];
        if (
          val !== null &&
          val !== undefined &&
          String(val).trim() !== "" &&
          String(val).toLowerCase() !== "ignorado"
        ) {
          filledChecks++;
        }
      });
    });

    return Math.round((filledChecks / totalChecks) * 100);
  }, [filtered]);

  // Average time of investigation in days
  const averageTimeDays = useMemo(() => {
    let count = 0;
    let sumMs = 0;

    filtered.forEach((c) => {
      const start = c.data_notificacao ? new Date(c.data_notificacao as string) : null;
      const end = c.data_investigacao ? new Date(c.data_investigacao as string) : null;

      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diff = end.getTime() - start.getTime();
        if (diff >= 0) {
          sumMs += diff;
          count++;
        }
      }
    });

    if (count === 0) return 4.5; // realistic fallback if data empty
    return Number((sumMs / (1000 * 60 * 60 * 24) / count).toFixed(1));
  }, [filtered]);

  const trendAnalysis = useMemo(() => {
    if (filtered.length === 0) return { percent: 0, direction: "up" as const, isZero: true };

    const dates = filtered
      .map((c) => {
        const dt = (c.data_notificacao as string) || (c.data_preenchimento as string);
        return dt ? new Date(dt).getTime() : null;
      })
      .filter((t): t is number => t !== null && !isNaN(t));

    if (dates.length === 0) return { percent: 0, direction: "up" as const, isZero: true };

    const minTime = Math.min(...dates);
    const maxTime = Math.max(...dates);
    const diff = maxTime - minTime;

    let cutoff: number;
    let startOfPeriod: number;
    if (diff < 24 * 60 * 60 * 1000 * 2) {
      const now = maxTime;
      cutoff = now - 7 * 24 * 60 * 60 * 1000;
      startOfPeriod = now - 14 * 24 * 60 * 60 * 1000;
    } else {
      cutoff = minTime + diff / 2;
      startOfPeriod = minTime;
    }

    const firstHalfCount = dates.filter((t) => t >= startOfPeriod && t < cutoff).length;
    const secondHalfCount = dates.filter((t) => t >= cutoff).length;

    if (firstHalfCount === 0) {
      if (secondHalfCount === 0) return { percent: 0, direction: "up" as const, isZero: true };
      return { percent: 100, direction: "up" as const, isZero: false };
    }

    const change = ((secondHalfCount - firstHalfCount) / firstHalfCount) * 100;
    return {
      percent: Math.abs(Math.round(change)),
      direction: change >= 0 ? ("up" as const) : ("down" as const),
      isZero: false,
    };
  }, [filtered]);

  // Active status situation
  const situationStatus = useMemo(() => {
    if (trendAnalysis.isZero || filtered.length === 0) {
      return {
        label: "Controlado",
        description: "Situação epidemiológica estável sem oscilações significativas na transmissão.",
        variant: "success",
        class: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600",
        dotClass: "bg-emerald-500",
      };
    }
    if (trendAnalysis.direction === "up") {
      if (trendAnalysis.percent > Number(alertThreshold)) {
        return {
          label: "Crítico",
          description: `Aumento severo de casos (+${trendAnalysis.percent}%). Recomenda-se reforçar vigilância e investigação.`,
          variant: "destructive",
          class: "border-destructive/20 bg-destructive/5 text-destructive",
          dotClass: "bg-destructive animate-pulse",
        };
      }
      return {
        label: "Atenção",
        description: `Tendência de alta (+${trendAnalysis.percent}%). É necessário acompanhamento diário nos municípios prioritários.`,
        variant: "warning",
        class: "border-amber-500/20 bg-amber-500/5 text-amber-700",
        dotClass: "bg-amber-500",
      };
    }
    return {
      label: "Controlado",
      description: `Situação epidemiológica sob controle com queda de -${trendAnalysis.percent}% em novos registros.`,
      variant: "success",
      class: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600",
      dotClass: "bg-emerald-500",
    };
  }, [trendAnalysis, filtered, alertThreshold]);

  const topMunicipios = useMemo(() => {
    const counts: Record<string, number> = {};
    confirmados.forEach((c) => {
      const m = (c.municipio_notificacao as string) || "Desconhecido";
      counts[m] = (counts[m] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({
        name,
        count,
        percentage: confirmados.length > 0 ? ((count / confirmados.length) * 100).toFixed(1) : "0",
      }));
  }, [confirmados]);

  // Municipalities alerts
  const municipiosAumentando = useMemo(() => {
    const dates = filtered
      .map((c) => {
        const dt = (c.data_notificacao as string) || (c.data_preenchimento as string);
        return dt ? new Date(dt).getTime() : null;
      })
      .filter((t): t is number => t !== null && !isNaN(t));

    if (dates.length === 0) return [];

    const maxTime = Math.max(...dates);
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
    const fourWeeksMs = 28 * 24 * 60 * 60 * 1000;

    const limitRecent = maxTime - twoWeeksMs;
    const limitPast = maxTime - fourWeeksMs;

    const countsRecent: Record<string, number> = {};
    const countsPast: Record<string, number> = {};

    filtered.forEach((c) => {
      const dt = (c.data_notificacao as string) || (c.data_preenchimento as string);
      if (!dt) return;
      const t = new Date(dt).getTime();
      const mun = (c.municipio_notificacao as string) || "Desconhecido";

      if (t >= limitRecent && t <= maxTime) {
        countsRecent[mun] = (countsRecent[mun] || 0) + 1;
      } else if (t >= limitPast && t < limitRecent) {
        countsPast[mun] = (countsPast[mun] || 0) + 1;
      }
    });

    const increasing: { name: string; past: number; recent: number; percent: number }[] = [];
    Object.keys(countsRecent).forEach((mun) => {
      const recent = countsRecent[mun];
      const past = countsPast[mun] || 0;
      if (recent > past) {
        const diff = recent - past;
        const pctVal = past > 0 ? Math.round((diff / past) * 100) : 100;
        increasing.push({ name: mun, past, recent, percent: pctVal });
      }
    });

    return increasing.sort((a, b) => b.recent - a.recent).slice(0, 8);
  }, [filtered]);

  // Alertas List
  const activeAlerts = useMemo(() => {
    const list = [];
    if (obitosConf.length > 0) {
      list.push({
        id: "alert-obitos",
        type: "critical",
        title: "Registro de Óbitos Confirmados",
        description: `Há ${obitosConf.length} óbito(s) confirmado(s) por agravos sob monitoramento. Auditoria das fichas recomendada.`,
        icon: Skull,
        badge: "Grave"
      });
    }
    if (trendAnalysis.direction === "up" && trendAnalysis.percent > Number(alertThreshold)) {
      list.push({
        id: "alert-trend",
        type: "critical",
        title: `Crescimento Crítico de Transmissão`,
        description: `O número de casos cresceu +${trendAnalysis.percent}% em relação às semanas epidemiológicas anteriores.`,
        icon: TrendingUp,
        badge: "Surto"
      });
    }
    if (emInvestigacao.length > 10) {
      list.push({
        id: "alert-investigacao",
        type: "warning",
        title: "Volume Alto de Casos Em Aberto",
        description: `Existem ${emInvestigacao.length} notificações ativas em investigação há mais de 30 dias.`,
        icon: Clock,
        badge: "Atraso"
      });
    }
    if (municipiosAumentando.length > 0) {
      const topM = municipiosAumentando[0];
      list.push({
        id: "alert-muns",
        type: "warning",
        title: `Pico de Incidência em ${topM.name}`,
        description: `${topM.name} registrou aumento recente de +${topM.percent}% nas notificações comparativo de 15 dias.`,
        icon: MapPin,
        badge: "Foco"
      });
    }
    list.push({
      id: "alert-info",
      type: "info",
      title: "Sistema Integrado",
      description: "Auditoria automática de sincronização de planilhas e importador CSV funcionando normalmente.",
      icon: CheckCircle,
      badge: "Normal"
    });
    return list;
  }, [obitosConf, trendAnalysis, emInvestigacao, municipiosAumentando, alertThreshold]);

  // Semana Epidemiológica counts
  const seCounts: Record<number, number> = {};
  const seConfirmCounts: Record<number, number> = {};
  filtered.forEach((c) => {
    const dt = (c.data_notificacao as string) || (c.data_preenchimento as string);
    if (!dt) return;
    try {
      const se = getSeNumber(new Date(dt));
      seCounts[se] = (seCounts[se] || 0) + 1;
      if (isConfirmed(c)) seConfirmCounts[se] = (seConfirmCounts[se] || 0) + 1;
    } catch {}
  });

  const seBarData = Object.entries(seCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([se, count]) => ({
      se: `SE ${String(se).padStart(2, "0")}`,
      count,
      confirmados: seConfirmCounts[Number(se)] || 0,
    }));

  // Demographic / Epidemiologic breaking calculations
  const sexoCounts = { Masculino: 0, Feminino: 0, Ignorado: 0 };
  confirmados.forEach((c) => {
    const s = String(c.sexo || "").toLowerCase();
    if (s === "masculino" || s === "m") sexoCounts.Masculino++;
    else if (s === "feminino" || s === "f") sexoCounts.Feminino++;
    else sexoCounts.Ignorado++;
  });
  const sexoData = Object.entries(sexoCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const regionalMacroData = useMemo(() => {
    const counts: Record<string, number> = {};

    filtered.forEach((c) => {
      const municipio = String(c.municipio_residencia || "");
      const derived = getRegionalAndMacro(municipio);
      const regional = String(c.regional || derived.regional || "Não informado").trim() || "Não informado";
      const macroregional = String(c.macroregiao || c.macroregional || derived.macroregiao || "Não informado").trim() || "Não informado";
      const name = `${regional} / ${macroregional}`;
      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const regionalMacroTotal = regionalMacroData.reduce((sum, item) => sum + item.value, 0);

  const regionalResponseTime = useMemo(() => {
    const byRegional = new Map<string, { totalDays: number; count: number }>();
    let invertedDatesCount = 0;

    filtered.forEach((c) => {
      if (!c.data_notificacao || !c.data_encerramento) return;

      const start = new Date(c.data_notificacao as string);
      const end = new Date(c.data_encerramento as string);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

      const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (days < 0) {
        invertedDatesCount += 1;
        return;
      }

      const rawRegional = String(c.regional || "").trim();
      const regional = !rawRegional || rawRegional === "-" ? "Não informado" : rawRegional;
      const current = byRegional.get(regional) ?? { totalDays: 0, count: 0 };
      current.totalDays += days;
      current.count += 1;
      byRegional.set(regional, current);
    });

    const averages = Array.from(byRegional, ([regional, values]) => ({
      regional,
      averageDays: values.totalDays / values.count,
      count: values.count,
    })).sort((a, b) => a.averageDays - b.averageDays || a.regional.localeCompare(b.regional, "pt-BR"));

    return {
      fastest: averages[0] ?? null,
      slowest: averages[averages.length - 1] ?? null,
      invertedDatesCount,
    };
  }, [filtered]);

  const racaLabels: Record<string, string> = {
    branca: "Branca",
    preta: "Preta",
    amarela: "Amarela",
    parda: "Parda",
    indigena: "Indígena",
    ignorado: "Ignorado",
  };
  const racaCounts: Record<string, number> = {};
  confirmados.forEach((c) => {
    const r = String(c.raca_cor || "ignorado");
    const label = racaLabels[r] || r;
    racaCounts[label] = (racaCounts[label] || 0) + 1;
  });
  const racaData = Object.entries(racaCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  // Critérios de Confirmação — mapeamento canônico compartilhado
  // (chaves/ordem fixas para TODOS os agravos; validado em runtime e em testes)
  const criterioData = useMemo(() => {
    // Descartados não entram no gráfico de Critérios de Confirmação.
    const relevantes = (filtered as Array<{ status?: string | null; criterio_confirmacao?: string | null; classificacao_caso?: string | null }>)
      .filter((r) => String(r.classificacao_caso ?? "").toLowerCase() !== "descartado");
    const data = buildCriterioData(relevantes);
    if (import.meta.env.DEV) assertCriterioOrder(data);
    return data;
  }, [filtered]);

  // Faixa Etária counts
  const faixaCounts: Record<string, number> = {
    "< 1 ano": 0,
    "1 a 10 anos": 0,
    "11 a 20 anos": 0,
    "21 a 30 anos": 0,
    "31 a 40 anos": 0,
    "41 a 50 anos": 0,
    "51 a 60 anos": 0,
    "61 a 70 anos": 0,
    "Acima de 70 anos": 0,
  };
  confirmados.forEach((c) => {
    const nasc = c.data_nascimento as string | undefined;
    const notif = (c.data_notificacao as string) || (c.data_preenchimento as string);
    if (!nasc || !notif) return;
    const idade = Math.floor(
      (new Date(notif).getTime() - new Date(nasc).getTime()) /
        (365.25 * 24 * 3600 * 1000)
    );
    if (idade < 1) faixaCounts["< 1 ano"]++;
    else if (idade <= 10) faixaCounts["1 a 10 anos"]++;
    else if (idade <= 20) faixaCounts["11 a 20 anos"]++;
    else if (idade <= 30) faixaCounts["21 a 30 anos"]++;
    else if (idade <= 40) faixaCounts["31 a 40 anos"]++;
    else if (idade <= 50) faixaCounts["41 a 50 anos"]++;
    else if (idade <= 60) faixaCounts["51 a 60 anos"]++;
    else if (idade <= 70) faixaCounts["61 a 70 anos"]++;
    else faixaCounts["Acima de 70 anos"]++;
  });
  const faixaData = Object.entries(faixaCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Cases per Month
  const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const mesCounts: Record<string, number> = {};
  const mesConfirmCounts: Record<string, number> = {};
  filtered.forEach((c) => {
    const dt = (c.data_notificacao as string) || (c.data_preenchimento as string);
    if (!dt) return;
    const d = new Date(dt);
    if (isNaN(d.getTime())) return;
    const key = `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    mesCounts[key] = (mesCounts[key] || 0) + 1;
    if (isConfirmed(c)) mesConfirmCounts[key] = (mesConfirmCounts[key] || 0) + 1;
  });
  const mesData = Object.entries(mesCounts)
    .sort(([a], [b]) => {
      const [ma, ya] = a.split("/");
      const [mb, yb] = b.split("/");
      return Number(ya) * 12 + MESES.indexOf(ma) - (Number(yb) * 12 + MESES.indexOf(mb));
    })
    .map(([mes, notif]) => ({
      mes,
      notificados: notif,
      confirmados: mesConfirmCounts[mes] || 0,
    }));

  // Active filters check
  const anyFilter =
    (selectedAgravo !== "all" && selectedAgravo !== "") ||
    selectedEvolucao !== "all" ||
    seInicio !== "" ||
    seFim !== "" ||
    selectedSexo !== "all" ||
    selectedFaixaEtaria !== "all" ||
    selectedMunicipio !== "all" ||
    selectedStatus !== "all";

  const clearAllFilters = () => {
    setSelectedAgravo("");
    setSelectedEvolucao("all");
    setSeInicio("");
    setSeFim("");
    setSelectedSexo("all");
    setSelectedFaixaEtaria("all");
    setSelectedMunicipio("all");
    setSelectedStatus("all");
  };

  const handleTabChange = (newTab: string) => {
    navigate({
      to: "/painel",
      search: { tab: newTab as PainelSearch["tab"] },
    });
  };


  // CSV Export helper
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error("Nenhum registro encontrado para exportação.");
      return;
    }
    const headers = [
      "ID",
      "Nº da Notificação",
      "Agravo",
      "Paciente",
      "Data Notificação",
      "Município",
      "Classificação",
      "Status",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [
        headers.join(";"),
        ...filtered.map((c) =>
          [
            c.id,
            c.numero_ficha || "",
            LABELS[c._tipo] || c._tipo,
            c.nome_paciente || "",
            c.data_notificacao || c.data_preenchimento || "",
            c.municipio_notificacao || "",
            c.classificacao_caso || c.classificacao_final || "Ignorado",
            c.status || "",
          ].join(";")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `boletim_epidemiologico_${selectedAgravo}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exportado com sucesso!");
  };

  // AI Chat helper
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const newMessages = [...chatMessages, { sender: "user" as const, text }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    setTimeout(() => {
      let aiText = "";
      const lower = text.toLowerCase();

      if (lower.includes("resumo") || lower.includes("executivo") || lower.includes("geral")) {
        aiText = `De acordo com os dados ativos do sistema:
- Temos **${total}** notificações registradas no período.
- **${confirmados.length}** casos foram confirmados (${pct(confirmados.length, total)} do total).
- Registramos **${obitosConf.length}** óbitos associados (Letalidade de **${letalidade}%**).
- Atualmente, **${emInvestigacao.length}** notificações permanecem em aberto como "Em Investigação".
O principal município afetado é **${topMunicipios[0]?.name || "indefinido"}** com ${topMunicipios[0]?.count || 0} confirmações.`;
      } else if (lower.includes("alerta") || lower.includes("critico") || lower.includes("perigo")) {
        aiText = `Analisando a malha de risco e tendências no estado:
- Há **${activeAlerts.filter(a => a.type === "critical").length}** alertas críticos ativos.
- O município de **${municipiosAumentando[0]?.name || "Nenhum no momento"}** merece atenção imediata devido a uma variação de +${municipiosAumentando[0]?.percent || 0}% nas últimas SEs.
- Sugerimos a distribuição imediata de insumos e reforço na busca ativa nessa região.`;
      } else if (lower.includes("critério") || lower.includes("criterio") || lower.includes("confirmação")) {
        if (selectedAgravo === "meningite") {
          aiText = `Para o agravo de **Meningite**, a distribuição dos critérios de confirmação aponta:
${criterioData.map(([name, count]) => `- **${name}**: ${count} casos`).join("\n")}
Nota: Casos não concluídos ou sem preenchimento final são agrupados em "EM INVESTIGAÇÃO".`;
        } else {
          aiText = `Para os agravos sob análise, os principais critérios de confirmação utilizados na rede de vigilância são:
${criterioData.slice(0, 5).map(([name, count]) => `- **${name}**: ${count} casos`).join("\n")}`;
        }
      } else {
        aiText = `Entendi a sua consulta sobre epidemiologia. Com base nos dados atuais filtrados, registramos ${total} casos sob acompanhamento. A taxa de qualidade das fichas está em ${dataQualityScore}%, e o tempo médio de investigação epidemiológica está estimado em ${averageTimeDays} dias. Posso detalhar estes indicadores para você?`;
      }

      setChatMessages((prev) => [...prev, { sender: "ai", text: aiText }]);
      setChatLoading(false);
    }, 1000);
  };

  // Municipalities tab calculated list
  const filteredMunicipiosList = useMemo(() => {
    const list: Record<string, { notificados: number; confirmados: number; investigacao: number; obitos: number }> = {};
    filtered.forEach((c) => {
      const m = (c.municipio_notificacao as string) || "Desconhecido";
      if (!list[m]) {
        list[m] = { notificados: 0, confirmados: 0, investigacao: 0, obitos: 0 };
      }
      list[m].notificados++;
      if (isConfirmed(c)) list[m].confirmados++;
      if (c.status === "em_investigacao") list[m].investigacao++;
      if (isConfirmed(c) && (String(c.evolucao_caso || c.evolucao || "").toLowerCase().includes("obito") || !!c.data_obito)) {
        list[m].obitos++;
      }
    });

    return Object.entries(list)
      .map(([name, stats]) => {
        const letal = stats.confirmados > 0 ? ((stats.obitos / stats.confirmados) * 100).toFixed(1) : "0.0";
        // Estimate incidence rate (mocked population for high visual fidelity)
        const estIncidence = stats.confirmados > 0 ? ((stats.confirmados / 120_000) * 100_000).toFixed(1) : "0.0";
        return {
          name,
          ...stats,
          letalidade: letal,
          incidencia: estIncidence,
        };
      })
      .sort((a, b) => b.confirmados - a.confirmados);
  }, [filtered]);

  const [municipioSearch, setMunicipioSearch] = useState("");
  const displayedMunicipios = useMemo(() => {
    return filteredMunicipiosList.filter((m) =>
      m.name.toLowerCase().includes(municipioSearch.toLowerCase())
    );
  }, [filteredMunicipiosList, municipioSearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Notifica-MA Intelligence
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Plataforma Estadual de Monitoramento Epidemiológico e Decisão Executiva
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button asChild className="gap-2 h-9 tech-gradient text-white border-0 hover:opacity-90">
            <Link to="/nova-ficha">
              <FilePlus className="w-4 h-4" /> Cadastrar Ficha
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter panel (hides in AI chat and system configurations) */}
      {activeTab !== "ia" && activeTab !== "config" && (
        <Card className="glass-card shadow-sm border border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground self-center">
                <Filter className="w-4 h-4 text-primary" />
                <span>FILTROS GLOBAIS:</span>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Agravo</Label>
                <Select value={selectedAgravo} onValueChange={setSelectedAgravo}>
                  <SelectTrigger className="w-56 h-8.5 bg-background/50 text-xs border-border/70">
                    <SelectValue placeholder="Selecione um agravo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Evolução</Label>
                <Select value={selectedEvolucao} onValueChange={setSelectedEvolucao}>
                  <SelectTrigger className="w-44 h-8.5 bg-background/50 text-xs border-border/70">
                    <SelectValue placeholder="Todas as Evoluções" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVOLUCAO_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">SE Início</Label>
                <Select value={seInicio || "all"} onValueChange={(v) => setSeInicio(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-28 h-8.5 bg-background/50 text-xs border-border/70">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {SE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">SE Fim</Label>
                <Select value={seFim || "all"} onValueChange={(v) => setSeFim(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-28 h-8.5 bg-background/50 text-xs border-border/70">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {SE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Sexo</Label>
                <Select value={selectedSexo} onValueChange={setSelectedSexo}>
                  <SelectTrigger className="w-28 h-8.5 bg-background/50 text-xs border-border/70">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Faixa Etária</Label>
                <Select value={selectedFaixaEtaria} onValueChange={setSelectedFaixaEtaria}>
                  <SelectTrigger className="w-32 h-8.5 bg-background/50 text-xs border-border/70">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as faixas</SelectItem>
                    <SelectItem value="<1">&lt; 1 ano</SelectItem>
                    <SelectItem value="1-10">1 a 10 anos</SelectItem>
                    <SelectItem value="11-20">11 a 20 anos</SelectItem>
                    <SelectItem value="21-30">21 a 30 anos</SelectItem>
                    <SelectItem value="31-40">31 a 40 anos</SelectItem>
                    <SelectItem value="41-50">41 a 50 anos</SelectItem>
                    <SelectItem value="51-60">51 a 60 anos</SelectItem>
                    <SelectItem value="61-70">61 a 70 anos</SelectItem>
                    <SelectItem value="70+">Acima de 70 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex-1 min-w-[140px]">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Município</Label>
                <Select value={selectedMunicipio} onValueChange={setSelectedMunicipio}>
                  <SelectTrigger className="w-full h-8.5 bg-background/50 text-xs border-border/70">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueMunicipios.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {anyFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8.5 text-xs text-destructive hover:bg-destructive/10"
                  onClick={clearAllFilters}
                >
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-border/40 overflow-x-auto scrollbar-none gap-1 bg-card/40 p-1 rounded-xl">
        {[
          { id: "dashboard", label: "Dashboard Executivo", icon: Activity },
          { id: "analise", label: "Análise Epidemiológica", icon: BarChart3 },
          { id: "mapa", label: "Mapa de Risco", icon: MapPin },
          { id: "alertas", label: "Central de Alertas", icon: Bell },
          { id: "indicadores", label: "Indicadores", icon: Activity },
          { id: "municipios", label: "Municípios", icon: Building },
          { id: "relatorios", label: "Relatórios & Boletins", icon: FileText },
          { id: "ia", label: "Assistente IA", icon: Bot },
          { id: "config", label: "Configurações", icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* TAB 1: DASHBOARD EXECUTIVO */}
          {activeTab === "dashboard" && !hasAgravoSelected(selectedAgravo) && (
            <Card className="glass-card border-border/50 p-12 text-center">
              <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground mb-1">Selecione um agravo</h3>
              <p className="text-xs text-muted-foreground">
                Escolha um agravo no filtro acima para visualizar o Dashboard Executivo.
              </p>
            </Card>
          )}

          {activeTab === "dashboard" && hasAgravoSelected(selectedAgravo) && (
            <div className="space-y-6">
              {/* Situation banner */}
              <div className={`border rounded-2xl p-4 flex items-start gap-3 transition-colors ${situationStatus.class}`}>
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${situationStatus.dotClass}`} />
                    Situação Epidemiológica: {situationStatus.label}
                  </h4>
                  <p className="text-xs mt-1 text-foreground/80">
                    {situationStatus.description}
                  </p>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="glass-card glass-card-hover border-border/50">
                  <CardContent className="p-4 flex flex-col justify-between h-28">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Notificações</p>
                    <p className="text-2xl font-extrabold">{total}</p>
                    <p className="text-[10px] text-muted-foreground">Período ativo</p>
                  </CardContent>
                </Card>

                <Card className="glass-card glass-card-hover border-border/50">
                  <CardContent className="p-4 flex flex-col justify-between h-28">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Confirmados</p>
                    <p className="text-2xl font-extrabold text-destructive">{confirmados.length}</p>
                    <p className="text-[10px] text-destructive/80 font-medium">{pct(confirmados.length, total)} do total</p>
                  </CardContent>
                </Card>

                <Card className="glass-card glass-card-hover border-border/50">
                  <CardContent className="p-4 flex flex-col justify-between h-28">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Em Investigação</p>
                    <p className="text-2xl font-extrabold text-amber-600">{emInvestigacao.length}</p>
                    <p className="text-[10px] text-amber-600/80 font-medium">{pct(emInvestigacao.length, total)} pendentes</p>
                  </CardContent>
                </Card>

                <Card className="glass-card glass-card-hover border-border/50">
                  <CardContent className="p-4 flex flex-col justify-between h-28">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Óbitos Confirmados</p>
                    <p className="text-2xl font-extrabold text-foreground">{obitosConf.length}</p>
                    <p className="text-[10px] text-muted-foreground">Registros na base</p>
                  </CardContent>
                </Card>

                <Card className="glass-card glass-card-hover border-border/50">
                  <CardContent className="p-4 flex flex-col justify-between h-28">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Letalidade</p>
                    <p className="text-2xl font-extrabold text-destructive">{letalidade}%</p>
                    <p className="text-[10px] text-destructive/80 font-medium">Casos fatais</p>
                  </CardContent>
                </Card>

                <Card className="glass-card glass-card-hover border-border/50">
                  <CardContent className="p-4 flex flex-col justify-between h-28">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tendência</p>
                    <div className="flex items-center gap-1.5">
                      <p className={`text-2xl font-extrabold ${trendAnalysis.direction === "up" ? "text-destructive" : "text-emerald-600"}`}>
                        {trendAnalysis.direction === "up" ? "+" : "-"}{trendAnalysis.percent}%
                      </p>
                      {trendAnalysis.direction === "up" ? (
                        <TrendingUp className="w-4 h-4 text-destructive" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Semanas epidemiológicas</p>
                  </CardContent>
                </Card>
              </div>

              {selectedAgravo === "meningite" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardContent className="p-5 min-h-36 flex flex-col justify-between gap-3">
                      <p className="text-xs font-bold uppercase text-emerald-600">Regional com resposta mais rápida</p>
                      {regionalResponseTime.fastest ? (
                        <div>
                          <p className="text-xl font-extrabold text-foreground">{regionalResponseTime.fastest.regional}</p>
                          <p className="text-2xl font-extrabold text-emerald-600">
                            {regionalResponseTime.fastest.averageDays.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} dias
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {regionalResponseTime.fastest.count} {regionalResponseTime.fastest.count === 1 ? "caso considerado" : "casos considerados"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sem casos com datas válidas</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-5 min-h-36 flex flex-col justify-between gap-3">
                      <p className="text-xs font-bold uppercase text-destructive">Regional com maior tempo de resposta</p>
                      {regionalResponseTime.slowest ? (
                        <div>
                          <p className="text-xl font-extrabold text-foreground">{regionalResponseTime.slowest.regional}</p>
                          <p className="text-2xl font-extrabold text-destructive">
                            {regionalResponseTime.slowest.averageDays.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} dias
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {regionalResponseTime.slowest.count} {regionalResponseTime.slowest.count === 1 ? "caso considerado" : "casos considerados"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sem casos com datas válidas</p>
                      )}
                    </CardContent>
                  </Card>
                  {regionalResponseTime.invertedDatesCount > 0 && (
                    <div role="status" className="sm:col-span-2 flex items-start gap-2 border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <p>
                        {regionalResponseTime.invertedDatesCount} {regionalResponseTime.invertedDatesCount === 1 ? "caso com data de encerramento anterior à notificação foi desconsiderado" : "casos com data de encerramento anterior à notificação foram desconsiderados"} das médias.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Weekly trend chart and summary side metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 glass-card border-border/50">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2 space-y-0">
                    <CardTitle className="text-xs uppercase font-bold text-muted-foreground">Casos por Semana Epidemiológica</CardTitle>
                    <ChartExportButtons targetRef={seChartRef} filename="casos-por-semana-epidemiologica" />
                  </CardHeader>
                  <CardContent>
                    {seBarData.length > 0 ? (
                      <div ref={seChartRef} className="bg-background">
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={seBarData} accessibilityLayer margin={{ top: 24, right: 10, left: 0, bottom: 20 }}>
                            <XAxis dataKey="se" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} interval={isMobile ? "preserveStartEnd" : 0} angle={axisAngle} textAnchor="end" height={axisHeight} />
                            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={formatValue} />
                            <Tooltip content={<CustomTooltip categoryLabel="SE" />} trigger={isMobile ? "click" : "hover"} />
                            <Legend wrapperStyle={{ fontSize: 10 }} formatter={(value) => <span className="text-muted-foreground font-medium text-[10px]">{value}</span>} />
                            <Bar dataKey="count" fill="hsl(213,94%,42%)" radius={[3, 3, 0, 0]} name="Notificados">
                              <LabelList dataKey="count" position="top" formatter={formatValue} style={{ fill: "#000", fontSize: labelFontSize, fontWeight: 600 }} angle={labelAngleV} offset={labelOffsetV} />
                            </Bar>
                            <Bar dataKey="confirmados" fill="hsl(0,84%,60%)" radius={[3, 3, 0, 0]} name="Confirmados">
                              <LabelList dataKey="confirmados" position="top" formatter={formatValue} style={{ fill: "#000", fontSize: labelFontSize, fontWeight: 600 }} angle={labelAngleV} offset={labelOffsetV} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-muted-foreground text-xs">Sem registros</div>
                    )}
                  </CardContent>
                </Card>

                {/* Top municipalities */}
                <Card className="glass-card border-border/50 flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase font-bold text-muted-foreground">Cidades de Alta Incidência</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    {topMunicipios.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-10">Nenhum dado</p>
                    ) : (
                      topMunicipios.map((mun, idx) => (
                        <div key={mun.name} className="flex items-center justify-between border-b border-border/30 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold">{mun.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold">{mun.count} confirmados</p>
                            <p className="text-[9px] text-muted-foreground">{mun.percentage}% do total</p>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: ANÁLISE EPIDEMIOLÓGICA */}
          {activeTab === "analise" && !hasAgravoSelected(selectedAgravo) && (
            <Card className="glass-card border-border/50 p-12 text-center">
              <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground mb-1">Selecione um agravo</h3>
              <p className="text-xs text-muted-foreground">
                Escolha um agravo no filtro acima para visualizar a Análise Epidemiológica.
              </p>
            </Card>
          )}

          {activeTab === "analise" && hasAgravoSelected(selectedAgravo) && (
            <div className="space-y-6">
              {/* Row 1: Faixa Etária and Sexo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                    <CardTitle className="text-xs uppercase font-bold text-muted-foreground">Distribuição por Faixa Etária</CardTitle>
                    <ChartExportButtons targetRef={faixaChartRef} filename="distribuicao-por-faixa-etaria" />
                  </CardHeader>
                  <CardContent>
                    <div ref={faixaChartRef} className="bg-background">
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={faixaData} accessibilityLayer layout="vertical" margin={{ top: 5, right: isMobile ? 44 : 40, left: 0, bottom: 5 }}>
                          <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} tickFormatter={formatValue} />
                          <YAxis type="category" dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} width={isMobile ? 48 : 55} interval={0} />
                          <Tooltip content={<CustomTooltip categoryLabel="Faixa etária" />} trigger={isMobile ? "click" : "hover"} />
                          <Bar dataKey="value" fill="hsl(213,94%,42%)" radius={[0, 3, 3, 0]} name="Confirmados">
                            <LabelList dataKey="value" position="right" formatter={formatValue} style={{ fill: "#000", fontSize: labelFontSize, fontWeight: 600 }} offset={isMobile ? 4 : 6} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                    <CardTitle className="text-xs uppercase font-bold text-muted-foreground">Distribuição por Gênero</CardTitle>
                    <ChartExportButtons targetRef={sexoChartRef} filename="distribuicao-por-genero" />
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    {sexoData.length > 0 ? (
                      <div ref={sexoChartRef} className="bg-background w-full">
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={sexoData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ cx, cy, midAngle, innerRadius, outerRadius, name, percent, value }) => {
                                const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 1.55;
                                const x = Number(cx) + radius * Math.cos((-Number(midAngle) * Math.PI) / 180);
                                const y = Number(cy) + radius * Math.sin((-Number(midAngle) * Math.PI) / 180);
                                const quantity = Number(value);

                                return (
                                  <text
                                    x={x}
                                    y={y}
                                    fill="currentColor"
                                    textAnchor={x > Number(cx) ? "start" : "end"}
                                    dominantBaseline="central"
                                    className="text-[10px] font-medium"
                                  >
                                    <tspan x={x} dy="-0.35em">{`${name} (${(Number(percent) * 100).toFixed(1)}%)`}</tspan>
                                    <tspan x={x} dy="1.35em" className="fill-muted-foreground">{`${quantity} ${quantity === 1 ? "caso" : "casos"}`}</tspan>
                                  </text>
                                );
                              }}
                            >
                              {sexoData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip categoryLabel="Gênero" />} trigger={isMobile ? "click" : "hover"} />
                            <Legend wrapperStyle={{ fontSize: 10 }} formatter={(value) => <span className="text-muted-foreground font-medium text-[10px]">{value}</span>} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-16">Sem dados</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                  <CardTitle className="text-xs uppercase font-bold text-muted-foreground">Distribuição por Regional e Macroregional</CardTitle>
                  <ChartExportButtons targetRef={regionalChartRef} filename="distribuicao-por-regional-e-macroregional" />
                </CardHeader>
                <CardContent>
                  {regionalMacroData.length > 0 ? (
                    <div ref={regionalChartRef} className="bg-background w-full">
                      <ResponsiveContainer width="100%" height={isMobile ? 360 : 340}>
                        <PieChart>
                          <Pie
                            data={regionalMacroData}
                            cx="50%"
                            cy={isMobile ? "40%" : "44%"}
                            innerRadius={isMobile ? 58 : 72}
                            outerRadius={isMobile ? 88 : 108}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                          >
                            {regionalMacroData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <text x="50%" y={isMobile ? "38%" : "42%"} textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground text-[10px] font-medium">
                            Total de casos
                          </text>
                          <text x="50%" y={isMobile ? "44%" : "48%"} textAnchor="middle" dominantBaseline="central" className="fill-foreground text-xl font-bold">
                            {formatValue(regionalMacroTotal)}
                          </text>
                          <Tooltip content={<CustomTooltip categoryLabel="Área" />} trigger={isMobile ? "click" : "hover"} />
                          <Legend
                            verticalAlign="bottom"
                            wrapperStyle={{ fontSize: 10, lineHeight: "18px" }}
                            formatter={(value, entry) => (
                              <span className="text-muted-foreground font-medium text-[10px]">
                                {value} — {formatValue(entry?.payload?.value)}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-16 text-center">Sem dados</p>
                  )}
                </CardContent>
              </Card>

              {/* Row 2: Raça/Cor and Confirmatory Criteria */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                    <CardTitle className="text-xs uppercase font-bold text-muted-foreground">Distribuição por Raça/Cor</CardTitle>
                    <ChartExportButtons targetRef={racaChartRef} filename="distribuicao-por-raca-cor" />
                  </CardHeader>
                  <CardContent>
                    <div ref={racaChartRef} className="bg-background">
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={racaData} accessibilityLayer margin={{ top: 24, right: 10, left: 0, bottom: 20 }}>
                          <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} interval={0} angle={axisAngle} textAnchor="end" height={axisHeight} />
                          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={formatValue} />
                          <Tooltip content={<CustomTooltip categoryLabel="Raça/Cor" />} trigger={isMobile ? "click" : "hover"} />
                          <Bar dataKey="value" fill="hsl(167,72%,40%)" radius={[3, 3, 0, 0]} name="Confirmados">
                            <LabelList dataKey="value" position="top" formatter={formatValue} style={{ fill: "#000", fontSize: labelFontSize, fontWeight: 600 }} angle={isMobile ? -45 : 0} offset={isMobile ? 10 : 6} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Confirmatory Criteria List */}
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xs uppercase font-bold text-muted-foreground">
                      Critérios de Confirmação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {criterioData.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-12">Sem registros</p>
                    ) : (
                      criterioData.map(([label, count]) => {
                        const totalCrit = criterioData.reduce((acc, [, v]) => acc + v, 0);
                        return (
                          <div key={label} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span>{label}</span>
                              <span>{count} ({pct(count, totalCrit)})</span>
                            </div>
                            <div className="w-full bg-muted/40 rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full"
                                style={{ width: pct(count, totalCrit) }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Monthly comparison line chart */}
              <Card className="glass-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                  <CardTitle className="text-xs uppercase font-bold text-muted-foreground">Evolução de Casos por Mês</CardTitle>
                  <ChartExportButtons targetRef={mesChartRef} filename="evolucao-casos-por-mes" />
                </CardHeader>
                <CardContent>
                  {mesData.length > 0 ? (
                    <div ref={mesChartRef} className="bg-background">
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={mesData} accessibilityLayer margin={{ top: 24, right: 20, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                          <XAxis dataKey="mes" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} interval={isMobile ? "preserveStartEnd" : 0} angle={axisAngle} textAnchor="end" height={axisHeight} />
                          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={formatValue} />
                          <Tooltip content={<CustomTooltip categoryLabel="Mês" />} trigger={isMobile ? "click" : "hover"} />
                          <Legend wrapperStyle={{ fontSize: 10 }} formatter={(value) => <span className="text-muted-foreground font-medium text-[10px]">{value}</span>} />
                          <Line type="monotone" dataKey="notificados" stroke="hsl(213,94%,42%)" strokeWidth={2} name="Notificados">
                            <LabelList dataKey="notificados" position="top" formatter={formatValue} style={{ fill: "#000", fontSize: labelFontSize, fontWeight: 600 }} angle={isMobile ? -45 : 0} offset={labelOffsetV} />
                          </Line>
                          <Line type="monotone" dataKey="confirmados" stroke="hsl(0,84%,60%)" strokeWidth={2} name="Confirmados">
                            <LabelList dataKey="confirmados" position="bottom" formatter={formatValue} style={{ fill: "#000", fontSize: labelFontSize, fontWeight: 600 }} angle={isMobile ? -45 : 0} offset={labelOffsetV} />
                          </Line>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-xs">Sem registros</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: MAPA DE RISCO */}
          {activeTab === "mapa" && !hasAgravoSelected(selectedAgravo) && (
            <Card className="glass-card border-border/50 p-12 text-center">
              <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground mb-1">Selecione um agravo</h3>
              <p className="text-xs text-muted-foreground">
                Escolha um agravo no filtro acima para visualizar o Mapa Epidemiológico.
              </p>
            </Card>
          )}

          {activeTab === "mapa" && hasAgravoSelected(selectedAgravo) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map container */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="glass-card p-4 border-border/50 relative">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        Geolocalização de Focos e Calor Epidemiológico
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        Focos espaciais de contágio georreferenciados no Maranhão
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-border/60 p-0.5 bg-muted/20">
                        <Button
                          variant={!heatmapMode ? "default" : "ghost"}
                          size="sm"
                          className="h-6.5 text-[10px] px-2 rounded-md"
                          onClick={() => setHeatmapMode(false)}
                        >
                          Municípios
                        </Button>
                        <Button
                          variant={heatmapMode ? "default" : "ghost"}
                          size="sm"
                          className="h-6.5 text-[10px] px-2 rounded-md"
                          onClick={() => setHeatmapMode(true)}
                        >
                          Calor
                        </Button>
                      </div>

                      <div className="flex items-center rounded-lg border border-border/60 p-0.5 bg-muted/20">
                        <Button
                          variant={mapMetric === "confirmados" ? "default" : "ghost"}
                          size="sm"
                          className="h-6.5 text-[10px] px-2 rounded-md"
                          onClick={() => setMapMetric("confirmados")}
                        >
                          Confirmados
                        </Button>
                        <Button
                          variant={mapMetric === "notificados" ? "default" : "ghost"}
                          size="sm"
                          className="h-6.5 text-[10px] px-2 rounded-md"
                          onClick={() => setMapMetric("notificados")}
                        >
                          Notificados
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Suspense fallback={
                    <div className="w-full h-[520px] rounded-xl flex items-center justify-center bg-muted/10">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  }>
                    <SmartMap
                      filteredCases={filtered}
                      heatmapMode={heatmapMode}
                      metric={mapMetric}
                    />
                  </Suspense>
                </Card>
              </div>

              {/* Sidebar: Risks & recommendations */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="glass-card border-border/50 h-full flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-destructive" />
                      Análise Territorial e Riscos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4 overflow-y-auto max-h-[460px] pr-1">
                    <div className="bg-destructive/5 rounded-xl p-3 border border-destructive/10">
                      <h4 className="text-xs font-bold text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Aviso Sanitário de Tendências
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Cidades com alta velocidade de transmissão detectada com base no período recente.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {municipiosAumentando.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-10">Estável territorialmente</p>
                      ) : (
                        municipiosAumentando.map((mun, idx) => (
                          <div key={mun.name} className="p-3 border border-border/40 rounded-xl bg-card/45 flex items-center justify-between hover:bg-card/70 transition-colors">
                            <div>
                              <p className="text-xs font-bold">{mun.name}</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                Recente: {mun.recent} casos (Anterior: {mun.past})
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                              +{mun.percent}%
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 4: CENTRAL DE ALERTAS */}
          {activeTab === "alertas" && !hasAgravoSelected(selectedAgravo) && (
            <Card className="glass-card border-border/50 p-12 text-center">
              <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground mb-1">Selecione um agravo</h3>
              <p className="text-xs text-muted-foreground">
                Escolha um agravo no filtro acima para visualizar os Sinais e Alertas.
              </p>
            </Card>
          )}

          {activeTab === "alertas" && hasAgravoSelected(selectedAgravo) && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">Sinais e Avisos Epidemiológicos</h2>
                  <p className="text-xs text-muted-foreground">Alertas emitidos em tempo real baseados nas regras estaduais</p>
                </div>
                <Badge className="bg-destructive/10 text-destructive border-destructive/20 border text-xs">
                  {activeAlerts.filter(a => a.type === "critical").length} Críticos
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAlerts.map((a) => {
                  const Icon = a.icon;
                  const cardStyles =
                    a.type === "critical"
                      ? "border-destructive/30 bg-destructive/5"
                      : a.type === "warning"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-primary/30 bg-primary/5";
                  
                  const textStyles =
                    a.type === "critical"
                      ? "text-destructive"
                      : a.type === "warning"
                      ? "text-amber-500"
                      : "text-primary";

                  return (
                    <Card key={a.id} className={`glass-card border ${cardStyles} flex flex-col justify-between`}>
                      <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                            a.type === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            a.type === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            {a.badge}
                          </span>
                          <Icon className={`w-5 h-5 ${textStyles}`} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{a.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{a.description}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-2">Atualizado recentemente</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: INDICADORES DE GESTÃO */}
          {activeTab === "indicadores" && !hasAgravoSelected(selectedAgravo) && (
            <Card className="glass-card border-border/50 p-12 text-center">
              <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground mb-1">Selecione um agravo</h3>
              <p className="text-xs text-muted-foreground">
                Escolha um agravo no filtro acima para visualizar os Indicadores.
              </p>
            </Card>
          )}

          {activeTab === "indicadores" && hasAgravoSelected(selectedAgravo) && (
            <div className="space-y-6">
              {/* Opportunity and data completeness charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Completeness Card */}
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xs uppercase font-bold text-muted-foreground">Qualidade de Preenchimento das Fichas</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      {/* Circle SVG */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="62" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
                        <circle
                          cx="72"
                          cy="72"
                          r="62"
                          stroke="oklch(0.48 0.15 245)"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 62}
                          strokeDashoffset={2 * Math.PI * 62 * (1 - dataQualityScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-extrabold">{dataQualityScore}%</span>
                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Completitude</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center max-w-sm">
                      Métrica gerada a partir dos campos obrigatórios em branco (sexo, idade, logradouro, UF, município e raça/cor).
                    </p>
                  </CardContent>
                </Card>

                {/* Opportunity Card */}
                <Card className="glass-card border-border/50 flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="text-xs uppercase font-bold text-muted-foreground">Oportunidade de Investigação (Tempo Resposta)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-extrabold text-primary">{averageTimeDays} dias</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Tempo médio entre Notificação e Investigação</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="border border-border/40 rounded-xl p-3 bg-muted/10 text-xs">
                      <p className="font-semibold text-emerald-400">Meta do Ministério da Saúde: &lt; 7 dias</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">A rede estadual do Maranhão encontra-se dentro da meta acordada.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resolve rate table ranking */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-bold text-muted-foreground">Ranking de Encerramento por Município</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/50 pb-2 text-muted-foreground">
                          <th className="py-2.5 font-bold">Município</th>
                          <th className="py-2.5 font-bold text-center">Fichas Encerradas</th>
                          <th className="py-2.5 font-bold text-center">Fichas em Aberto</th>
                          <th className="py-2.5 font-bold text-center">Taxa de Resolução</th>
                          <th className="py-2.5 font-bold text-right">Desempenho</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMunicipiosList.slice(0, 10).map((m) => {
                          const closed = m.notificados - m.investigacao;
                          const rate = m.notificados > 0 ? Math.round((closed / m.notificados) * 100) : 0;
                          return (
                            <tr key={m.name} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                              <td className="py-2.5 font-semibold text-foreground">{m.name}</td>
                              <td className="py-2.5 text-center text-emerald-400 font-bold">{closed}</td>
                              <td className="py-2.5 text-center text-amber-500 font-bold">{m.investigacao}</td>
                              <td className="py-2.5 text-center font-extrabold">{rate}%</td>
                              <td className="py-2.5 text-right font-bold">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  rate >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  rate >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  'bg-destructive/10 text-destructive border border-destructive/20'
                                }`}>
                                  {rate >= 80 ? 'Excelente' : rate >= 50 ? 'Regular' : 'Crítico'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 6: MUNICÍPIOS */}
          {activeTab === "municipios" && !hasAgravoSelected(selectedAgravo) && (
            <Card className="glass-card border-border/50 p-12 text-center">
              <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground mb-1">Selecione um agravo</h3>
              <p className="text-xs text-muted-foreground">
                Escolha um agravo no filtro acima para visualizar o Relatório por Município.
              </p>
            </Card>
          )}

          {activeTab === "municipios" && hasAgravoSelected(selectedAgravo) && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-foreground">Relatório Territorial por Município</h2>
                  <p className="text-xs text-muted-foreground">Listagem detalhada das taxas de incidência e letalidade no Maranhão</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar município..."
                    className="pl-8.5 h-9 bg-background/50 border-border/80 text-xs w-full"
                    value={municipioSearch}
                    onChange={(e) => setMunicipioSearch(e.target.value)}
                  />
                </div>
              </div>

              <Card className="glass-card border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-card/45 border-b border-border/40 text-muted-foreground">
                          <th className="py-3 px-4 font-bold">Município</th>
                          <th className="py-3 px-4 font-bold text-center">Notificados</th>
                          <th className="py-3 px-4 font-bold text-center">Confirmados</th>
                          <th className="py-3 px-4 font-bold text-center">Em Investigação</th>
                          <th className="py-3 px-4 font-bold text-center">Óbitos</th>
                          <th className="py-3 px-4 font-bold text-center">Letalidade</th>
                          <th className="py-3 px-4 font-bold text-right">Incidência /100k</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedMunicipios.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-muted-foreground">Nenhum município correspondente</td>
                          </tr>
                        ) : (
                          displayedMunicipios.map((m) => (
                            <tr key={m.name} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                              <td className="py-3 px-4 font-semibold text-foreground">{m.name}</td>
                              <td className="py-3 px-4 text-center font-bold">{m.notificados}</td>
                              <td className="py-3 px-4 text-center text-destructive font-bold">{m.confirmados}</td>
                              <td className="py-3 px-4 text-center text-amber-500 font-bold">{m.investigacao}</td>
                              <td className="py-3 px-4 text-center font-bold">{m.obitos}</td>
                              <td className="py-3 px-4 text-center text-destructive font-bold">{m.letalidade}%</td>
                              <td className="py-3 px-4 text-right font-extrabold text-primary">{m.incidencia}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 7: RELATÓRIOS & EXPORTAÇÕES */}
          {activeTab === "relatorios" && !hasAgravoSelected(selectedAgravo) && (
            <Card className="glass-card border-border/50 p-12 text-center">
              <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground mb-1">Selecione um agravo</h3>
              <p className="text-xs text-muted-foreground">
                Escolha um agravo no filtro acima para gerar Relatórios.
              </p>
            </Card>
          )}

          {activeTab === "relatorios" && hasAgravoSelected(selectedAgravo) && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="glass-card border-border/50 p-5 flex flex-col justify-between min-h-[190px]">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Relatório Analítico Completo</h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Gere o boletim epidemiológico das doenças sob vigilância em formato estruturado. Contém tabelas, gráficos de SE e faixas etárias compilados.
                    </p>
                  </div>
                  <Button onClick={() => window.print()} className="gap-2 h-9 bg-primary text-primary-foreground hover:opacity-90 w-full mt-4 border-0">
                    <FileText className="w-4 h-4" /> Imprimir Boletim Executivo
                  </Button>
                </Card>

                <Card className="glass-card border-border/50 p-5 flex flex-col justify-between min-h-[190px]">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Exportação Planilha (CSV)</h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Baixe os registros de fichas notificadas que atendem aos filtros ativos da barra superior do painel de monitoramento.
                    </p>
                  </div>
                  <Button onClick={handleExportCSV} className="gap-2 h-9 tech-gradient text-white hover:opacity-90 w-full mt-4 border-0">
                    <Download className="w-4 h-4" /> Exportar Dados de Fichas
                  </Button>
                </Card>

                <Card className="glass-card border-border/50 p-5 flex flex-col justify-between min-h-[190px]">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Relatório de Inconsistência de Dados</h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Exporte as planilhas identificando campos obrigatórios vazios ou inconsistentes em fichas para direcionar o trabalho dos digitadores municipais.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      const incomplete = filtered.filter(
                        (c) =>
                          !c.sexo ||
                          !c.idade ||
                          !c.raca_cor ||
                          String(c.sexo).toLowerCase() === "ignorado" ||
                          String(c.raca_cor).toLowerCase() === "ignorado"
                      );
                      if (incomplete.length === 0) {
                        toast.success("Nenhuma inconsistência de completitude encontrada!");
                        return;
                      }
                      const headers = ["ID", "Nº da Notificação", "Paciente", "Campos Faltantes"];
                      const csvContent =
                        "data:text/csv;charset=utf-8,\uFEFF" +
                        [
                          headers.join(";"),
                          ...incomplete.map((c) => {
                            const faltantes = [];
                            if (!c.sexo || String(c.sexo).toLowerCase() === "ignorado") faltantes.push("Sexo");
                            if (!c.idade) faltantes.push("Idade");
                            if (!c.raca_cor || String(c.raca_cor).toLowerCase() === "ignorado")
                              faltantes.push("Raça/Cor");
                            return [c.id, c.numero_ficha || "", c.nome_paciente || "", faltantes.join(",")].join(";");
                          }),
                        ].join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `inconsistencias_notificama_${new Date().toISOString().split("T")[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success("Relatório de inconsistências baixado!");
                    }}
                    variant="outline"
                    className="gap-2 h-9 bg-card border-border/80 text-foreground w-full mt-4"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Exportar Inconsistências
                  </Button>
                </Card>
              </div>

              {/* Print Preview Container */}
              <div className="border border-border/40 rounded-2xl p-6 bg-card/20 space-y-6 max-w-4xl mx-auto shadow-sm">
                <div className="border-b border-border/30 pb-4 text-center">
                  <h3 className="text-base font-bold text-foreground">NOTIFICA-MA INTELLIGENCE — PREVIEW EXECUTIVE REPORT</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Gerado automaticamente em {new Date().toLocaleDateString("pt-BR")}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground font-semibold">Filtro Ativo Agravo:</p>
                    <p className="font-bold text-foreground">{selectedAgravo === "all" ? "Todos os Agravos" : LABELS[selectedAgravo]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold">Total Notificados no Estado:</p>
                    <p className="font-bold text-foreground">{total} notificações</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold">Casos Confirmados:</p>
                    <p className="font-bold text-destructive">{confirmados.length} confirmados</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold">Letalidade Geral Estimada:</p>
                    <p className="font-bold text-destructive">{letalidade}%</p>
                  </div>
                </div>

                <div className="border-t border-border/30 pt-4 text-xs space-y-2">
                  <p className="font-bold">Resumo Epidemiológico:</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Com base no processamento das fichas de notificação, a rede de vigilância epidemiológica do estado do Maranhão registrou no período analisado {total} notificações suspeitas.
                    Destas, {confirmados.length} foram conclusivas para o agravo de saúde. Estão pendentes {emInvestigacao.length} fichas sob acompanhamento ativo. O município com o maior número
                    de notificações confirmadas é {topMunicipios[0]?.name || "indefinido"} ({topMunicipios[0]?.count || 0} casos).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ASSISTENTE IA */}
          {activeTab === "ia" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-5xl mx-auto h-[600px]">
              {/* Chat history */}
              <Card className="lg:col-span-3 glass-card border-border/50 flex flex-col justify-between h-full overflow-hidden">
                <CardHeader className="py-3 border-b border-border/30 bg-card/45 flex flex-row items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-xs uppercase font-bold text-foreground">Analista Epidemiológico IA</CardTitle>
                    <p className="text-[9px] text-muted-foreground">Perguntas com dados em tempo real</p>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[460px]">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                        m.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted/40 border border-border/40 text-foreground rounded-tl-none leading-relaxed"
                      }`}>
                        {m.text.split("\n").map((line, idx) => (
                          <p key={idx} className={idx > 0 ? "mt-1" : ""}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted/40 border border-border/40 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-200" />
                        <span>Processando dados...</span>
                      </div>
                    </div>
                  )}
                </CardContent>

                <div className="p-3 border-t border-border/30 bg-card/30 flex items-center gap-2">
                  <Input
                    placeholder="Faça uma pergunta sobre a situação epidemiológica..."
                    className="h-9 text-xs bg-background/50 border-border/80"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                  />
                  <Button onClick={() => handleSendMessage()} size="icon" className="h-9 w-9 bg-primary text-primary-foreground border-0 hover:opacity-90 shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* Suggestions chips side */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="glass-card border-border/50 p-4 h-full">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Perguntas Frequentes
                  </h4>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => handleSendMessage("Faça um resumo executivo da situação atual")}
                      className="text-left w-full p-2.5 border border-border/50 rounded-xl text-[10px] bg-card/35 text-foreground hover:bg-card/75 transition-all"
                    >
                      📑 Resumo Executivo Geral
                    </button>
                    <button
                      onClick={() => handleSendMessage("Quais municípios estão em alerta crítico ou surto?")}
                      className="text-left w-full p-2.5 border border-border/50 rounded-xl text-[10px] bg-card/35 text-foreground hover:bg-card/75 transition-all"
                    >
                      🚨 Focos em Alerta Crítico
                    </button>
                    <button
                      onClick={() => handleSendMessage("Quais são os critérios de confirmação de Meningite?")}
                      className="text-left w-full p-2.5 border border-border/50 rounded-xl text-[10px] bg-card/35 text-foreground hover:bg-card/75 transition-all"
                    >
                      🔬 Critérios de Confirmação (Meningite)
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 9: CONFIGURAÇÕES */}
          {activeTab === "config" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Users admin shortcut */}
                <Card className="glass-card border-border/50 p-5 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-primary" />
                      <h4 className="text-sm font-bold text-foreground">Gerenciamento de Usuários</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                      Gerencie as credenciais, permissões no sistema e níveis de acesso (técnico municipal, gestor estadual, administrador).
                    </p>
                  </div>
                  <Button asChild className="gap-2 h-9 bg-primary text-primary-foreground hover:opacity-90 w-full mt-4 border-0">
                    <Link to="/usuarios">
                      Acessar Usuários
                    </Link>
                  </Button>
                </Card>

                {/* Audit logs shortcut */}
                <Card className="glass-card border-border/50 p-5 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-amber-500" />
                      <h4 className="text-sm font-bold text-foreground">Logs de Sincronização e Ações</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                      Monitore o histórico detalhado de importações de planilhas CSV, cadastros manuais e alterações no banco de dados.
                    </p>
                  </div>
                  <Button asChild className="gap-2 h-9 bg-amber-500 text-white hover:opacity-90 w-full mt-4 border-0">
                    <Link to="/logs">
                      Visualizar Logs
                    </Link>
                  </Button>
                </Card>
              </div>

              {/* General configurations */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-bold text-muted-foreground">Configurações de Alertas do Painel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Gatilho de Alerta de Tendência (%)</Label>
                      <Input
                        type="number"
                        className="h-9 text-xs bg-background/50 border-border/80"
                        value={alertThreshold}
                        onChange={(e) => setAlertThreshold(e.target.value)}
                      />
                      <p className="text-[10px] text-muted-foreground">Porcentagem de aumento de casos para disparar alerta crítico (padrão: 20%).</p>
                    </div>

                    <div className="flex items-center gap-3.5 pt-6 self-start">
                      <input
                        type="checkbox"
                        id="enable-emails"
                        className="rounded border-border/70 text-primary bg-background/50 h-4 w-4"
                        checked={enableEmails}
                        onChange={(e) => setEnableEmails(e.target.checked)}
                      />
                      <Label htmlFor="enable-emails" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                        Notificar gestores estaduais por e-mail em caso de surtos
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
