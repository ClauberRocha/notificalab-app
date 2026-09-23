# Aviso de datas inconsistentes no painel de Meningite

## Implementação
- Ajustar somente o cálculo existente dos indicadores de tempo de resposta para também contar, entre os casos filtrados, os registros em que `data_encerramento` é anterior a `data_notificacao`.
- Manter esses registros excluídos das médias, como já ocorre atualmente.
- Exibir um aviso visual em tom de atenção junto aos dois indicadores, somente quando houver pelo menos um caso inconsistente.
- Informar no aviso a quantidade de casos desconsiderados, com singular/plural adequado, e explicar que eles não entram no cálculo para evitar distorções.
- Fazer o aviso respeitar os filtros atuais e aparecer somente quando o agravo selecionado for Meningite.
- Reutilizar os componentes, ícone e tokens visuais já existentes, sem instalar dependências e sem alterar banco ou consultas.

## Validação
- Confirmar que a inconsistência é identificada exclusivamente por `data_encerramento < data_notificacao`.
- Confirmar que os registros inconsistentes continuam fora das médias.
- Confirmar que o aviso atualiza com os filtros e desaparece quando a seleção não contém datas invertidas.
- Confirmar que os indicadores existentes e o restante do painel permanecem inalterados e que o projeto compila normalmente.

## Limite técnico
- Mudança concentrada em `src/routes/_authenticated/painel.tsx`, usando o conjunto `filtered` já carregado.
