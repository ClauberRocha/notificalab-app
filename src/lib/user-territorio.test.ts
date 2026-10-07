import { describe, expect, it } from "vitest";
import { UserTerritorioSchema } from "./user-territorio";
import { TERRITORIO_MUNICIPIOS } from "@/data/territorio-municipios";

describe("territórios de usuários", () => {
  it("tem os 217 municípios oficiais do Maranhão sem códigos duplicados", () => {
    expect(TERRITORIO_MUNICIPIOS).toHaveLength(217);
    expect(new Set(TERRITORIO_MUNICIPIOS.map(m => m.ibge)).size).toBe(217);
    expect(TERRITORIO_MUNICIPIOS.every(m => /^21\d{5}$/.test(m.ibge) && m.regional)).toBe(true);
  });
  it("valida os três níveis", () => {
    for (const territorio of [
      { nivel: "estadual", regional: null, municipio_ibge: null },
      { nivel: "regional", regional: "BALSAS", municipio_ibge: null },
      { nivel: "municipal", regional: "BALSAS", municipio_ibge: "2101400" },
    ]) expect(UserTerritorioSchema.safeParse(territorio).success).toBe(true);
  });
  it("rejeita município de outra regional, ausência de território e nível inválido", () => {
    for (const territorio of [
      { nivel: "municipal", regional: "BALSAS", municipio_ibge: "2111300" },
      { nivel: "municipal", regional: "BALSAS", municipio_ibge: null },
      { nivel: "regional", regional: null, municipio_ibge: null },
      { nivel: "estadual", regional: "BALSAS", municipio_ibge: null },
      { nivel: "global", regional: null, municipio_ibge: null },
    ]) expect(UserTerritorioSchema.safeParse(territorio).success).toBe(false);
  });
});