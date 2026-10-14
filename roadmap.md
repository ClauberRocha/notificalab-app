# Roadmap

- [x] Tornar system_logs não apagável e remover exclusão na tela de logs.
- [x] Implementar exclusão lógica com motivo nos 14 agravos e omitir excluídos das listas, painel e visão.
- [x] Auditar visualização de fichas e exportações PDF/CSV; validar regras e fluxos.

- [x] Listar políticas atuais e propostas de SELECT/UPDATE/DELETE das 14 tabelas de casos.
- [x] Preparar códigos IBGE e ativar RLS nos 14 agravos conforme confirmação; Epizootia/Surto DTA usam ocorrência, ativação imediata autorizada.
- [x] Validar SELECT/UPDATE/DELETE territoriais e preservação das políticas INSERT, sem alterações no front-end.
- [x] Criar territórios de usuários e função pode_ver.
- [x] Adicionar território aos formulários de criar/editar usuários e validar segurança e gravação; níveis municipal/regional/estadual testados com rollback.

- [x] Gerar e configurar os ícones PWA.
- [x] Injetar manifesto e registrar o service worker com proteção de preview.
- [x] Corrigir gravações restantes para usar a fila offline.
- [x] Validar tipos, build e instalação.
- [x] Engrossar a rosca do gráfico de gênero e mostrar a quantidade de casos sob o percentual.
- [x] Adicionar gráfico de distribuição por Regional e Macroregional com os filtros atuais.
- [x] Criar e validar vw_notificacoes e painel_resumo, preservando RLS e sem alterar o front-end.
- [x] Usar painel_resumo com todos os filtros em /painel, preservando gráficos e abas.
- [x] Carregar CSV nominal somente ao exportar, em páginas de 1000 registros, e validar.
- [x] Renomear Resumo automático e mostrar a última importação registrada no painel.
- [x] Persistir configurações do painel com leitura autenticada e escrita administrativa; validar.
