import { describe, expect, it } from "vitest";
import { hasAcceptedCurrentTerm } from "./confidentiality-term";

describe("aceite obrigatório do termo", () => {
  it("bloqueia primeiro acesso sem aceite", () => {
    expect(hasAcceptedCurrentTerm(null, "usuario-a")).toBe(false);
  });
  it("libera somente após o aceite da versão vigente", () => {
    expect(hasAcceptedCurrentTerm({ user_id: "usuario-a", versao_termo: "1.0" }, "usuario-a")).toBe(true);
  });
  it("exige novo aceite quando a versão muda", () => {
    expect(hasAcceptedCurrentTerm({ user_id: "usuario-a", versao_termo: "1.0" }, "usuario-a", "2.0")).toBe(false);
  });
  it("não reaproveita o aceite de outro usuário", () => {
    expect(hasAcceptedCurrentTerm({ user_id: "usuario-b", versao_termo: "1.0" }, "usuario-a")).toBe(false);
  });
});