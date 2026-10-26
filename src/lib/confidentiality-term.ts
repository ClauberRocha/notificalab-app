// Update the version whenever the text changes to require a renewed acceptance.
export const CONFIDENTIALITY_TERM = {
  version: "1.0",
  paragraphs: [
    "Texto provisório — este termo será substituído pela versão oficial da instituição.",
    "Comprometo-me a manter a confidencialidade dos dados pessoais e de saúde acessados no Notifica-MA, utilizando-os exclusivamente para as atividades autorizadas de vigilância em saúde.",
    "Não divulgarei, compartilharei ou reproduzirei informações identificáveis fora dos canais e das finalidades autorizados. Protegerei minhas credenciais e não permitirei que outras pessoas utilizem minha conta.",
    "Comunicarei à instituição qualquer suspeita de acesso indevido ou incidente envolvendo essas informações. Estou ciente de que os acessos e as operações realizadas no sistema podem ser auditados.",
  ],
} as const;

export function hasAcceptedCurrentTerm(
  acceptance: { user_id: string; versao_termo: string } | null | undefined,
  userId: string,
  version: string = CONFIDENTIALITY_TERM.version,
): boolean {
  return acceptance?.user_id === userId && acceptance.versao_termo === version;
}