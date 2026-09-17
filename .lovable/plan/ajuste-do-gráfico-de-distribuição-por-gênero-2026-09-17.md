# Ajuste do gráfico de Distribuição por Gênero

## Alteração
- Engrossar discretamente a rosca, reduzindo apenas o raio interno e preservando o tamanho externo do gráfico.
- Substituir o rótulo atual por duas linhas:
  - gênero e percentual na primeira linha;
  - quantidade de casos na segunda linha, com singular/plural adequado.
- Manter cores, filtros, tooltip, legenda, exportação e demais gráficos inalterados.

## Validação
- Conferir o gráfico com diferentes quantidades por gênero.
- Verificar legibilidade e ausência de cortes em telas grandes e pequenas.
- Confirmar a compilação do projeto.

## Detalhes técnicos
- Alteração restrita ao gráfico `Distribuição por Gênero` em `src/routes/_authenticated/painel.tsx`.
- Usar um rótulo personalizado do Recharts para posicionar percentual e total em linhas separadas.
