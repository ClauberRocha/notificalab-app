# Validação de DNS antes de disparar e-mails

Hoje o sistema tenta enviar o e-mail de senha temporária mesmo com o domínio de envio (`notify.consulti.slz.br`) ainda não verificado — o erro só aparece no log do servidor e o usuário não recebe nada, sem aviso claro.

A proposta é criar uma verificação real de DNS público antes de qualquer disparo.

## O que muda

1. **Verificador de DNS público (novo módulo do servidor)**
   - Consulta DNS público (DNS-over-HTTPS do Google, com Cloudflare como fallback) para:
     - TXT em `_lovable-email.consulti.slz.br` contendo o token de verificação esperado;
     - NS em `notify.consulti.slz.br` apontando para os dois nameservers esperados.
   - Retorna um resultado estruturado: pronto / não pronto, com a lista dos registros faltantes.
   - Resultado fica em cache em memória: 10 minutos quando pronto, 60 segundos quando não pronto (evita consulta a cada envio).

2. **Bloqueio no envio**
   - `sendTemplateEmail` passa a chamar o verificador antes de enviar.
   - Se os registros não estiverem publicados, nenhum e-mail é enviado e a função retorna um resultado explícito de "DNS pendente" (em vez de lançar erro genérico), incluindo quais registros faltam.

3. **Retorno visível na tela de Usuários**
   - Ao gerar senha temporária, a resposta da função passa a informar se o e-mail foi enviado ou se ficou bloqueado por DNS pendente.
   - O diálogo de senha temporária exibe um aviso quando o e-mail não pôde ser enviado ("Domínio de e-mail ainda não verificado — informe a senha ao usuário por outro canal"), em vez de sugerir silenciosamente que o e-mail saiu.

4. **Consulta de status sob demanda**
   - Uma função de servidor leve permite à tela de Usuários mostrar o estado atual da verificação (pronto / registros faltando), para admins entenderem o motivo do bloqueio.

## Detalhes técnicos

- Novo arquivo `src/lib/email-templates/dns-check.server.ts` com `checkSenderDnsReady()`; nomes/valores esperados vêm de constantes junto com `SENDER_DOMAIN` já existente em `send-email.ts`.
- Consultas via `fetch` para `https://dns.google/resolve?name=...&type=TXT|NS` (compatível com o runtime de Worker; sem uso do módulo `dns` do Node).
- `SendTemplateEmailResult` ganha a variante `{ sent: false; reason: 'sender_dns_not_ready'; missing: string[] }`.
- `setTemporaryPassword` em `src/lib/users.functions.ts` passa a devolver `emailStatus` junto de `password`; `src/routes/_authenticated/usuarios.tsx` exibe o aviso correspondente.
- Sem mudanças de banco de dados e sem alteração nos templates de e-mail de autenticação (esses continuam sendo enviados pela infraestrutura gerenciada).
