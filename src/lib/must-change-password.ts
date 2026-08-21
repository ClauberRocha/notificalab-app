// Fonte única de verdade para a marca de "troca obrigatória de senha".
// A marca vive em user_metadata.must_change_password e SEMPRE deve ser lida
// de um usuário confirmado pelo servidor (supabase.auth.getUser()), porque o
// token guardado localmente pode estar defasado após uma redefinição.

type MetadataCarrier = {
  user_metadata?: Record<string, unknown> | null;
} | null | undefined;

/**
 * Retorna true apenas quando o servidor confirma a marca.
 * Qualquer outro valor (false, ausente, string, usuário nulo) = sem pendência.
 */
export function needsPasswordChange(user: MetadataCarrier): boolean {
  return user?.user_metadata?.["must_change_password"] === true;
}

export const LOGIN_SUCCESS_MESSAGE = "Login realizado com sucesso";
export const LOGIN_SUCCESS_CLEARED_DESCRIPTION =
  "Sua senha já está atualizada e não há nenhuma ação pendente.";
export const LOGIN_SUCCESS_PENDING_DESCRIPTION =
  "Antes de continuar, defina uma nova senha (troca obrigatória pendente).";

/** Mensagem de confirmação exibida após um login bem-sucedido. */
export function loginSuccessFeedback(user: MetadataCarrier): {
  title: string;
  description: string;
  pending: boolean;
} {
  const pending = needsPasswordChange(user);
  return {
    title: LOGIN_SUCCESS_MESSAGE,
    description: pending
      ? LOGIN_SUCCESS_PENDING_DESCRIPTION
      : LOGIN_SUCCESS_CLEARED_DESCRIPTION,
    pending,
  };
}
