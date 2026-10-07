import { z } from "zod";
import { TERRITORIO_MUNICIPIOS, TERRITORIO_REGIONAIS } from "@/data/territorio-municipios";

export const UserTerritorioSchema = z.object({
  nivel: z.enum(["municipal", "regional", "estadual"]),
  regional: z.string().nullable(),
  municipio_ibge: z.string().nullable(),
}).superRefine((value, ctx) => {
  if (value.nivel === "estadual") {
    if (value.regional !== null || value.municipio_ibge !== null) {
      ctx.addIssue({ code: "custom", path: ["nivel"], message: "Território estadual não deve informar Regional ou Município." });
    }
    return;
  }
  if (!value.regional || !TERRITORIO_REGIONAIS.includes(value.regional)) {
    ctx.addIssue({ code: "custom", path: ["regional"], message: "Selecione uma Regional válida." });
  }
  if (value.nivel === "municipal") {
    const municipio = TERRITORIO_MUNICIPIOS.find(m => m.ibge === value.municipio_ibge);
    if (!municipio || municipio.regional !== value.regional) {
      ctx.addIssue({ code: "custom", path: ["municipio_ibge"], message: "Selecione um Município da Regional informada." });
    }
  } else if (value.municipio_ibge !== null) {
    ctx.addIssue({ code: "custom", path: ["municipio_ibge"], message: "Território regional não deve informar Município." });
  }
});

export type UserTerritorio = z.infer<typeof UserTerritorioSchema>;