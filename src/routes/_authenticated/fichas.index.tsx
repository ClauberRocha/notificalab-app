import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bug,
  Syringe,
  Trash2,
  ArrowLeft,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getSemanaEpidemiologica } from "@/data/semana-epd";
import { getSeNumber } from "@/lib/seUtils";
import { SoftDeleteCaseDialog } from "@/components/soft-delete-case-dialog";
import { useGlobalAgravo } from "@/lib/global-agravo";

type SortDir = "asc" | "desc";
type FiltersState = {
  search: string;
  status: string;
  sort: SortDir;
  pageSize: number;
  page: number;
};

const FICHAS_FILTERS_KEY = "lovable:fichas-filters";
const DEFAULT_FILTERS: FiltersState = {
  search: "",
  status: "all",
  sort: "desc",
  pageSize: 10,
  page: 0,
};

function normalizeFilters(raw: Partial<FiltersState> | null | undefined): FiltersState {
  const sort: SortDir = raw?.sort === "asc" ? "asc" : "desc";
  const size = Number(raw?.pageSize);
  const pageNum = Number(raw?.page);
  return {
    search: typeof raw?.search === "string" ? raw.search : "",
    status: typeof raw?.status === "string" && raw.status ? raw.status : "all",
    sort,
    pageSize: [5, 10, 20, 50].includes(size) ? size : 10,
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 0,
  };
}

function readFiltersFromUrl(): { hasAny: boolean; filters: FiltersState; agravo: string } {
  if (typeof window === "undefined") {
    return { hasAny: false, filters: DEFAULT_FILTERS, agravo: "" };
  }
  const p = new URLSearchParams(window.location.search);
  const hasAny = ["agravo", "q", "status", "sort", "size", "page"].some((k) => p.has(k));
  return {
    hasAny,
    agravo: p.get("agravo") ?? "",
    filters: normalizeFilters({
      search: p.get("q") ?? "",
      status: p.get("status") ?? "all",
      sort: (p.get("sort") as SortDir) ?? "desc",
      pageSize: Number(p.get("size")),
      page: Number(p.get("page")),
    }),
  };
}

function readFiltersFromStorage(): { filters: FiltersState; agravo: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(FICHAS_FILTERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FiltersState> & { agravo?: string };
    return {
      filters: normalizeFilters(parsed),
      agravo: typeof parsed.agravo === "string" ? parsed.agravo : "",
    };
  } catch {
    return null;
  }
}

function writeFiltersToStorage(state: FiltersState & { agravo: string }): void {
  if (typeof window === "undefined") return;
  try {
    const isDefault =
      !state.agravo &&
      state.search === "" &&
      state.status === "all" &&
      state.sort === "desc" &&
      state.pageSize === DEFAULT_FILTERS.pageSize &&
      state.page === 0;
    if (isDefault) {
      window.sessionStorage.removeItem(FICHAS_FILTERS_KEY);
    } else {
      window.sessionStorage.setItem(FICHAS_FILTERS_KEY, JSON.stringify(state));
    }
  } catch {
    /* ignore quota / privacy errors */
  }
}

/** Reads URL first, then sessionStorage, then defaults. */
function readInitialFilters(): FiltersState {
  const fromUrl = readFiltersFromUrl();
  if (fromUrl.hasAny) return fromUrl.filters;
  const fromStorage = readFiltersFromStorage();
  return fromStorage?.filters ?? DEFAULT_FILTERS;
}

function readInitialAgravo(): string {
  const fromUrl = readFiltersFromUrl();
  if (fromUrl.hasAny && fromUrl.agravo) return fromUrl.agravo;
  const fromStorage = readFiltersFromStorage();
  return fromStorage?.agravo ?? "";
}

function getSE(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const isoDate = dateStr.slice(0, 10);
  const mapped = getSemanaEpidemiologica(isoDate);
  if (mapped !== null) return String(mapped);
  const dateObj = new Date(dateStr);
  const computed = getSeNumber(dateObj);
  return computed > 0 ? String(computed) : "";
}

export const Route = createFileRoute("/_authenticated/fichas/")({
  head: () => ({ meta: [{ title: "Fichas de Investigação" }] }),
  component: FichasListPage,
});

