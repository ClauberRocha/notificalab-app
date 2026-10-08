# RLS por território — políticas atuais e propostas

## Situação verificada

Nenhuma política foi alterada. O front-end permanece intacto.

As 14 tabelas possuem quatro políticas permissivas, todas para `authenticated`, com o mesmo padrão. Apenas **coqueluche_cases, difteria_cases e meningite_cases** possuem a coluna `codigo_ibge_residencia`.

**Bloqueio:** as outras 11 tabelas não possuem uma coluna de código IBGE de residência. Não usar `codigo_ibge_notificacao` como substituto: ele representa outro território. Epizootia e Surto DTA sequer têm município de residência; possuem município de ocorrência.

## Políticas atuais de cada tabela

Os nomes completos seguem `<tabela>_<sufixo>`:

- SELECT: `<tabela>_select_authenticated`
- UPDATE: `<tabela>_update_owner_or_staff`
- DELETE: `<tabela>_delete_admin_only`
- INSERT: `<tabela>_insert_own`

Na tabela abaixo, **A** significa as quatro regras atuais descritas logo depois; **T(c)** significa as novas regras territoriais, usando a coluna `c`.

| Tabela | Políticas atuais | Novas políticas propostas | Código IBGE de residência |
|---|---|---|---|
| coqueluche_cases | A | T(codigo_ibge_residencia) | Existe |
| dengue_chikungunya_cases | A | T(coluna a definir) | Ausente — bloqueada |
| difteria_cases | A | T(codigo_ibge_residencia) | Existe |
| epizootia_cases | A | T(coluna a definir) | Ausente; só território de ocorrência/notificação — bloqueada |
| exantematica_cases | A | T(coluna a definir) | Ausente — bloqueada |
| febre_amarela_cases | A | T(coluna a definir) | Ausente — bloqueada |
| hanseniase_cases | A | T(coluna a definir) | Ausente — bloqueada |
| meningite_cases | A | T(codigo_ibge_residencia) | Existe |
| raiva_humana_cases | A | T(coluna a definir) | Ausente — bloqueada |
| srag_cases | A | T(coluna a definir) | Ausente — bloqueada |
| surto_dta_cases | A | T(coluna a definir) | Ausente; só território de ocorrência/notificação — bloqueada |
| tetano_acidental_cases | A | T(coluna a definir) | Ausente — bloqueada |
| tetano_neonatal_cases | A | T(coluna a definir) | Ausente — bloqueada |
| tuberculose_cases | A | T(coluna a definir) | Ausente — bloqueada |

### A — regras atuais, iguais nas 14 tabelas

- **SELECT:** qualquer usuário autenticado pode ler (`USING (true)`).
- **UPDATE:** autor da ficha OU Administrador OU Gestor; essa mesma condição consta em `USING` e `WITH CHECK`.
- **DELETE:** somente Administrador.
- **INSERT:** usuário autenticado pode inserir quando `user_id = auth.uid()`; não há filtro de papel na política atual.

### T(c) — regras novas propostas, mantendo os nomes atuais

- **SELECT:** exigir `public.pode_ver(c)`.
- **UPDATE:** condição atual **E** `public.pode_ver(c)`, tanto em `USING` quanto em `WITH CHECK`. Isso verifica o território da ficha antes e depois da edição, impedindo transferi-la para um território não autorizado.
- **DELETE:** Administrador **E** `public.pode_ver(c)`; não ampliar exclusão para Gestor ou autor.
- **INSERT:** manter a política existente exatamente como está, sem acrescentar restrição territorial ou alterar os perfis nesta tarefa.

## Impacto antes da confirmação

- Administradores continuam com abrangência total, pois `pode_ver` já libera esse perfil.
- Usuários com nível estadual mantêm leitura estadual; níveis regional e municipal passam a ler somente seu território.
- Usuários não administradores **sem território cadastrado não poderão ler nem atualizar fichas**.
- Atualmente, `user_territorios` está **sem registros**. Ativar essas regras agora ocultaria as fichas de todos os não administradores até o cadastro dos territórios.
- IBGE vazio ou desconhecido não corresponde a territórios municipais/regionais; Administrador e nível estadual continuam liberados pela função existente.
- Mantendo INSERT exatamente como está, uma ficha criada fora do território poderá ser gravada, mas não ficará acessível ao autor pela nova regra de SELECT.

## Decisão necessária

Antes de aplicar, definir como obter o IBGE de residência nas 11 tabelas sem essa coluna e qual território utilizar em Epizootia e Surto DTA. Não criar colunas, preencher dados, substituir residência por notificação/ocorrência ou aplicar parcialmente às três tabelas sem autorização explícita.

Confirmar também o momento de ativação: após cadastrar os territórios dos usuários ou aceitando o bloqueio temporário dos não administradores.

## Detalhes técnicos

Condições atuais verificadas no banco:

```sql
-- SELECT
USING (true)

-- UPDATE: USING e WITH CHECK iguais
(auth.uid() = user_id) OR EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role = ANY (ARRAY['admin'::public.app_role, 'gestor'::public.app_role])
)

-- DELETE
EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
)

-- INSERT
WITH CHECK (auth.uid() = user_id)
```

Forma proposta nas tabelas com `codigo_ibge_residencia`, preservando a expressão existente de papel/autoria:

```sql
-- SELECT
USING (public.pode_ver(codigo_ibge_residencia))

-- UPDATE
USING (
  ((auth.uid() = user_id) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['admin'::public.app_role, 'gestor'::public.app_role])
  )) AND public.pode_ver(codigo_ibge_residencia)
)
WITH CHECK (
  ((auth.uid() = user_id) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['admin'::public.app_role, 'gestor'::public.app_role])
  )) AND public.pode_ver(codigo_ibge_residencia)
)

-- DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
  ) AND public.pode_ver(codigo_ibge_residencia)
)

-- INSERT: nenhuma alteração
```

Após confirmação e resolução dos bloqueios, aplicar exclusivamente a migração autorizada e testar acesso municipal/regional/estadual, usuário sem território, Administrador, edição para outro território, exclusão e preservação do INSERT. Não alterar telas ou dependências.