# Gráfico de Distribuição por Regional e Macroregional

## Implementação
- Adicionar somente ao painel de Análise Epidemiológica um gráfico de rosca chamado **“Distribuição por Regional e Macroregional”**.
- Alimentar o gráfico com o mesmo conjunto de casos já processado pelos filtros atuais da tela, sem nova consulta, tabela ou endpoint.
- Agrupar cada caso pela combinação `Regional / Macroregional` e contar a quantidade por área.
- Usar os campos regionais já presentes na ficha; quando estiverem ausentes, aproveitar o mapeamento territorial existente a partir do município de residência.
- Quando algum dos dois valores continuar vazio, exibir **“Não informado”** nessa parte da combinação.
- Mostrar o total de casos filtrados no centro da rosca.
- Exibir legenda responsiva com `Regional / Macroregional — quantidade`, além do tooltip e dos controles de exportação já usados no painel.
- Manter os demais gráficos, filtros e funcionalidades inalterados e não instalar dependências.

## Validação
- Conferir que a soma das fatias e da legenda corresponde ao total central e ao conjunto filtrado.
- Verificar o estado sem dados e a renderização em larguras grande e pequena.
- Confirmar a compilação do projeto.

## Detalhes técnicos
- Alteração concentrada em `src/routes/_authenticated/painel.tsx`, reutilizando Recharts, `PIE_COLORS`, `ChartExportButtons`, `CustomTooltip` e `getRegionalAndMacro` já existentes.
- Nenhuma alteração no banco ou nas consultas atuais.
