// Helpers genéricos de importação de planilha (Excel/CSV) para as fichas de agravo.
import { CASE_COLUMNS, type ColumnKind } from "@/lib/case-import-columns";

export type ImportField = {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  /** nomes alternativos de coluna */
  aliases?: string[];
};

export function normalizeKey(s: string): string {
  return (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const LABEL_WORDS: Record<string, string> = {
  data: "Data",
  dt: "Data",
  uf: "UF",
  ibge: "IBGE",
  cep: "CEP",
  sus: "SUS",
  hiv: "HIV",
  tarv: "TARV",
  rt: "RT",
  pcr: "PCR",
  ns1: "NS1",
  s1: "S1",
  s2: "S2",
  bcg: "BCG",
  tb: "TB",
  tmr: "TMR",
  dta: "DTA",
  srag: "SRAG",
  raio: "Raio",
  x: "X",
  num: "Nº",
  numero: "Número",
  nome: "Nome",
  mae: "Mãe",
  ocupacao: "Ocupação",
  municipio: "Município",
  saude: "Saúde",
  notificacao: "Notificação",
  investigacao: "Investigação",
  residencia: "Residência",
  raca: "Raça",
  cor: "Cor",
  escolaridade: "Escolaridade",
  classificacao: "Classificação",
  criterio: "Critério",
  confirmacao: "Confirmação",
  evolucao: "Evolução",
  obito: "Óbito",
  encerramento: "Encerramento",
  observacoes: "Observações",
  adicionais: "Adicionais",
  investigador: "Investigador",
  funcao: "Função",
  unidade: "Unidade",
  hospitalizacao: "Hospitalização",
  internacao: "Internação",
  epidemiologica: "Epidemiológica",
  semana: "Semana",
  sintomas: "Sintomas",
  primeiros: "Primeiros",
  regiao: "Região",
  regional: "Regional",
  macroregiao: "Macrorregião",
  vacinacao: "Vacinação",
  vacinal: "Vacinal",
  laboratorio: "Laboratório",
  laboratorial: "Laboratorial",
  antecedentes: "Antecedentes",
  transmissao: "Transmissão",
  autoctone: "Autóctone",
  animal: "Animal",
  especie: "Espécie",
  exposicao: "Exposição",
  tratamento: "Tratamento",
  esquema: "Esquema",
  terapeutico: "Terapêutico",
  baciloscopia: "Baciloscopia",
  radiografia: "Radiografia",
  torax: "Tórax",
  historico: "Histórico",
  gestacao: "Gestação",
  gestacional: "Gestacional",
  parto: "Parto",
  ocorrencia: "Ocorrência",
  local: "Local",
  telefone: "Telefone",
  bairro: "Bairro",
  logradouro: "Logradouro",
  complemento: "Complemento",
  endereco: "Endereço",
  hospital: "Hospital",
  liquor: "Líquor",
  aspecto: "Aspecto",
  contato: "Contato",
  caso: "Caso",
  casos: "Casos",
};

const LABEL_OVERRIDES: Record<string, string> = {
  numero_ficha: "Nº da Notificação",
  nome_paciente: "Nome do paciente",
  data_notificacao: "Data da notificação",
  data_primeiros_sintomas: "Data dos primeiros sintomas",
  semana_epidemiologica: "Semana Epidemiológica",
  numero_cartao_sus: "Cartão SUS",
  raca_cor: "Raça/Cor",
  faixa_etaria: "Faixa Etária",
  codigo_ibge_notificacao: "Código IBGE da notificação",
  codigo_ibge_residencia: "Código IBGE de residência",
};

export function humanizeColumn(name: string): string {
  if (LABEL_OVERRIDES[name]) return LABEL_OVERRIDES[name];
  const parts = name.split("_").map((p) => LABEL_WORDS[p] ?? p);
  const first = parts[0];
  const head = LABEL_WORDS[name.split("_")[0]] ? first : first.charAt(0).toUpperCase() + first.slice(1);
  return [head, ...parts.slice(1)].join(" ");
}

type OptionList = { value: string; label: string }[];

function isOptionList(v: unknown): v is OptionList {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    typeof v[0] === "object" &&
    v[0] !== null &&
    "value" in (v[0] as object) &&
    "label" in (v[0] as object)
  );
}

const SIM_NAO: OptionList = [
  { value: "true", label: "Sim" },
  { value: "false", label: "Não" },
];

/**
 * Monta os campos importáveis de uma tabela de fichas a partir das colunas
 * reais, reaproveitando as listas de opções do módulo do agravo.
 */
export function fieldsForTable(
  table: string,
  optionsNs: Record<string, unknown>,
  config?: { required?: string[]; aliases?: Record<string, string[]> },
): ImportField[] {
  const columns = CASE_COLUMNS[table] ?? {};
  const byKey = new Map<string, OptionList>();
  for (const [k, v] of Object.entries(optionsNs)) {
    if (isOptionList(v)) byKey.set(normalizeKey(k), v);
  }
  const required = new Set(config?.required ?? []);

  return Object.entries(columns).map(([name, kind]) => {
    const options = byKey.get(name);
    return {
      name,
      label: humanizeColumn(name),
      type: fieldType(kind, !!options),
      options: options ?? (kind === "b" ? SIM_NAO : undefined),
      required: required.has(name),
      aliases: config?.aliases?.[name],
    } satisfies ImportField;
  });
}

function fieldType(kind: ColumnKind, hasOptions: boolean): ImportField["type"] {
  if (kind === "d") return "date";
  if (kind === "n") return "number";
  if (kind === "b" || hasOptions) return "select";
  return "text";
}

/** Sugere o campo do sistema para um cabeçalho da planilha. */
export function guessField(header: string, fields: ImportField[]): string | null {
  const h = normalizeKey(header);
  if (!h) return null;
  for (const f of fields) {
    const candidates = [f.name, f.label, ...(f.aliases ?? [])].map(normalizeKey);
    if (candidates.includes(h)) return f.name;
  }
  for (const f of fields) {
    const candidates = [f.name, f.label, ...(f.aliases ?? [])].map(normalizeKey);
    if (candidates.some((c) => c.length > 3 && (c.startsWith(h) || h.startsWith(c)))) return f.name;
  }
  return null;
}

/** Converte valores de data (texto BR/ISO ou serial do Excel) em ISO yyyy-mm-dd. */
export function toIsoDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
      value.getDate(),
    ).padStart(2, "0")}`;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = Math.round((value - 25569) * 86400 * 1000);
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    const day = m[1].padStart(2, "0");
    const month = m[2].padStart(2, "0");
    let year = m[3];
    if (year.length === 2) year = Number(year) > 50 ? `19${year}` : `20${year}`;
    const iso = `${year}-${month}-${day}`;
    return isNaN(new Date(iso).getTime()) ? null : iso;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function matchOption(value: unknown, options: OptionList): string | null {
  const v = normalizeKey(String(value ?? ""));
  if (!v) return null;
  const found = options.find((o) => normalizeKey(o.value) === v || normalizeKey(o.label) === v);
  if (found) return found.value;
  if (["1", "s", "sim", "true", "verdadeiro"].includes(v) && options === SIM_NAO) return "true";
  if (["0", "n", "nao", "false", "falso"].includes(v) && options === SIM_NAO) return "false";
  return null;
}

export type RowError = { field: string; label: string; message: string };
export type ParsedRow = { line: number; payload: Record<string, unknown>; errors: RowError[] };

/** Converte e valida as linhas da planilha conforme o mapeamento coluna→campo. */
export function buildRows(
  headers: string[],
  dataRows: unknown[][],
  mapping: Record<string, string>,
  fields: ImportField[],
): ParsedRow[] {
  const byName = new Map(fields.map((f) => [f.name, f]));
  const seenFichas = new Set<string>();
  const out: ParsedRow[] = [];

  dataRows.forEach((row, idx) => {
    const payload: Record<string, unknown> = {};
    const errors: RowError[] = [];

    headers.forEach((header, i) => {
      const fieldName = mapping[header];
      if (!fieldName || fieldName === "__ignore__") return;
      const field = byName.get(fieldName);
      if (!field) return;
      const raw = row[i];
      if (raw === null || raw === undefined || String(raw).trim() === "") return;

      if (field.type === "date") {
        const iso = toIsoDate(raw);
        if (!iso) errors.push({ field: field.name, label: field.label, message: "data inválida" });
        else payload[field.name] = iso;
        return;
      }
      if (field.type === "number") {
        const n = Number(String(raw).replace(",", "."));
        if (!Number.isFinite(n)) errors.push({ field: field.name, label: field.label, message: "número inválido" });
        else payload[field.name] = n;
        return;
      }
      if (field.type === "select" && field.options) {
        const v = matchOption(raw, field.options);
        if (!v) {
          errors.push({
            field: field.name,
            label: field.label,
            message: `valor "${String(raw)}" não permitido`,
          });
        } else {
          payload[field.name] = v === "true" ? true : v === "false" ? false : v;
        }
        return;
      }
      payload[field.name] = String(raw).trim();
    });

    for (const f of fields) {
      if (f.required && (payload[f.name] === undefined || payload[f.name] === "")) {
        errors.push({ field: f.name, label: f.label, message: "obrigatório" });
      }
    }

    const ficha = payload["numero_ficha"];
    if (typeof ficha === "string" && ficha !== "") {
      if (seenFichas.has(ficha)) {
        errors.push({ field: "numero_ficha", label: "Nº da Notificação", message: "duplicado na planilha" });
      }
      seenFichas.add(ficha);
    }

    out.push({ line: idx + 2, payload, errors });
  });

  return out;
}
