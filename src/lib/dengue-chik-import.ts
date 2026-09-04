// Helpers de importação de planilha (Excel/CSV) para fichas de Dengue/Chikungunya.
import {
  SIM_NAO_IGN,
  SEXO,
  GESTANTE,
  RACA_COR,
  ESCOLARIDADE,
  ZONA,
  RESULTADO_SOROLOGIA_CHIK,
  RESULTADO_EXAME,
  SOROTIPO,
  CLASSIFICACAO,
  CRITERIO_CONFIRMACAO,
  CASO_AUTOCTONE,
  EVOLUCAO,
  STATUS,
  SIM_NAO,
} from "@/lib/dengue-chik-options";

export type ImportField = {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  /** apenas para um dos agravos */
  only?: "dengue" | "chikungunya";
  /** nomes alternativos de coluna */
  aliases?: string[];
};

export const IMPORT_FIELDS: ImportField[] = [
  { name: "numero_ficha", label: "Nº da Notificação", type: "text", aliases: ["nu_notific", "numero da ficha", "ficha"] },
  { name: "data_notificacao", label: "Data da notificação", type: "date", required: true, aliases: ["dt_notific"] },
  { name: "semana_epidemiologica", label: "Semana Epidemiológica", type: "text", aliases: ["sem_not", "semana"] },
  { name: "data_primeiros_sintomas", label: "Data dos primeiros sintomas", type: "date", aliases: ["dt_sin_pri"] },
  { name: "data_investigacao", label: "Data da investigação", type: "date", aliases: ["dt_invest"] },
  { name: "uf_notificacao", label: "UF da notificação", type: "text", aliases: ["sg_uf_not"] },
  { name: "municipio_notificacao", label: "Município da notificação", type: "text", aliases: ["id_municip"] },
  { name: "codigo_ibge_notificacao", label: "Código IBGE da notificação", type: "text", aliases: ["co_mun_not"] },
  { name: "regional", label: "Regional", type: "text" },
  { name: "macroregiao", label: "Macroregião", type: "text", aliases: ["macrorregiao"] },
  { name: "unidade_saude", label: "Unidade de saúde", type: "text", aliases: ["id_unidade"] },
  { name: "codigo_unidade_saude", label: "Código da unidade", type: "text", aliases: ["cnes"] },

  { name: "nome_paciente", label: "Nome do paciente", type: "text", required: true, aliases: ["nm_paciente", "paciente", "nome"] },
  { name: "data_nascimento", label: "Data de nascimento", type: "date", aliases: ["dt_nasc"] },
  { name: "idade", label: "Idade", type: "number", aliases: ["nu_idade_n"] },
  { name: "faixa_etaria", label: "Faixa Etária", type: "text" },
  { name: "sexo", label: "Sexo", type: "select", options: SEXO, aliases: ["cs_sexo"] },
  { name: "gestante", label: "Gestante", type: "select", options: GESTANTE, aliases: ["cs_gestant"] },
  { name: "raca_cor", label: "Raça/Cor", type: "select", options: RACA_COR, aliases: ["cs_raca", "raca"] },
  { name: "escolaridade", label: "Escolaridade", type: "select", options: ESCOLARIDADE, aliases: ["cs_escol_n"] },
  { name: "numero_cartao_sus", label: "Cartão SUS", type: "text", aliases: ["num_sus", "sus"] },
  { name: "nome_mae", label: "Nome da mãe", type: "text", aliases: ["nm_mae_pac"] },

  { name: "uf_residencia", label: "UF de residência", type: "text", aliases: ["sg_uf_res", "uf"] },
  { name: "municipio_residencia", label: "Município de residência", type: "text", aliases: ["id_mn_resi", "municipio"] },
  { name: "cep", label: "CEP", type: "text", aliases: ["nu_cep"] },
  { name: "bairro", label: "Bairro", type: "text", aliases: ["id_bairro"] },
  { name: "logradouro", label: "Logradouro", type: "text", aliases: ["nm_logrado"] },
  { name: "numero_endereco", label: "Número do endereço", type: "text", aliases: ["nu_numero", "numero"] },
  { name: "telefone", label: "Telefone", type: "text", aliases: ["nu_telefon"] },
  { name: "zona", label: "Zona", type: "select", options: ZONA, aliases: ["cs_zona"] },
  { name: "ocupacao", label: "Ocupação", type: "text", aliases: ["id_ocupa_n"] },

  { name: "sorologia_dengue_data", label: "Sorologia dengue — data", type: "date", only: "dengue" },
  { name: "sorologia_dengue_resultado", label: "Sorologia dengue — resultado", type: "select", options: RESULTADO_EXAME, only: "dengue" },
  { name: "ns1_data", label: "NS1 — data", type: "date", only: "dengue" },
  { name: "ns1_resultado", label: "NS1 — resultado", type: "select", options: RESULTADO_EXAME, only: "dengue" },
  { name: "sorotipo", label: "Sorotipo", type: "select", options: SOROTIPO, only: "dengue" },
  { name: "dengue_sinais_alarme", label: "Dengue com sinais de alarme?", type: "select", options: SIM_NAO, only: "dengue" },
  { name: "dengue_grave", label: "Dengue grave?", type: "select", options: SIM_NAO, only: "dengue" },
  { name: "sorologia_chikungunya_s1_data", label: "Sorologia S1 — data", type: "date", only: "chikungunya" },
  { name: "sorologia_chikungunya_resultado_s1", label: "Sorologia S1 — resultado", type: "select", options: RESULTADO_SOROLOGIA_CHIK, only: "chikungunya" },
  { name: "sorologia_chikungunya_s2_data", label: "Sorologia S2 — data", type: "date", only: "chikungunya" },
  { name: "sorologia_chikungunya_resultado_s2", label: "Sorologia S2 — resultado", type: "select", options: RESULTADO_SOROLOGIA_CHIK, only: "chikungunya" },
  { name: "rt_pcr_data", label: "RT-PCR — data", type: "date" },
  { name: "rt_pcr_resultado", label: "RT-PCR — resultado", type: "select", options: RESULTADO_EXAME },

  { name: "ocorreu_hospitalizacao", label: "Houve hospitalização?", type: "select", options: SIM_NAO_IGN },
  { name: "data_internacao", label: "Data da internação", type: "date" },
  { name: "uf_hospital", label: "UF do hospital", type: "text" },
  { name: "municipio_hospital", label: "Município do hospital", type: "text" },
  { name: "nome_hospital", label: "Nome do hospital", type: "text" },

  { name: "classificacao", label: "Classificação", type: "select", options: CLASSIFICACAO },
  { name: "criterio_confirmacao", label: "Critério de confirmação", type: "select", options: CRITERIO_CONFIRMACAO },
  { name: "caso_autoctone", label: "Caso autóctone", type: "select", options: CASO_AUTOCTONE },
  { name: "evolucao", label: "Evolução", type: "select", options: EVOLUCAO },
  { name: "data_obito", label: "Data da Evolução", type: "date" },
  { name: "data_encerramento", label: "Data de encerramento", type: "date" },
  { name: "status", label: "Status", type: "select", options: STATUS },
  { name: "observacoes_adicionais", label: "Observações adicionais", type: "text" },
  { name: "nome_investigador", label: "Nome do investigador", type: "text" },
  { name: "funcao_investigador", label: "Função do investigador", type: "text" },
];

