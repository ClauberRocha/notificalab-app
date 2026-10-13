import { z } from "zod";

export const CASE_TABLES = [
  "coqueluche_cases", "dengue_chikungunya_cases", "difteria_cases",
  "epizootia_cases", "exantematica_cases", "febre_amarela_cases",
  "hanseniase_cases", "meningite_cases", "raiva_humana_cases", "srag_cases",
  "surto_dta_cases", "tetano_acidental_cases", "tetano_neonatal_cases",
  "tuberculose_cases",
] as const;

export const deletionReasonSchema = z.string().trim().min(1, "Informe o motivo da exclusão.");

export function isActiveCase(row: { deleted_at?: unknown }): boolean {
  return row.deleted_at == null;
}