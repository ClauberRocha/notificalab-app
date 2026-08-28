# Diagnóstico de e-mail (DNS) e reenvio de senha temporária

## O que será feito

### 1. Nova tela de Admin: "Diagnóstico de E-mail"
Rota `/diagnostico-email`, visível apenas para administradores (item no menu lateral protegido por papel).

Conteúdo:
- Cartão de status geral: **Pronto** ou **Pendente**, com o domínio de envio (`notify.consulti.slz.br`).
- Tabela com cada registro esperado (TXT de verificação e os dois NS), indicando encontrado / não encontrado.
- Carimbo "última verificação em ..." e botão **Verificar agora** (força nova consulta pública, ignorando o cache).
- Instruções passo a passo para o Registro.br, com nome curto e valor exato de cada registro e botão de copiar.

### 2. Botão de reenvio da senha temporária
Na tela de Usuários, além de gerar senha temporária, um botão **Reenviar e-mail da senha temporária** por usuário:
- Gera uma nova senha temporária e tenta enviar o e-mail.
- Se o DNS público ainda não estiver pronto, o envio é bloqueado, nada é enviado e a tela informa exatamente quais registros faltam.
- Cada tentativa (enviada ou bloqueada) fica registrada nos logs do sistema com o motivo.

### 3. Auditoria detalhada no backend
Toda tentativa de envio passa a gravar em `system_logs`:
- resultado (`enviado`, `bloqueado_dns`, `suprimido`, `erro`),
- quais registros DNS faltaram,
- horário da verificação de DNS utilizada,
- destinatário e modelo de e-mail.

Consultável na tela de Logs já existente.

### 4. Aviso melhorado na tela de Usuários
O aviso atual passa a listar cada registro faltante em formato de tabela (Tipo / Nome / Valor), com exemplo do formato correto no Registro.br, alerta de não usar a tela "Alterar servidores DNS" e botão de copiar valor.

### 5. Testes automatizados
Testes cobrindo: envio bloqueado quando falta TXT, quando faltam NS, quando faltam ambos; envio liberado quando a consulta pública confirma tudo; e o comportamento do cache (resultado negativo é reconsultado mais rápido que o positivo).

## Detalhes técnicos

- `src/lib/email-templates/dns-check.server.ts`: expor detalhamento por registro (`records: { type, name, expected, found }[]`), aceitar `force` (já existe) e permitir injeção do resolvedor para teste.
- Novo `src/lib/email-audit.server.ts`: helper `logEmailAttempt(...)` gravando em `system_logs` via `supabaseAdmin` (`entity_type: "email"`), nunca lançando erro.
- `src/lib/email-templates/send-email.ts`: chamar o helper de auditoria no bloqueio por DNS, no envio bem-sucedido e na supressão.
- `src/lib/users.functions.ts`: `getSenderDnsStatus` retorna o detalhamento por registro e aceita `force`; nova server fn `resendTemporaryPassword` (admin, via `has_role`) reutilizando a lógica de `setTemporaryPassword`.
- `src/routes/_authenticated/diagnostico-email.tsx`: nova rota com `useQuery` + botão de revalidação; `head()` próprio.
- `src/components/app-sidebar.tsx`: item novo dentro de `RoleGate allow={["admin"]}`.
- `src/lib/email-dns.test.ts`: testes com resolvedor simulado (sem rede).
