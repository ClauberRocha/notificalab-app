import { describe, expect, it } from "vitest";
import { CASE_TABLES, deletionReasonSchema, isActiveCase } from "./case-lifecycle";

describe("exclusão lógica", () => {
  it("abrange as 14 tabelas de agravos", () => {
    expect(new Set(CASE_TABLES).size).toBe(14);
    expect(CASE_TABLES).toContain("meningite_cases");
  });
  it("exige motivo preenchido", () => {
    expect(deletionReasonSchema.safeParse("   ").success).toBe(false);
    expect(deletionReasonSchema.parse(" Duplicidade ")).toBe("Duplicidade");
  });
  it("ignora fichas com deleted_at preenchido", () => {
    expect(isActiveCase({ deleted_at: "2026-10-13T11:50:00Z" })).toBe(false);
    expect(isActiveCase({ deleted_at: null })).toBe(true);
  });
});