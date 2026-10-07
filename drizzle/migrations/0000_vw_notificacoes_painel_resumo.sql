CREATE VIEW public.vw_notificacoes WITH (security_invoker = true) AS
WITH casos AS (
  -- Campos sem equivalente na origem permanecem NULL; não inferir residência a partir da ocorrência.
  SELECT id, agravo, numero_ficha AS numero_notificacao, data_notificacao, data_primeiros_sintomas, codigo_ibge_residencia AS municipio_residencia_codigo_ibge, municipio_residencia, NULL::text AS regional, NULL::text AS macrorregiao, sexo, NULL::text AS faixa_etaria, raca_cor, classificacao_final AS classificacao, criterio_confirmacao AS criterio, evolucao, status, created_at, idade, tipo_idade FROM public.coqueluche_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, data_primeiros_sintomas, NULL::text, municipio_residencia, NULL::text, NULL::text, sexo, NULL::text, raca_cor, classificacao, criterio_confirmacao, evolucao, status, created_at, idade, tipo_idade FROM public.dengue_chikungunya_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, data_primeiros_sintomas, codigo_ibge_residencia, municipio_residencia, NULL::text, NULL::text, sexo, NULL::text, raca_cor, classificacao_final, criterio_confirmacao, evolucao, status, created_at, idade, tipo_idade FROM public.difteria_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, NULL::date, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, status, created_at, NULL::numeric, NULL::text FROM public.epizootia_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, data_primeiros_sintomas, NULL::text, municipio_residencia, NULL::text, NULL::text, sexo, NULL::text, raca_cor, classificacao_final, criterio_confirmacao, evolucao, status, created_at, idade, tipo_idade FROM public.exantematica_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, data_primeiros_sintomas, NULL::text, municipio_residencia, NULL::text, NULL::text, sexo, NULL::text, raca_cor, classificacao_final, criterio_confirmacao, evolucao, status, created_at, idade, tipo_idade FROM public.febre_amarela_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, dc_data_primeiros_sintomas, NULL::text, municipio_residencia, NULL::text, NULL::text, sexo, NULL::text, raca_cor, classificacao_operacional, NULL::text, dc_evolucao_clinica, status, created_at, idade, tipo_idade FROM public.hanseniase_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, data_primeiros_sintomas, codigo_ibge_residencia, municipio_residencia, regional, macroregiao, sexo, faixa_etaria, raca_cor, classificacao_caso, criterio_confirmacao, evolucao_caso, status, created_at, idade, tipo_idade FROM public.meningite_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, data_primeiros_sintomas, NULL::text, municipio_residencia, NULL::text, NULL::text, sexo, NULL::text, raca_cor, classificacao_final, criterio_confirmacao, evolucao, status, created_at, idade, tipo_idade FROM public.raiva_humana_cases
  UNION ALL
  -- SRAG utiliza data_preenchimento como data de registro/notificação.
  SELECT id, agravo, numero_ficha, data_preenchimento, data_primeiros_sintomas, NULL::text, municipio_residencia, NULL::text, NULL::text, sexo, NULL::text, raca_cor, classificacao_final, criterio_confirmacao, evolucao, status, created_at, idade, tipo_idade FROM public.srag_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, data_1os_sintomas_1o_caso, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, criterio_confirmacao, NULL::text, status, created_at, NULL::numeric, NULL::text FROM public.surto_dta_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, data_primeiros_sintomas, NULL::text, municipio_residencia, NULL::text, NULL::text, sexo, NULL::text, raca_cor, classificacao_final, NULL::text, evolucao, status, created_at, idade, tipo_idade FROM public.tetano_acidental_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, data_primeiros_sintomas, NULL::text, municipio_residencia, NULL::text, NULL::text, sexo, NULL::text, raca_cor, classificacao_final, NULL::text, evolucao, status, created_at, idade, tipo_idade FROM public.tetano_neonatal_cases
  UNION ALL
  SELECT id, agravo, numero_ficha, data_notificacao, dc_data_primeiros_sintomas, NULL::text, municipio_residencia, NULL::text, NULL::text, sexo, NULL::text, raca_cor, NULL::text, NULL::text, dc_evolucao_clinica, status, created_at, idade, tipo_idade FROM public.tuberculose_cases
), idades AS (
  SELECT casos.*, CASE
    WHEN idade < 0 THEN NULL
    WHEN lower(btrim(tipo_idade)) IN ('hora', 'horas') THEN idade / 8766
    WHEN lower(btrim(tipo_idade)) IN ('dia', 'dias') THEN idade / 365.25
    WHEN lower(btrim(tipo_idade)) IN ('mes', 'meses', 'mês') THEN idade / 12
    WHEN tipo_idade IS NULL OR btrim(tipo_idade) = '' OR lower(btrim(tipo_idade)) IN ('ano', 'anos') THEN idade
    ELSE NULL
  END AS idade_anos FROM casos
)
SELECT id, agravo, numero_notificacao, data_notificacao, data_primeiros_sintomas,
  -- SE brasileira: domingo a sábado, semana 1 contém o primeiro sábado do ano.
  CASE WHEN data_notificacao IS NOT NULL THEN
    (floor((extract(doy FROM (data_notificacao + (6 - extract(dow FROM data_notificacao)::integer))) - 1) / 7) + 1)::integer
  END AS semana_epidemiologica,
  municipio_residencia_codigo_ibge, municipio_residencia, regional, macrorregiao, sexo,
  coalesce(nullif(nullif(btrim(faixa_etaria), ''), '-'), CASE
    WHEN idade_anos IS NULL THEN NULL
    WHEN idade_anos < 1 THEN '< 1 ano'
    WHEN idade_anos <= 10 THEN '1 a 10 anos'
    WHEN idade_anos <= 20 THEN '11 a 20 anos'
    WHEN idade_anos <= 30 THEN '21 a 30 anos'
    WHEN idade_anos <= 40 THEN '31 a 40 anos'
    WHEN idade_anos <= 50 THEN '41 a 50 anos'
    WHEN idade_anos <= 60 THEN '51 a 60 anos'
    WHEN idade_anos <= 70 THEN '61 a 70 anos'
    ELSE 'Acima de 70 anos'
  END) AS faixa_etaria,
  raca_cor, classificacao, criterio, evolucao, status, created_at
