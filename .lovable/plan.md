# Correções pontuais para instalação PWA

## Implementação
- Gerar, a partir do logo existente, ícones PNG de 192 px, 512 px e 512 px maskable, centralizados com margem segura.
- Atualizar somente a configuração PWA necessária: ícones do manifesto, injeção manual, registro imediato e proteção contra registro no preview/desenvolvimento.
- Adicionar ao documento o manifesto e a cor de tema.
- Preservar integralmente a fila offline existente.
- Trocar apenas gravações de fichas que ainda atualizam diretamente por `updateCase`; manter consultas e demais fluxos intactos.

## Validação
- Conferir os tipos, o registro/manifesto renderizado e o resultado visual dos ícones.
- Verificar o build automático e confirmar que não restaram gravações diretas nos formulários de agravos.

## Detalhes técnicos
- O service worker continuará sendo gerado pelo `vite-plugin-pwa`, mas terá um único registro controlado e não será ativado no preview, iframe ou desenvolvimento.
- A navegação OAuth continuará excluída do cache do aplicativo.