export function fieldsForAgravo(agravo: "dengue" | "chikungunya"): ImportField[] {
  return IMPORT_FIELDS.filter((f) => !f.only || f.only === agravo);
}

export function normalizeKey(s: string): string {
  return (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
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
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    // serial do Excel (base 1899-12-30)
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

export function matchOption(value: unknown, options: { value: string; label: string }[]): string | null {
  const v = normalizeKey(String(value ?? ""));
  if (!v) return null;
  const found = options.find((o) => normalizeKey(o.value) === v || normalizeKey(o.label) === v);
  return found ? found.value : null;
}

export type RowError = { field: string; label: string; message: string };
export type ParsedRow = {
  line: number;
  payload: Record<string, unknown>;
  errors: RowError[];
};

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
        if (!iso) errors.push({ field: field.name, label: field.label, message: `data inválida ("${raw}")` });
        else payload[field.name] = iso;
      } else if (field.type === "number") {
        const n = Number(String(raw).replace(",", "."));
        if (Number.isNaN(n)) errors.push({ field: field.name, label: field.label, message: `número inválido ("${raw}")` });
        else payload[field.name] = Math.trunc(n);
      } else if (field.type === "select") {
        const v = matchOption(raw, field.options ?? []);
        if (!v) errors.push({ field: field.name, label: field.label, message: `valor não permitido ("${raw}")` });
        else payload[field.name] = v;
      } else {
        payload[field.name] = String(raw).trim().toUpperCase();
      }
    });

    for (const f of fields) {
      if (f.required && !payload[f.name]) {
        errors.push({ field: f.name, label: f.label, message: "obrigatório" });
      }
    }

    const ficha = payload["numero_ficha"];
    if (typeof ficha === "string" && ficha) {
      if (seenFichas.has(ficha)) {
        errors.push({ field: "numero_ficha", label: "Nº da Notificação", message: `duplicado na planilha ("${ficha}")` });
      }
      seenFichas.add(ficha);
    }

    if (!payload["status"]) {
      payload["status"] = payload["data_encerramento"] ? "encerrado" : "em_investigacao";
    }

    out.push({ line: idx + 2, payload, errors });
  });

  return out;
}
