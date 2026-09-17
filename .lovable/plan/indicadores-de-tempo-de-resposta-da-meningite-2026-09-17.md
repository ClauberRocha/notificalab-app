# Indicadores de Tempo de Resposta da Meningite

## Implementação
- Alterar somente o painel existente para calcular, em memória, o tempo entre `data_notificacao` e `data_encerramento` dos casos de Meningite já carregados e filtrados.
- Considerar registros com ambas as datas válidas e excluir intervalos negativos.
- Agrupar por `regional`, convertendo valor vazio, somente espaços ou `-` em **“Não informado”**.
- Calcular a média em dias e a quantidade de casos válidos por Regional; selecionar automaticamente a menor e a maior média.
- Exibir os dois indicadores somente quando o agravo selecionado for Meningite:
  - card verde **“Resposta mais rápida”**;
  - card vermelho **“Maior tempo de resposta”**.
- Cada card mostrará Regional, média com duas casas decimais em formato brasileiro e quantidade de casos.
- Se os filtros não deixarem casos válidos, mostrar um estado sem dados nos dois cards.
- Reutilizar os componentes e tokens visuais existentes, sem alterar o gráfico de Regional/Macroregional ou outras funcionalidades.

## Validação
- Confirmar no código que o cálculo usa exclusivamente `data_notificacao` e `data_encerramento` e descarta encerramentos anteriores à notificação.
- Conferir, sem filtros adicionais e com Meningite selecionada, os resultados atuais esperados: **Balsas — 8,75 dias — 4 casos** e **Bacabal — 59,00 dias — 7 casos**.
- Alterar os filtros existentes e confirmar que Regional, média e quantidade são recalculadas.
- Confirmar o estado sem dados e a apresentação em larguras grande e pequena.
- Confirmar que o projeto compila normalmente.

## Limites técnicos
- Mudança concentrada em `src/routes/_authenticated/painel.tsx`, reutilizando o conjunto `filtered` já existente.
- Nenhuma consulta nova, dependência, tabela, campo, migração ou gravação no banco.
