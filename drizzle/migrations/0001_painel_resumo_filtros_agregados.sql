CREATE FUNCTION public.painel_resumo(p_agravo text, p_inicio date, p_fim date, p_municipio text, p_filtros jsonb)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $function$
WITH origem AS (
SELECT to_jsonb(t) r FROM public.coqueluche_cases t WHERE p_agravo='coqueluche'
UNION ALL SELECT to_jsonb(t) FROM public.dengue_chikungunya_cases t WHERE p_agravo='dengue'
UNION ALL SELECT to_jsonb(t) FROM public.difteria_cases t WHERE p_agravo='difteria'
UNION ALL SELECT to_jsonb(t) FROM public.epizootia_cases t WHERE p_agravo='epizootia'
UNION ALL SELECT to_jsonb(t) FROM public.exantematica_cases t WHERE p_agravo='sarampo'
UNION ALL SELECT to_jsonb(t) FROM public.febre_amarela_cases t WHERE p_agravo='febre_amarela'
UNION ALL SELECT to_jsonb(t) FROM public.hanseniase_cases t WHERE p_agravo='hanseniase'
UNION ALL SELECT to_jsonb(t) FROM public.meningite_cases t WHERE p_agravo='meningite'
UNION ALL SELECT to_jsonb(t) FROM public.raiva_humana_cases t WHERE p_agravo='raiva_humana'
UNION ALL SELECT to_jsonb(t) FROM public.srag_cases t WHERE p_agravo='srag_influenza'
UNION ALL SELECT to_jsonb(t) FROM public.surto_dta_cases t WHERE p_agravo='surto_dta'
UNION ALL SELECT to_jsonb(t) FROM public.tetano_acidental_cases t WHERE p_agravo='tetano_acidental'
UNION ALL SELECT to_jsonb(t) FROM public.tetano_neonatal_cases t WHERE p_agravo='tetano_neonatal'
UNION ALL SELECT to_jsonb(t) FROM public.tuberculose_cases t WHERE p_agravo='tuberculose'
), normalizados AS (
SELECT r,coalesce(r->>'data_notificacao',r->>'data_preenchimento')::date AS data,
coalesce(r->>'classificacao_caso',r->>'classificacao_final',r->>'classificacao') AS classificacao,
lower(coalesce(r->>'evolucao_caso',r->>'evolucao','')) AS evolucao,
coalesce(nullif(btrim(r->>'municipio_notificacao'),''),'Desconhecido') AS municipio,
CASE WHEN nullif(r->>'data_nascimento','') IS NOT NULL AND coalesce(r->>'data_notificacao',r->>'data_preenchimento') IS NOT NULL THEN extract(year FROM age(coalesce(r->>'data_notificacao',r->>'data_preenchimento')::date,(r->>'data_nascimento')::date)) ELSE CASE lower(coalesce(r->>'tipo_idade','ano')) WHEN 'hora' THEN (r->>'idade')::numeric/8766 WHEN 'dia' THEN (r->>'idade')::numeric/365.25 WHEN 'mes' THEN (r->>'idade')::numeric/12 ELSE (r->>'idade')::numeric END END AS idade_anos FROM origem
), base AS (
SELECT *, (floor((extract(doy FROM (data+(6-extract(dow FROM data)::integer)))-1)/7)+1)::integer AS se,
lower(coalesce(classificacao,'')) IN ('confirmado','dengue','dengue_sinais_alarme','dengue_grave','chikungunya','srag_influenza','srag_outros_virus_respiratorios','srag_outros_agentes') AS confirmado,
(translate(evolucao,'ó','o') LIKE '%obito%' OR nullif(r->>'data_obito','') IS NOT NULL) AS obito,
CASE WHEN idade_anos IS NULL OR idade_anos<0 THEN NULL WHEN idade_anos<1 THEN '< 1 ano' WHEN idade_anos<=10 THEN '1 a 10 anos' WHEN idade_anos<=20 THEN '11 a 20 anos' WHEN idade_anos<=30 THEN '21 a 30 anos' WHEN idade_anos<=40 THEN '31 a 40 anos' WHEN idade_anos<=50 THEN '41 a 50 anos' WHEN idade_anos<=60 THEN '51 a 60 anos' WHEN idade_anos<=70 THEN '61 a 70 anos' ELSE 'Acima de 70 anos' END AS faixa FROM normalizados
), filtrados AS MATERIALIZED (
SELECT * FROM base WHERE (p_inicio IS NULL OR data>=p_inicio) AND (p_fim IS NULL OR data<=p_fim)
AND (p_municipio IS NULL OR municipio=p_municipio)
AND (p_filtros->>'sexo' IS NULL OR (p_filtros->>'sexo'='M' AND lower(r->>'sexo') IN ('m','masculino')) OR (p_filtros->>'sexo'='F' AND lower(r->>'sexo') IN ('f','feminino')))
AND (p_filtros->>'faixa_etaria' IS NULL OR faixa=p_filtros->>'faixa_etaria')
AND (p_filtros->>'status' IS NULL OR r->>'status'=p_filtros->>'status')
AND (p_filtros->>'se_inicio' IS NULL OR se>=(p_filtros->>'se_inicio')::integer)
AND (p_filtros->>'se_fim' IS NULL OR se<=(p_filtros->>'se_fim')::integer)
AND (p_filtros->>'evolucao' IS NULL OR (p_filtros->>'evolucao'='alta' AND (evolucao LIKE '%alta%' OR evolucao IN ('cura','alta_cura'))) OR (p_filtros->>'evolucao'='obito' AND obito) OR (p_filtros->>'evolucao'='internado' AND evolucao LIKE '%internado%') OR (p_filtros->>'evolucao'='em_investigacao' AND (evolucao='' OR evolucao LIKE '%investigacao%')))
), totais AS (
SELECT count(*) AS notificados,count(*) FILTER(WHERE confirmado) AS confirmados,count(*) FILTER(WHERE confirmado AND obito) AS obitos_confirmados,count(*) FILTER(WHERE obito) AS obitos,count(*) FILTER(WHERE r->>'status'='em_investigacao') AS em_aberto,count(*) FILTER(WHERE r->>'status'='encerrado') AS encerrados,
coalesce(round(100.0*count(*) FILTER(WHERE confirmado AND obito)/nullif(count(*) FILTER(WHERE confirmado),0),1),0) AS letalidade,
coalesce(round(avg((r->>'data_investigacao')::date-data) FILTER(WHERE nullif(r->>'data_investigacao','') IS NOT NULL AND (r->>'data_investigacao')::date>=data),1),4.5) AS media_investigacao FROM filtrados
), qualidade AS (
SELECT coalesce(round(100.0*count(*) FILTER(WHERE r->>campo IS NOT NULL AND btrim(r->>campo)<>'' AND lower(r->>campo)<>'ignorado')/nullif(count(*),0)),100) AS score FROM filtrados CROSS JOIN unnest(ARRAY['sexo','idade','raca_cor','uf_residencia','municipio_residencia','logradouro','bairro','data_nascimento','semana_epidemiologica']) AS campo
), diario AS (
SELECT data,municipio,count(*) AS notificados,count(*) FILTER(WHERE confirmado) AS confirmados FROM filtrados WHERE data IS NOT NULL GROUP BY data,municipio
), semanas AS (
SELECT se,count(*) AS notificados,count(*) FILTER(WHERE confirmado) AS confirmados FROM filtrados WHERE se IS NOT NULL GROUP BY se
), meses AS (
SELECT to_char(data,'YYYY-MM') AS mes,count(*) AS notificados,count(*) FILTER(WHERE confirmado) AS confirmados FROM filtrados WHERE data IS NOT NULL GROUP BY 1
), municipios AS (
SELECT municipio,count(*) AS notificados,count(*) FILTER(WHERE confirmado) AS confirmados,count(*) FILTER(WHERE r->>'status'='em_investigacao') AS investigacao,count(*) FILTER(WHERE confirmado AND obito) AS obitos FROM filtrados GROUP BY municipio
), categorias AS (
SELECT d.tipo,d.valor,count(*) AS quantidade FROM filtrados f CROSS JOIN LATERAL (VALUES ('sexo',CASE WHEN lower(r->>'sexo') IN ('m','masculino') THEN 'Masculino' WHEN lower(r->>'sexo') IN ('f','feminino') THEN 'Feminino' ELSE 'Ignorado' END),('faixa_etaria',coalesce(faixa,'Não informado')),('raca_cor',coalesce(nullif(r->>'raca_cor',''),'ignorado'))) d(tipo,valor) WHERE confirmado GROUP BY 1,2
), criterios AS (
SELECT CASE WHEN r->>'status' IN ('em_investigacao','EM INVESTIGAÇÃO') THEN 'EM INVESTIGAÇÃO' WHEN lower(coalesce(r->>'criterio_confirmacao','')) LIKE '%bacterio%' THEN 'BACTERIOSCOPIA' WHEN lower(coalesce(r->>'criterio_confirmacao','')) LIKE '%clinico%' OR lower(coalesce(r->>'criterio_confirmacao','')) LIKE '%epidemio%' THEN 'CLINICO' WHEN lower(btrim(r->>'criterio_confirmacao'))='cultura' THEN 'CULTURA' WHEN lower(coalesce(r->>'criterio_confirmacao','')) LIKE '%viral%' THEN 'ISOLAMENTO VIRAL' WHEN lower(coalesce(r->>'criterio_confirmacao','')) LIKE '%necro%' THEN 'NECROPSIA' WHEN lower(btrim(r->>'criterio_confirmacao'))='pcr' THEN 'PCR' WHEN lower(coalesce(r->>'criterio_confirmacao','')) LIKE '%quimio%' OR lower(coalesce(r->>'criterio_confirmacao','')) LIKE '%liquor%' THEN 'QUIMIOCITOLOGICO' ELSE 'OUTROS' END AS valor,count(*) AS quantidade FROM filtrados WHERE lower(coalesce(r->>'classificacao_caso',''))<>'descartado' GROUP BY 1
), regionais AS (
SELECT r->>'municipio_residencia' AS municipio,r->>'regional' AS regional,coalesce(r->>'macroregiao',r->>'macroregional') AS macroregiao,count(*) AS quantidade FROM filtrados GROUP BY 1,2,3
), respostas AS (
SELECT coalesce(nullif(nullif(btrim(r->>'regional'),''),'-'),'Não informado') AS regional,avg((r->>'data_encerramento')::date-data) AS "averageDays",count(*) AS count FROM filtrados WHERE data IS NOT NULL AND nullif(r->>'data_encerramento','') IS NOT NULL AND (r->>'data_encerramento')::date>=data GROUP BY 1
)
SELECT jsonb_build_object('totais',(SELECT to_jsonb(t) FROM totais t),'qualidade',(SELECT score FROM qualidade),
'serie_semanal',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY se) FROM semanas t),'[]'::jsonb),
'serie_mensal',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY mes) FROM meses t),'[]'::jsonb),
'serie_diaria',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY data,municipio) FROM diario t),'[]'::jsonb),
'ranking_municipios',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY confirmados DESC,municipio) FROM municipios t),'[]'::jsonb),
'municipios_opcoes',coalesce((SELECT jsonb_agg(municipio ORDER BY municipio) FROM (SELECT DISTINCT municipio FROM base WHERE municipio<>'Desconhecido') t),'[]'::jsonb),
'distribuicoes',jsonb_build_object('sexo',coalesce((SELECT jsonb_agg(jsonb_build_object('valor',valor,'quantidade',quantidade)) FROM categorias WHERE tipo='sexo'),'[]'::jsonb),'faixa_etaria',coalesce((SELECT jsonb_agg(jsonb_build_object('valor',valor,'quantidade',quantidade)) FROM categorias WHERE tipo='faixa_etaria'),'[]'::jsonb),'raca_cor',coalesce((SELECT jsonb_agg(jsonb_build_object('valor',valor,'quantidade',quantidade)) FROM categorias WHERE tipo='raca_cor'),'[]'::jsonb),'criterio',coalesce((SELECT jsonb_agg(to_jsonb(t)) FROM criterios t),'[]'::jsonb)),
'regionais',coalesce((SELECT jsonb_agg(to_jsonb(t)) FROM regionais t),'[]'::jsonb),
 'tempos_regionais',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY "averageDays",regional) FROM respostas t),'[]'::jsonb),
'datas_invertidas',(SELECT count(*) FROM filtrados WHERE data IS NOT NULL AND nullif(r->>'data_encerramento','') IS NOT NULL AND (r->>'data_encerramento')::date<data));
$function$;
REVOKE ALL ON FUNCTION public.painel_resumo(text,date,date,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.painel_resumo(text,date,date,text,jsonb) TO authenticated,service_role;
COMMENT ON FUNCTION public.painel_resumo(text,date,date,text,jsonb) IS 'Resumo exclusivo do painel por grupo de tabela, com município de notificação, SE, sexo, faixa etária na notificação, evolução e status. Preserva RLS e assinatura original de quatro argumentos. Retorna apenas agregados, nunca dados nominais.';