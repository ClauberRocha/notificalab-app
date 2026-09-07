// Configuração de importação de planilha por agravo.
import { fieldsForTable, type ImportField } from "@/lib/case-import";
import { fieldsForAgravo } from "@/lib/dengue-chik-import";

import * as coqueluche from "@/lib/coqueluche-options";
import * as difteria from "@/lib/difteria-options";
import * as epizootia from "@/lib/epizootia-options";
import * as exantematica from "@/lib/exantematica-options";
import * as febreAmarela from "@/lib/febre-amarela-options";
import * as hanseniase from "@/lib/hanseniase-options";
import * as meningite from "@/lib/meningite-options";
import * as raivaHumana from "@/lib/raiva-humana-options";
import * as srag from "@/lib/srag-options";
import * as surtoDta from "@/lib/surto-dta-options";
import * as tetanoAcidental from "@/lib/tetano-acidental-options";
import * as tetanoNeonatal from "@/lib/tetano-neonatal-options";
import * as tuberculose from "@/lib/tuberculose-options";

export type ImportConfig = {
  table: string;
  title: string;
  fields: ImportField[];
  /** valores fixos adicionados a todas as linhas (ex.: agravo) */
  extra?: Record<string, unknown>;
};

const ALIASES: Record<string, string[]> = {
  numero_ficha: ["nu_notific", "numero da ficha", "ficha"],
  data_notificacao: ["dt_notific"],
  nome_paciente: ["nm_paciente", "paciente", "nome"],
  data_nascimento: ["dt_nasc"],
  data_primeiros_sintomas: ["dt_sin_pri"],
  semana_epidemiologica: ["sem_not", "semana"],
  municipio_notificacao: ["id_municip"],
  municipio_residencia: ["id_mn_resi", "municipio"],
  sexo: ["cs_sexo"],
  raca_cor: ["cs_raca", "raca"],
  escolaridade: ["cs_escol_n"],
  gestante: ["cs_gestant"],
  zona: ["cs_zona"],
  bairro: ["id_bairro"],
  logradouro: ["nm_logrado"],
  cep: ["nu_cep"],
  telefone: ["nu_telefon"],
  nome_mae: ["nm_mae_pac"],
  ocupacao: ["id_ocupa_n"],
};

function generic(
  table: string,
  title: string,
  ns: Record<string, unknown>,
  required: string[] = ["nome_paciente", "data_notificacao"],
): ImportConfig {
  return { table, title, fields: fieldsForTable(table, ns, { required, aliases: ALIASES }) };
}

export const IMPORT_CONFIGS: Record<string, ImportConfig> = {
  dengue: {
    table: "dengue_chikungunya_cases",
    title: "Dengue",
    fields: fieldsForAgravo("dengue"),
    extra: { agravo: "dengue" },
  },
  chikungunya: {
    table: "dengue_chikungunya_cases",
    title: "Chikungunya",
    fields: fieldsForAgravo("chikungunya"),
    extra: { agravo: "chikungunya" },
  },
  meningite: generic("meningite_cases", "Meningite", meningite),
  sarampo: {
    ...generic("exantematica_cases", "Sarampo", exantematica),
    extra: { agravo: "sarampo" },
  },
  rubeola: {
    ...generic("exantematica_cases", "Rubéola", exantematica),
    extra: { agravo: "rubeola" },
  },
  coqueluche: generic("coqueluche_cases", "Coqueluche", coqueluche),
  difteria: generic("difteria_cases", "Difteria", difteria),
  "febre-amarela": generic("febre_amarela_cases", "Febre Amarela", febreAmarela),
  hanseniase: generic("hanseniase_cases", "Hanseníase", hanseniase),
  "raiva-humana": generic("raiva_humana_cases", "Raiva Humana", raivaHumana),
  srag: generic("srag_cases", "SRAG", srag),
  "tetano-acidental": generic("tetano_acidental_cases", "Tétano Acidental", tetanoAcidental),
  "tetano-neonatal": generic("tetano_neonatal_cases", "Tétano Neonatal", tetanoNeonatal),
  tuberculose: generic("tuberculose_cases", "Tuberculose", tuberculose),
  epizootia: generic("epizootia_cases", "Epizootia", epizootia, ["data_notificacao"]),
  "surto-dta": generic("surto_dta_cases", "Surto DTA", surtoDta, ["data_notificacao"]),
};

export function importConfig(slug: string): ImportConfig | null {
  return IMPORT_CONFIGS[slug] ?? null;
}