FROM idades;
GRANT SELECT ON public.vw_notificacoes TO authenticated, service_role;
REVOKE ALL ON public.vw_notificacoes FROM PUBLIC, anon;
COMMENT ON VIEW public.vw_notificacoes IS 'União das 14 tabelas de agravos, sem identificação pessoal. SECURITY INVOKER preserva RLS. Campos sem equivalente são NULL. SE derivada da notificação; faixa etária usa o valor existente ou idade/unidade. SRAG: data_preenchimento corresponde ao registro. Surto DTA e epizootia não têm município de residência.';

CREATE FUNCTION public.painel_resumo(p_agravo text DEFAULT NULL, p_inicio date DEFAULT NULL, p_fim date DEFAULT NULL, p_municipio text DEFAULT NULL)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
WITH filtrados AS MATERIALIZED (
  SELECT v.*,
    lower(btrim(coalesce(v.classificacao, ''))) IN (
      'confirmado', 'dengue', 'dengue_sinais_alarme', 'dengue_grave', 'chikungunya',
      'srag_influenza', 'srag_outros_virus_respiratorios', 'srag_outros_agentes'
    ) AS confirmado,
    translate(lower(coalesce(v.evolucao, '')), 'ó', 'o') LIKE '%obito%' AS obito,
    lower(btrim(coalesce(v.status, ''))) IN ('em_investigacao', 'em_aberto', 'aberto') AS em_aberto
  FROM public.vw_notificacoes v
  WHERE (nullif(btrim(p_agravo), '') IS NULL OR lower(btrim(v.agravo)) = lower(btrim(p_agravo)))
    AND (p_inicio IS NULL OR v.data_notificacao >= p_inicio)
    AND (p_fim IS NULL OR v.data_notificacao <= p_fim)
    AND (nullif(btrim(p_municipio), '') IS NULL
      OR lower(btrim(v.municipio_residencia)) = lower(btrim(p_municipio))
      OR btrim(v.municipio_residencia_codigo_ibge) = btrim(p_municipio))
), totais AS (
  SELECT count(*) AS notificados, count(*) FILTER (WHERE confirmado) AS confirmados,
    count(*) FILTER (WHERE obito) AS obitos, count(*) FILTER (WHERE em_aberto) AS em_aberto,
    coalesce(round(100.0 * count(*) FILTER (WHERE confirmado AND obito)
      / nullif(count(*) FILTER (WHERE confirmado), 0), 2), 0) AS letalidade
  FROM filtrados
), semanas AS (
  SELECT extract(year FROM (data_notificacao + (6 - extract(dow FROM data_notificacao)::integer)))::integer AS ano,
    semana_epidemiologica, count(*) AS notificados,
    count(*) FILTER (WHERE confirmado) AS confirmados,
    count(*) FILTER (WHERE obito) AS obitos,
    count(*) FILTER (WHERE em_aberto) AS em_aberto
  FROM filtrados WHERE data_notificacao IS NOT NULL
  GROUP BY 1, 2
), municipios AS (
  SELECT nullif(nullif(btrim(municipio_residencia_codigo_ibge), ''), '-') AS codigo_ibge,
    coalesce(nullif(nullif(btrim(municipio_residencia), ''), '-'), 'Não informado') AS municipio,
    count(*) AS notificados, count(*) FILTER (WHERE confirmado) AS confirmados,
    count(*) FILTER (WHERE obito) AS obitos,
    count(*) FILTER (WHERE em_aberto) AS em_aberto
  FROM filtrados GROUP BY 1, 2
), categorias AS (
  SELECT d.distribuicao, coalesce(nullif(nullif(btrim(d.valor), ''), '-'), 'Não informado') AS valor, count(*) AS quantidade
  FROM filtrados f
  CROSS JOIN LATERAL (VALUES
    ('sexo', f.sexo), ('faixa_etaria', f.faixa_etaria), ('raca_cor', f.raca_cor),
    ('criterio', f.criterio), ('evolucao', f.evolucao)
  ) AS d(distribuicao, valor)
  GROUP BY 1, 2
)
SELECT jsonb_build_object(
  'totais', (SELECT to_jsonb(t) FROM totais t),
  'serie_semanal', coalesce((SELECT jsonb_agg(to_jsonb(s) ORDER BY ano, semana_epidemiologica) FROM semanas s), '[]'::jsonb),
  'ranking_municipios', coalesce((SELECT jsonb_agg(to_jsonb(m) ORDER BY notificados DESC, municipio, codigo_ibge) FROM municipios m), '[]'::jsonb),
  'distribuicoes', jsonb_build_object(
    'sexo', coalesce((SELECT jsonb_agg(jsonb_build_object('valor', valor, 'quantidade', quantidade) ORDER BY quantidade DESC, valor) FROM categorias WHERE distribuicao = 'sexo'), '[]'::jsonb),
    'faixa_etaria', coalesce((SELECT jsonb_agg(jsonb_build_object('valor', valor, 'quantidade', quantidade) ORDER BY quantidade DESC, valor) FROM categorias WHERE distribuicao = 'faixa_etaria'), '[]'::jsonb),
    'raca_cor', coalesce((SELECT jsonb_agg(jsonb_build_object('valor', valor, 'quantidade', quantidade) ORDER BY quantidade DESC, valor) FROM categorias WHERE distribuicao = 'raca_cor'), '[]'::jsonb),
    'criterio', coalesce((SELECT jsonb_agg(jsonb_build_object('valor', valor, 'quantidade', quantidade) ORDER BY quantidade DESC, valor) FROM categorias WHERE distribuicao = 'criterio'), '[]'::jsonb),
    'evolucao', coalesce((SELECT jsonb_agg(jsonb_build_object('valor', valor, 'quantidade', quantidade) ORDER BY quantidade DESC, valor) FROM categorias WHERE distribuicao = 'evolucao'), '[]'::jsonb)
  )
);
$function$;
REVOKE ALL ON FUNCTION public.painel_resumo(text, date, date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.painel_resumo(text, date, date, text) TO authenticated, service_role;
COMMENT ON FUNCTION public.painel_resumo(text, date, date, text) IS 'Resumo em JSON sob RLS do chamador. Filtros opcionais; datas inclusivas da notificação; município por nome ou IBGE. Notificados/óbitos contam fichas (não indivíduos de surtos). Óbito identificado na evolução; letalidade (%) = óbitos entre confirmados / confirmados. Não infere confirmação de modo de entrada, classificação operacional ou encerramento; campos ausentes não permitem inferir desfechos. Série separa ano epidemiológico e semana. Semanas sem data não entram na série. Sem registros retorna totais zero e listas vazias.';