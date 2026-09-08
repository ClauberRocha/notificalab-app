# Fazer o botão "Importar planilha" aparecer

## O que encontrei

O botão já está programado em todas as telas de lista de agravos e a compilação está sem erros. Ele só não aparece porque está condicionado à permissão de **cadastrar fichas**, enquanto o botão "Nova ficha" ao lado dele aparece sem essa condição. Resultado: em perfis que não têm "cadastrar" (o perfil Gestor teve essa permissão removida a pedido anterior), aparece só "Nova ficha".

Ainda não confirmei qual perfil está ligado no seu acesso — a pré-visualização aberta agora está na tela de login. A correção abaixo resolve nos dois casos.

## Correção (sem mudar nada além disso)

1. Usar a mesma condição para os dois botões em cada tela de lista: onde "Nova ficha" aparece, "Importar planilha" também aparece.
2. Aplicar isso nas telas: Tuberculose, Coqueluche, Difteria, Febre Amarela, Hanseníase, Raiva Humana, SRAG, Surto DTA, Tétano Acidental, Tétano Neonatal, Epizootia, Sarampo, Rubéola, Meningite/Outras meningites, Dengue e Chikungunya.
3. Conferir o perfil da sua conta e, se for o caso, confirmar com você se o perfil Gestor deve ou não poder importar.
4. Conferir a compilação e abrir uma das listas para ver os dois botões lado a lado.

Nenhuma alteração no banco, no cadastro manual ou no importador em si.

## Detalhe técnico

Nas telas de lista, trocar a condição `canCreate && <CaseImporter .../>` pela mesma condição usada no botão "Nova ficha" (hoje sem gate em vários arquivos), mantendo o componente e as props atuais. As gravações continuam protegidas pelas regras de acesso do banco.

## Como testar

Abrir Fichas → qualquer agravo: "Nova ficha" e "Importar planilha" devem aparecer juntos no topo da lista.
