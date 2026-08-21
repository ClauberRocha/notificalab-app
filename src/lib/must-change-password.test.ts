import { describe, expect, it } from "vitest";
import {
  LOGIN_SUCCESS_CLEARED_DESCRIPTION,
  LOGIN_SUCCESS_PENDING_DESCRIPTION,
  loginSuccessFeedback,
  needsPasswordChange,
} from "./must-change-password";

const user = (meta: Record<string, unknown>) => ({ user_metadata: meta });

describe("needsPasswordChange", () => {
  it("exige troca somente quando a marca é exatamente true", () => {
    expect(needsPasswordChange(user({ must_change_password: true }))).toBe(true);
  });

  it("não exige troca quando a marca foi limpa na redefinição", () => {
    expect(needsPasswordChange(user({ must_change_password: false }))).toBe(false);
  });

  it("não exige troca quando a marca não existe mais", () => {
    expect(needsPasswordChange(user({}))).toBe(false);
    expect(needsPasswordChange({ user_metadata: null })).toBe(false);
    expect(needsPasswordChange(null)).toBe(false);
  });

  it("ignora valores truthy que não são booleanos (token defasado)", () => {
    expect(needsPasswordChange(user({ must_change_password: "true" }))).toBe(false);
    expect(needsPasswordChange(user({ must_change_password: 1 }))).toBe(false);
  });
});

describe("login após redefinição de senha", () => {
  it("confirma que não há ação pendente e não volta à tela de troca", () => {
    // Estado do usuário logo após concluir a redefinição pelo link de e-mail.
    const afterReset = user({ must_change_password: false });
    const feedback = loginSuccessFeedback(afterReset);

    expect(feedback.pending).toBe(false);
    expect(feedback.description).toBe(LOGIN_SUCCESS_CLEARED_DESCRIPTION);
    // A tela de troca obrigatória é renderizada só quando pending === true.
    expect(needsPasswordChange(afterReset)).toBe(false);
  });

  it("primeiro acesso ainda cai na troca obrigatória", () => {
    const firstAccess = user({ must_change_password: true });
    const feedback = loginSuccessFeedback(firstAccess);

    expect(feedback.pending).toBe(true);
    expect(feedback.description).toBe(LOGIN_SUCCESS_PENDING_DESCRIPTION);
  });

  it("logins repetidos após a redefinição continuam sem pendência", () => {
    const afterReset = user({ must_change_password: false });
    for (let i = 0; i < 3; i += 1) {
      expect(loginSuccessFeedback(afterReset).pending).toBe(false);
    }
  });
});
