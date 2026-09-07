# Importar planilha em todos os agravos

Hoje o botão "Importar planilha" só aparece em dois lugares: nas listas de Dengue e Chikungunya (que usam a tela compartilhada de agravo) e na lista de Meningite, que tem um importador próprio e mais antigo. Todos os outros agravos (Tuberculose, Coqueluche, Difteria, Difteria, Febre Amarela, Hanseníase, Raiva Humana, SRAG, Surto DTA, Tétano Acidental, Tétano Neonatal, Sarampo, Rubéola, Outras Meningites, Epizootia) têm a própria tela de lista, sem o botão.

## O que será feito

1. Transformar o importador atual em um importador único, que funciona para qualquer agravo: escolher o arquivo, conferir o mapeamento das colunas, ver a prévia das 10 primeiras linhas com erros por linha e campo, e confirmar a importação em lote.
2. Ligar esse botão em todas as listas de agravo, ao lado de "Nova ficha", respeitando a mesma permissão de cadastro já existente (quem não pode cadastrar não vê o botão).
3. Manter a lista atualizando sozinha depois da importação, sem recarregar a página.
4. Substituir o importador antigo de Meningite pelo novo, para o comportamento ficar igual em todas as fichas.
5. Nada de mudança no banco, nos formulários manuais ou no visual das telas.

## Detalhes técnicos

- Generalizar `src/components/dengue-chik-importer.tsx` para `src/components/case-importer.tsx`, recebendo `table`, `fields`, `extra` (ex.: `{ agravo }`) e `onImported`.
- Generalizar `src/lib/dengue-chik-import.ts` para `src/lib/case-import.ts`, mantendo `normalizeKey`, `guessField`, `toIsoDate` (inclui serial do Excel), `matchOption` e `buildRows`.
- Novo registro `src/lib/case-import-registry.ts`: para cada agravo, tabela de destino e lista de campos importáveis derivada das colunas reais de `src/integrations/supabase/types.ts` (excluindo `id`, `created_at`, `updated_at`, `user_id`, `agravo`), com rótulos legíveis, tipo inferido (texto/data/número) e opções reaproveitadas dos módulos `src/lib/<agravo>-options.ts` quando existir uma lista correspondente ao campo. Obrigatórios: `nome_paciente` e `data_notificacao`.
- Cada rota de lista (`src/routes/_authenticated/fichas.*.index.tsx`), mais `agravo-list-page.tsx`, `meningite-list-page.tsx` e `exantematica-list-page.tsx`, passa a renderizar `<CaseImporter …>` ao lado de "Nova ficha".
- Inserção em lotes de 200 com `user_id` do usuário logado; linhas com `numero_ficha` já existente no banco são ignoradas.
- Validação: obrigatórios, datas inválidas, valores fora das opções conhecidas e duplicidade de `numero_ficha` na própria planilha.
