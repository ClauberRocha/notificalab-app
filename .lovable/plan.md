# Botão "Importar" sempre visível na ficha de Meningite

## O que muda

1. Na tela de lista de Meningite (e Outras Meningites), o botão "Importar planilha" passa a aparecer para **todos** os usuários, sem depender de permissão.
2. O botão fica no topo da lista, ao lado de "Nova ficha" quando este existir.
3. A janela de importação continua a mesma: escolher um arquivo `.xlsx` (também `.xls` e `.csv`) de qualquer pasta do computador, conferir o mapeamento das colunas, ver a prévia com as linhas válidas e as com erro, e confirmar.
4. Depois de importar, a lista se atualiza sozinha.

Nada muda no banco, no cadastro manual, no importador em si ou nas outras fichas.

## Detalhe técnico

Em `src/components/meningite-list-page.tsx`: remover a condição `canImport` da renderização do importador (linha 105), mantendo o componente e as props atuais. A constante `canImport` sai se não for mais usada; `canCreate` continua controlando "Nova ficha". Gravações seguem protegidas pelas regras de acesso do banco.

## Como testar

Fichas → Meningite (ou Outras Meningites): o botão "Importar planilha" aparece no topo com qualquer login. Selecione um `.xlsx`, confira o mapeamento e confirme.