const PAGE_SIZES = [5, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

type AgravoDef = {
  table: string;
  slug: string;
  tipo: string;
  label: string;
  dateField: string;
  listPath:
    | "/fichas/coqueluche"
    | "/fichas/dengue"
    | "/fichas/chikungunya"
    | "/fichas/difteria"
    | "/fichas/epizootia"
    | "/fichas/sarampo"
    | "/fichas/rubeola"
    | "/fichas/febre-amarela"
    | "/fichas/hanseniase"
    
    | "/fichas/outras-meningites"
    | "/fichas/raiva-humana"
    | "/fichas/srag"
    | "/fichas/surto-dta"
    | "/fichas/tetano-acidental"
    | "/fichas/tetano-neonatal"
    | "/fichas/tuberculose";
};

const AGRAVOS: AgravoDef[] = [
  { table: "coqueluche_cases", slug: "coqueluche", tipo: "coqueluche", label: "Coqueluche", dateField: "data_notificacao", listPath: "/fichas/coqueluche" },
  { table: "dengue_chikungunya_cases", slug: "dengue", tipo: "dengue", label: "Dengue/Chikungunya", dateField: "data_notificacao", listPath: "/fichas/dengue" },
  { table: "difteria_cases", slug: "difteria", tipo: "difteria", label: "Difteria", dateField: "data_notificacao", listPath: "/fichas/difteria" },
  { table: "epizootia_cases", slug: "epizootia", tipo: "epizootia", label: "Epizootia", dateField: "data_notificacao", listPath: "/fichas/epizootia" },
  { table: "exantematica_cases", slug: "sarampo", tipo: "sarampo", label: "Sarampo/Rubéola", dateField: "data_notificacao", listPath: "/fichas/sarampo" },
  { table: "febre_amarela_cases", slug: "febre-amarela", tipo: "febre_amarela", label: "Febre Amarela", dateField: "data_notificacao", listPath: "/fichas/febre-amarela" },
  { table: "hanseniase_cases", slug: "hanseniase", tipo: "hanseniase", label: "Hanseníase", dateField: "data_notificacao", listPath: "/fichas/hanseniase" },
  { table: "meningite_cases", slug: "outras-meningites", tipo: "meningite", label: "Meningite", dateField: "data_notificacao", listPath: "/fichas/outras-meningites" },
  { table: "raiva_humana_cases", slug: "raiva-humana", tipo: "raiva_humana", label: "Raiva Humana", dateField: "data_notificacao", listPath: "/fichas/raiva-humana" },
  { table: "srag_cases", slug: "srag", tipo: "srag_influenza", label: "SRAG/Influenza", dateField: "data_preenchimento", listPath: "/fichas/srag" },
  { table: "surto_dta_cases", slug: "surto-dta", tipo: "surto_dta", label: "Surto DTA", dateField: "data_notificacao", listPath: "/fichas/surto-dta" },
  { table: "tetano_acidental_cases", slug: "tetano-acidental", tipo: "tetano_acidental", label: "Tétano Acidental", dateField: "data_notificacao", listPath: "/fichas/tetano-acidental" },
  { table: "tetano_neonatal_cases", slug: "tetano-neonatal", tipo: "tetano_neonatal", label: "Tétano Neonatal", dateField: "data_notificacao", listPath: "/fichas/tetano-neonatal" },
  { table: "tuberculose_cases", slug: "tuberculose", tipo: "tuberculose", label: "Tuberculose", dateField: "data_notificacao", listPath: "/fichas/tuberculose" },
];

const ICON_BY_TIPO: Record<
  string,
  { icon: typeof Shield; color: string; bg: string }
> = {
  meningite: { icon: Shield, color: "text-primary", bg: "bg-primary/10" },
  coqueluche: { icon: Bug, color: "text-fuchsia-600", bg: "bg-fuchsia-500/10" },
  difteria: { icon: Syringe, color: "text-amber-600", bg: "bg-amber-500/10" },
};

type CaseRow = {
  id: string;
  numero_ficha: string | null;
  nome_paciente: string | null;
  municipio_notificacao: string | null;
  data_notificacao: string | null;
  semana_epidemiologica: string | null;
  status: string | null;
  created_at: string | null;
  _tipo: string;
  _slug: string;
  _label: string;
  _table: string;
  _listPath: AgravoDef["listPath"];
};

async function fetchByAgravo(tipo: string): Promise<CaseRow[]> {
  if (!tipo) return [];
  const targets = AGRAVOS.filter((a) => a.tipo === tipo);
  const results = await Promise.all(
    targets.map(async (a) => {
      const { data, error } = await supabase
        .from(a.table as never)
        .select(
          `id, numero_ficha, nome_paciente, municipio_notificacao, status, created_at, agravo, ${a.dateField}`,
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) return [];
      return (data ?? []).map((r: Record<string, unknown>) => {
        const dateVal = (r[a.dateField] as string) ?? null;
        return {
          id: r.id as string,
          numero_ficha: (r.numero_ficha as string) ?? null,
          nome_paciente: (r.nome_paciente as string) ?? null,
          municipio_notificacao: (r.municipio_notificacao as string) ?? null,
          status: (r.status as string) ?? null,
          created_at: (r.created_at as string) ?? null,
          data_notificacao: dateVal,
          semana_epidemiologica: dateVal ? getSE(dateVal) : null,
          _tipo: a.tipo,
          _slug: (typeof r.agravo === "string" ? r.agravo : a.slug).replace(/_/g, "-"),
          _label: a.label,
          _table: a.table,
          _listPath: a.listPath,
        };
      });
    }),
  );
  return results.flat();
}



export function FichasListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { can } = useAuth();
  const canDelete = can("fichas.delete");
  const canEdit = can("fichas.edit");
  const canCreate = can("fichas.create");

  const initial = useRef(readInitialFilters()).current;
  const [search, setSearch] = useState(initial.search);
  const [agravoFilter, setAgravoFilter] = useGlobalAgravo();
  const [statusFilter, setStatusFilter] = useState<string>(initial.status);
  const [dateSort, setDateSort] = useState<"asc" | "desc">(initial.sort);
  const [page, setPage] = useState(initial.page);
  const [pageSize, setPageSize] = useState(initial.pageSize);

  // Seed the shared agravo filter on first mount from the URL, or — when
  // navigating back to /fichas after switching tabs — from sessionStorage.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const seeded = readInitialAgravo();
    if (seeded && seeded !== agravoFilter) setAgravoFilter(seeded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist current filters to the URL (for refresh/deep-link) AND to
  // sessionStorage (so switching to another route and coming back restores
  // exactly the same view — the URL is lost when the user navigates away).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (agravoFilter) params.set("agravo", agravoFilter);
    if (search) params.set("q", search);
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    if (dateSort !== "desc") params.set("sort", dateSort);
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set("size", String(pageSize));
    if (page > 0) params.set("page", String(page));
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
    writeFiltersToStorage({
      agravo: agravoFilter,
      search,
      status: statusFilter,
      sort: dateSort,
      pageSize,
      page,
    });
  }, [agravoFilter, search, statusFilter, dateSort, pageSize, page]);

  // Restore filter state from the URL whenever the user hits Back/Forward.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function hydrateFromUrl() {
      const { filters, agravo } = readFiltersFromUrl();
      setSearch(filters.search);
      setStatusFilter(filters.status);
      setDateSort(filters.sort);
      setPageSize(filters.pageSize);
      setPage(filters.page);
      setAgravoFilter(agravo);
    }
    window.addEventListener("popstate", hydrateFromUrl);
    return () => window.removeEventListener("popstate", hydrateFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearAllFilters() {
    setSearch("");
    setAgravoFilter("");
    setStatusFilter("all");
    setDateSort("desc");
    setPageSize(DEFAULT_PAGE_SIZE);
    setPage(0);
    if (typeof window !== "undefined") {
      // pushState so the user can go Back to the previous filter state.
      window.history.pushState(null, "", window.location.pathname);
    }
    toast.success("Filtros limpos", {
      description: "A tela voltou ao estado inicial.",
    });
  }

  const activeFilterChips: { key: string; label: string }[] = [];
  if (agravoFilter) {
    const found = AGRAVOS.find((a) => a.tipo === agravoFilter);
    activeFilterChips.push({
      key: "agravo",
      label: `Agravo: ${found?.label ?? agravoFilter}`,
    });
  }
  if (search) activeFilterChips.push({ key: "q", label: `Busca: "${search}"` });
  if (statusFilter && statusFilter !== "all") {
    activeFilterChips.push({
      key: "status",
      label: `Status: ${statusFilter === "em_investigacao" ? "Em Aberto" : "Encerrado"}`,
    });
  }
  if (dateSort !== "desc") {
    activeFilterChips.push({ key: "sort", label: "Ordenação: mais antigas primeiro" });
  }
  if (pageSize !== DEFAULT_PAGE_SIZE) {
    activeFilterChips.push({ key: "size", label: `${pageSize} por página` });
  }

  const { data: allCases = [], isLoading } = useQuery({
    queryKey: ["fichas", agravoFilter],
    queryFn: () => fetchByAgravo(agravoFilter),
    enabled: !!agravoFilter,
  });

  const sorted = [...allCases].sort((a, b) => {
    const da = new Date(a.data_notificacao || a.created_at || 0).getTime();
    const db = new Date(b.data_notificacao || b.created_at || 0).getTime();
    return dateSort === "desc" ? db - da : da - db;
  });

  const filtered = sorted.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (c.nome_paciente?.toLowerCase().includes(q) ?? false) ||
      (c.municipio_notificacao?.toLowerCase().includes(q) ?? false);
    const matchAgravo = !agravoFilter || c._tipo === agravoFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchAgravo && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Fichas de Investigação
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} registro(s)
          </p>
        </div>
        {canCreate && (
          <Link to="/nova-ficha">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nova Ficha
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente ou município..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-10 h-10"
          />
        </div>
        <Select
          value={agravoFilter}
          onValueChange={(v) => {
            setAgravoFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-56 h-10">
            <SelectValue placeholder="Selecione um agravo..." />
          </SelectTrigger>
          <SelectContent>
            {AGRAVOS.map((a) => (
              <SelectItem key={a.tipo} value={a.tipo}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-44 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="em_investigacao">Em Aberto</SelectItem>
            <SelectItem value="encerrado">Encerrado</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => {
            setPageSize(Number(v));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-32 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s} / página
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={dateSort}
          onValueChange={(v) => setDateSort(v as "asc" | "desc")}
        >
          <SelectTrigger className="w-48 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Mais recentes primeiro</SelectItem>
            <SelectItem value="asc">Mais antigas primeiro</SelectItem>
          </SelectContent>
        </Select>
        {agravoFilter && (
          <Button
            variant="outline"
            className="h-10 gap-2"
            onClick={clearAllFilters}
          >
            <X className="w-4 h-4" /> Limpar filtros
          </Button>
        )}
      </div>

      {activeFilterChips.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label="Filtros ativos"
          data-testid="active-filters"
        >
          <span className="text-xs text-muted-foreground">Filtros ativos:</span>
          {activeFilterChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-xs font-normal"
            >
              {chip.label}
            </Badge>
          ))}
        </div>
      )}

      {!agravoFilter ? (
        <Card className="p-12 text-center">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground mb-1">Selecione um agravo</h3>
          <p className="text-xs text-muted-foreground">
            Escolha um agravo no filtro acima para listar as fichas correspondentes.
          </p>
        </Card>
      ) : (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Paciente
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Agravo
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                  Município
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Data Notif.
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Sem.Epd.
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Nº da Notificação
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array(8)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-24" />
                          </td>
                        ))}
                    </tr>
                  ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Nenhuma ficha encontrada.
                  </td>
                </tr>
              ) : (
                paginated.map((c) => {
                  const iconInfo =
                    ICON_BY_TIPO[c._tipo] ?? {
                      icon: Shield,
                      color: "text-muted-foreground",
                      bg: "bg-muted",
                    };
                  const IconComp = iconInfo.icon;
                  return (
                    <tr
                      key={`${c._tipo}-${c.id}`}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconInfo.bg}`}
                          >
                            <IconComp className={`w-3.5 h-3.5 ${iconInfo.color}`} />
                          </div>
                          <span className="font-medium">
                            {c.nome_paciente || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {c._label}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {c.municipio_notificacao || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.data_notificacao
                          ? format(new Date(c.data_notificacao), "dd/MM/yyyy")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {c.semana_epidemiologica || "—"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                        {c.numero_ficha || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            c.status === "encerrado"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 border"
                              : "bg-amber-500/10 text-amber-700 border-amber-500/20 border"
                          }
                        >
                          {c.status === "em_investigacao"
                            ? "Em Aberto"
                            : c.status === "encerrado"
                              ? "Encerrado"
                              : c.status || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Visualizar ficha"
                            aria-label="Visualizar ficha"
                            onClick={() => navigate({ to: `/fichas/${c._slug}/${c.id}` })}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary"
                              title="Editar ficha"
                              aria-label="Editar ficha"
                              onClick={() =>
                                navigate({
                                  to: `/fichas/${c._slug}/${c.id}?edit=1`,
                                })
                              }
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <SoftDeleteCaseDialog table={c._table} id={c.id}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  title="Excluir"
                                  aria-label="Excluir ficha"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                            </SoftDeleteCaseDialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                aria-label="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      )}
    </div>
  );
}
