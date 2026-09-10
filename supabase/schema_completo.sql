-- =====================================================================
-- SCHEMA COMPLETO - NOTIFICA-MA INTELLIGENCE / SINAN
-- Executar no SQL Editor do projeto Supabase (https://ilgikvfxtjdaibygrann.supabase.co)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'gestor', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------
-- TABELA: coqueluche_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coqueluche_cases (
  agravo text NOT NULL,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  bairro text,
  casos_secundarios_confirmados text,
  cep text,
  classificacao_final text,
  codigo_ibge_notificacao text,
  codigo_ibge_residencia text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  coleta_nasofaringe text,
  coleta_nasofaringe_comunicantes text,
  complemento text,
  complicacoes jsonb NOT NULL,
  comunicantes_cultura_positivo numeric,
  contato_caso_suspeito text,
  created_at timestamp with time zone DEFAULT now(),
  criterio_confirmacao text,
  data_adm_antibiotico text,
  data_coleta_material text,
  data_encerramento text,
  data_inicio_tosse text,
  data_internacao text,
  data_investigacao text,
  data_nascimento text,
  data_notificacao text NOT NULL,
  data_obito text,
  data_primeiros_sintomas text,
  data_ultima_dose text,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  distrito text,
  doenca_relacionada_trabalho text,
  doses_vacina_triplice text,
  endereco_contato text,
  escolaridade text,
  evolucao text,
  funcao_investigador text,
  gestante text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  identificacao_comunicantes text,
  logradouro text,
  medidas_prevencao text,
  municipio_hospital text,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  nome_contato text,
  nome_hospital text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  numero_cartao_sus text,
  numero_comunicantes numeric,
  numero_endereco text,
  numero_ficha text,
  observacoes_adicionais text,
  ocorreu_hospitalizacao text,
  ocupacao text,
  pais text,
  ponto_referencia text,
  quantidade_comunicantes_coleta numeric,
  raca_cor text,
  resultado_cultura text,
  sexo text,
  sinais_sintomas jsonb NOT NULL,
  status text NOT NULL,
  telefone text,
  tipo_idade text,
  tipo_notificacao text NOT NULL,
  uf_hospital text,
  uf_notificacao text,
  uf_residencia text,
  unidade_saude text,
  unidade_sentinela text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  utilizou_antibiotico text,
  zona text
);

ALTER TABLE public.coqueluche_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: dengue_chikungunya_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dengue_chikungunya_cases (
  agravo text NOT NULL,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  bairro text,
  caso_autoctone text,
  cep text,
  classificacao text,
  codigo_ibge_notificacao text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  created_at timestamp with time zone DEFAULT now(),
  criterio_confirmacao text,
  data_encerramento text,
  data_internacao text,
  data_investigacao text,
  data_nascimento text,
  data_notificacao text NOT NULL,
  data_obito text,
  data_primeiros_sintomas text,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  dengue_grave text,
  dengue_sinais_alarme text,
  doencas_preexistentes jsonb,
  escolaridade text,
  evolucao text,
  funcao_investigador text,
  gestante text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  logradouro text,
  municipio_hospital text,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  nome_hospital text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  ns1_data text,
  ns1_resultado text,
  numero_cartao_sus text,
  numero_endereco text,
  numero_ficha text,
  observacoes_adicionais text,
  ocorreu_hospitalizacao text,
  ocupacao text,
  raca_cor text,
  rt_pcr_data text,
  rt_pcr_resultado text,
  sexo text,
  sinais_clinicos jsonb,
  sorologia_chikungunya_resultado_s1 text,
  sorologia_chikungunya_resultado_s2 text,
  sorologia_chikungunya_s1_data text,
  sorologia_chikungunya_s2_data text,
  sorologia_dengue_data text,
  sorologia_dengue_resultado text,
  sorotipo text,
  status text NOT NULL,
  telefone text,
  tipo_idade text,
  uf_hospital text,
  uf_notificacao text,
  uf_residencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  zona text
);

ALTER TABLE public.dengue_chikungunya_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: difteria_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.difteria_cases (
  agravo text NOT NULL,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  bairro text,
  casos_secundarios_confirmados text,
  cep text,
  classificacao_final text,
  codigo_hospital text,
  codigo_ibge_notificacao text,
  codigo_ibge_residencia text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  coleta_material_comunicantes text,
  complemento text,
  complicacoes jsonb,
  contato_caso_suspeito text,
  created_at timestamp with time zone DEFAULT now(),
  criterio_confirmacao text,
  data_adm_antibiotico text,
  data_aplicacao_soro text,
  data_coleta text,
  data_encerramento text,
  data_internacao text,
  data_investigacao text,
  data_nascimento text,
  data_notificacao text NOT NULL,
  data_obito text,
  data_primeiros_sintomas text,
  data_ultima_dose text,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  distrito text,
  doenca_relacionada_trabalho text,
  doses_vacina text,
  endereco_contato text,
  escolaridade text,
  evolucao text,
  funcao_investigador text,
  gestante text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  identificacao_comunicantes text,
  localizacao_pseudomembrana jsonb,
  logradouro text,
  material_coletado text,
  medidas_prevencao text,
  municipio_hospital text,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  nome_contato text,
  nome_hospital text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  numero_cartao_sus text,
  numero_comunicantes numeric,
  numero_endereco text,
  numero_ficha text,
  observacoes_adicionais text,
  ocorreu_hospitalizacao text,
  ocupacao text,
  pais text,
  ponto_referencia text,
  portadores_identificados numeric,
  provas_toxigenicidade text,
  quantidade_comunicantes_coleta numeric,
  raca_cor text,
  resultado_cultura text,
  sexo text,
  sinais_sintomas jsonb,
  status text NOT NULL,
  telefone text,
  temperatura_corporal numeric,
  tipo_idade text,
  tipo_notificacao text,
  uf_hospital text,
  uf_notificacao text,
  uf_residencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  utilizou_antibiotico text,
  zona text
);

ALTER TABLE public.difteria_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: email_send_log
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_send_log (
  created_at timestamp with time zone DEFAULT now(),
  error_message text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid,
  metadata jsonb,
  recipient_email text NOT NULL,
  status text NOT NULL,
  template_name text NOT NULL
);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: email_send_state
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_send_state (
  auth_email_ttl_minutes numeric NOT NULL,
  batch_size numeric NOT NULL,
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  retry_after_until text,
  send_delay_ms numeric NOT NULL,
  transactional_email_ttl_minutes numeric NOT NULL,
  updated_at timestamp with time zone NOT NULL
);

ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: email_unsubscribe_tokens
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  created_at timestamp with time zone DEFAULT now(),
  email text NOT NULL,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL,
  used_at timestamp with time zone
);

ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: epizootia_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.epizootia_cases (
  agravo text NOT NULL,
  ambiente text,
  animais_acometidos jsonb,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  bairro text,
  cep text,
  codigo_ibge_notificacao text,
  codigo_ibge_ocorrencia text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  complemento text,
  created_at timestamp with time zone DEFAULT now(),
  data_coleta text,
  data_inicio_epizootia text,
  data_notificacao text NOT NULL,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  distrito text,
  fonte_informacao text,
  funcao_investigador text,
  geocampo1 text,
  geocampo2 text,
  houve_coleta text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logradouro text,
  material_coletado jsonb,
  municipio_notificacao text NOT NULL,
  municipio_ocorrencia text,
  municipio_unidade_investigador text,
  nome_investigador text,
  numero_endereco text,
  numero_ficha text,
  observacoes_adicionais text,
  ponto_referencia text,
  resultado_laboratorial jsonb,
  status text NOT NULL,
  suspeita_diagnostica jsonb,
  telefone text,
  telefone_fonte text,
  tipo_notificacao text,
  uf_notificacao text,
  uf_ocorrencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  zona text
);

ALTER TABLE public.epizootia_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: exantematica_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exantematica_cases (
  agravo text NOT NULL,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  bairro text,
  cep text,
  classificacao_final text,
  codigo_ibge_notificacao text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  complemento text,
  contato_caso_suspeito text,
  created_at timestamp with time zone DEFAULT now(),
  criterio_confirmacao text,
  data_coleta_s1 text,
  data_coleta_s2 text,
  data_encerramento text,
  data_inicio_exantema text,
  data_inicio_febre text,
  data_internacao text,
  data_investigacao text,
  data_nascimento text,
  data_notificacao text NOT NULL,
  data_obito text,
  data_primeiros_sintomas text,
  data_ultima_dose_vacina text,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  endereco_contato text,
  escolaridade text,
  evolucao text,
  funcao_investigador text,
  gestante text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  logradouro text,
  municipio_hospital text,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  nome_contato text,
  nome_hospital text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  numero_cartao_sus text,
  numero_endereco text,
  numero_ficha text,
  observacoes_adicionais text,
  ocorreu_hospitalizacao text,
  ocupacao text,
  raca_cor text,
  realizou_bloqueio_vacinal text,
  resultado_sorologia_rubeola_s1_igg text,
  resultado_sorologia_rubeola_s1_igm text,
  resultado_sorologia_sarampo_s1_igg text,
  resultado_sorologia_sarampo_s1_igm text,
  sexo text,
  sinais_sintomas jsonb,
  status text NOT NULL,
  telefone text,
  tipo_idade text,
  tomou_vacina_sarampo_rubeola text,
  uf_hospital text,
  uf_notificacao text,
  uf_residencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  zona text
);

ALTER TABLE public.exantematica_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: febre_amarela_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.febre_amarela_cases (
  agravo text NOT NULL,
  alt_tgp numeric,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  ast_tgo numeric,
  atividade_local_infeccao text,
  bairro text,
  bilirrubina_direta numeric,
  bilirrubina_total numeric,
  caso_autoctone text,
  cep text,
  classificacao_final text,
  codigo_ibge_notificacao text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  complemento text,
  created_at timestamp with time zone DEFAULT now(),
  criterio_confirmacao text,
  data_coleta_isolamento text,
  data_coleta_s1 text,
  data_coleta_s2 text,
  data_encerramento text,
  data_internacao text,
  data_investigacao text,
  data_nascimento text,
  data_notificacao text NOT NULL,
  data_obito text,
  data_primeiros_sintomas text,
  data_vacinacao text,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  doenca_relacionada_trabalho text,
  escolaridade text,
  evolucao text,
  funcao_investigador text,
  gestante text,
  histopatologia text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  imunohistoquimica text,
  isolamento_virus_mosquitos text,
  logradouro text,
  material_coletado_isolamento text,
  municipio_hospital text,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  municipio_vacinacao text,
  nome_hospital text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  numero_cartao_sus text,
  numero_endereco text,
  numero_ficha text,
  observacoes_adicionais text,
  ocorrencia_epizootias text,
  ocorreu_hospitalizacao text,
  ocupacao text,
  presenca_mosquito_aedes text,
  raca_cor text,
  resultado_isolamento text,
  resultado_s1 text,
  resultado_s2 text,
  rt_pcr_data text,
  rt_pcr_resultado text,
  sexo text,
  sinais_sintomas jsonb,
  status text NOT NULL,
  telefone text,
  tipo_idade text,
  uf_hospital text,
  uf_notificacao text,
  uf_residencia text,
  uf_vacinacao text,
  unidade_saude text,
  unidade_saude_vacinacao text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  vacinado_febre_amarela text,
  zona text
);

ALTER TABLE public.febre_amarela_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: hanseniase_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hanseniase_cases (
  agravo text NOT NULL,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  baciloscopia text,
  bairro text,
  cep text,
  classificacao_operacional text,
  codigo_ibge_notificacao text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  created_at timestamp with time zone DEFAULT now(),
  data_diagnostico text,
  data_inicio_tratamento text,
  data_nascimento text,
  data_notificacao text NOT NULL,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  escolaridade text,
  esquema_terapeutico text,
  forma_clinica text,
  funcao_investigador text,
  gestante text,
  grau_incapacidade_fisica text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  logradouro text,
  modo_deteccao text,
  modo_entrada text,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  numero_cartao_sus text,
  numero_contatos_registrados numeric,
  numero_endereco text,
  numero_ficha text,
  numero_lesoes_cutaneas numeric,
  numero_nervos_afetados numeric,
  numero_prontuario text,
  observacoes_adicionais text,
  ocupacao text,
  raca_cor text,
  sexo text,
  status text NOT NULL,
  telefone text,
  tipo_idade text,
  uf_notificacao text,
  uf_residencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  zona text
);

ALTER TABLE public.hanseniase_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: meningite_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meningite_cases (
  agravo text NOT NULL,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  aspecto_liquor text,
  bairro text,
  caso_secundario text,
  cep text,
  classificacao_caso text,
  codigo_hospital text,
  codigo_ibge_notificacao text,
  codigo_ibge_residencia text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  complemento text,
  contato_caso_suspeito text,
  created_at timestamp with time zone DEFAULT now(),
  criterio_confirmacao text,
  data_encerramento text,
  data_evolucao text,
  data_internacao text,
  data_investigacao text,
  data_nascimento text,
  data_notificacao text NOT NULL,
  data_primeiros_sintomas text,
  data_puncao text,
  data_quimioprofilaxia text,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  distrito text,
  doenca_relacionada_trabalho text,
  doencas_preexistentes jsonb,
  endereco_contato text,
  escolaridade text,
  especificacao_confirmado text,
  evolucao_caso text,
  exame_quimiocitologico jsonb,
  faixa_etaria text,
  funcao_investigador text,
  gestante text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  logradouro text,
  macroregiao text,
  municipio_hospital text,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  nome_contato text,
  nome_hospital text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  numero_cartao_sus text,
  numero_comunicantes numeric,
  numero_endereco text,
  numero_ficha text,
  observacoes_adicionais text,
  ocorreu_hospitalizacao text,
  ocupacao text,
  pais text,
  ponto_referencia text,
  puncao_lombar text,
  quimioprofilaxia_comunicantes text,
  raca_cor text,
  regional text,
  resultados_laboratoriais jsonb,
  sexo text,
  sinais_sintomas jsonb,
  sorogrupo_meningitidis text,
  status text NOT NULL,
  telefone text,
  telefone_contato text,
  tipo_idade text,
  tipo_notificacao text,
  uf_hospital text,
  uf_notificacao text,
  uf_residencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  vacinacao jsonb,
  zona text
);

ALTER TABLE public.meningite_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: profiles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  blocked boolean DEFAULT false NOT NULL,
  cargo text,
  created_at timestamp with time zone DEFAULT now(),
  email text,
  full_name text NOT NULL,
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamp with time zone NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: raiva_humana_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.raiva_humana_cases (
  agravo text NOT NULL,
  animal_vacinado text,
  antecedentes_doencas text,
  antecedentes_tratamento_antirabico text,
  antecedentes_vacinas text,
  aplicacao_vacina_antirabica text,
  bairro text,
  cep text,
  classificacao_final text,
  codigo_ibge_notificacao text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  created_at timestamp with time zone DEFAULT now(),
  criterio_confirmacao text,
  data_1a_dose text,
  data_aplicacao_soro text,
  data_encerramento text,
  data_exposicao text,
  data_inicio_tratamento_atual text,
  data_internacao text,
  data_investigacao text,
  data_nascimento text,
  data_notificacao text NOT NULL,
  data_obito text,
  data_primeiros_sintomas text,
  data_ultima_dose text,
  data_ultima_dose_anterior text,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  diagnostico_laboratorial jsonb,
  doenca_relacionada_trabalho text,
  escolaridade text,
  especie_animal_agressor text,
  evolucao text,
  ferimento text,
  foi_aplicado_soro text,
  funcao_investigador text,
  gestante text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  infiltracao_soro_ferimento text,
  localizacao_exposicao jsonb,
  logradouro text,
  municipio_hospital text,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  nome_hospital text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  numero_cartao_sus text,
  numero_doses_anteriores numeric,
  numero_doses_atuais numeric,
  numero_endereco text,
  numero_ficha text,
  observacoes_adicionais text,
  ocorreu_hospitalizacao text,
  ocupacao text,
  quantidade_soro_ml numeric,
  raca_cor text,
  sexo text,
  sinais_sintomas jsonb,
  status text NOT NULL,
  telefone text,
  tipo_exposicao jsonb,
  tipo_ferimento jsonb,
  tipo_idade text,
  tipo_tratamento_anterior text,
  uf_hospital text,
  uf_notificacao text,
  uf_residencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  zona text
);

ALTER TABLE public.raiva_humana_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: srag_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.srag_cases (
  agravo text NOT NULL,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  bairro text,
  cep text,
  classificacao_final text,
  codigo_cnes text,
  codigo_ibge_notificacao text,
  codigo_unidade_investigador text,
  created_at timestamp with time zone DEFAULT now(),
  criterio_confirmacao text,
  data_alta_obito text,
  data_coleta text,
  data_encerramento text,
  data_entrada_uti text,
  data_inicio_tratamento text,
  data_internacao text,
  data_nascimento text,
  data_preenchimento text NOT NULL,
  data_primeiros_sintomas text,
  data_raio_x text,
  data_saida_uti text,
  data_ultima_dose_vacina text,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  diagnostico_etiologico jsonb,
  escolaridade text,
  evolucao text,
  fatores_risco jsonb,
  funcao_investigador text,
  gestante text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  internado_uti text,
  logradouro text,
  municipio_hospital text,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  nome_hospital text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  numero_cartao_sus text,
  numero_endereco text,
  numero_ficha text,
  observacoes_adicionais text,
  ocorreu_internacao text,
  raca_cor text,
  raio_x_torax text,
  recebeu_vacina_gripe text,
  sexo text,
  sinais_sintomas jsonb,
  status text NOT NULL,
  suporte_ventilatorio text,
  telefone text,
  tipo_amostra text,
  tipo_idade text,
  uf_hospital text,
  uf_notificacao text,
  uf_residencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  uso_antiviral text,
  zona text
);

ALTER TABLE public.srag_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: suppressed_emails
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  created_at timestamp with time zone DEFAULT now(),
  email text NOT NULL,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata jsonb,
  reason text NOT NULL
);

ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: surto_dta_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.surto_dta_cases (
  agente_etiologico text,
  agravo text NOT NULL,
  alimento_causador text,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  bairro text,
  cep text,
  codigo_ibge_notificacao text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  coletadas_amostras_alimentos text,
  coletadas_amostras_clinicas text,
  complemento text,
  created_at timestamp with time zone DEFAULT now(),
  criterio_confirmacao text,
  data_1os_sintomas_1o_caso text,
  data_encerramento text,
  data_investigacao text,
  data_notificacao text NOT NULL,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  fatores_causais jsonb,
  funcao_investigador text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  local_ingestao text,
  local_inicial_ocorrencia text,
  local_producao_preparacao text,
  logradouro text,
  mediana_periodo_incubacao numeric,
  medidas_adotadas text,
  modo_transmissao text,
  municipio_notificacao text NOT NULL,
  municipio_ocorrencia text,
  municipio_unidade_investigador text,
  nome_investigador text,
  numero_amostras_alimentos numeric,
  numero_amostras_clinicas numeric,
  numero_casos_suspeitos numeric,
  numero_doentes_entrevistados numeric,
  numero_endereco text,
  numero_entrevistados numeric,
  numero_ficha text,
  numero_obitos numeric,
  numero_total_doentes numeric,
  numero_total_hospitalizados numeric,
  observacoes text,
  periodo_incubacao_maximo numeric,
  periodo_incubacao_minimo numeric,
  resultado_bromatologico_1 text,
  resultado_clinico_1 text,
  resultado_clinico_2 text,
  sinais_sintomas jsonb,
  status text NOT NULL,
  telefone text,
  uf_notificacao text,
  uf_ocorrencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  veiculo_transmissao text,
  zona text
);

ALTER TABLE public.surto_dta_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: system_logs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_logs (
  action text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  description text,
  entity_id uuid,
  entity_type text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata jsonb,
  user_email text,
  user_id uuid,
  user_name text,
  user_role text
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: tetano_acidental_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tetano_acidental_cases (
  agravo text NOT NULL,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  bairro text,
  caso_autoctone text,
  cep text,
  classificacao_final text,
  codigo_ibge_notificacao text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  created_at timestamp with time zone DEFAULT now(),
  data_encerramento text,
  data_internacao text,
  data_investigacao text,
  data_nascimento text,
  data_notificacao text NOT NULL,
  data_obito text,
  data_primeiros_sintomas text,
  data_ultima_dose text,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  escolaridade text,
  evolucao text,
  funcao_investigador text,
  gestante text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  local_fonte_infeccao text,
  local_lesao text,
  logradouro text,
  manifestacoes_clinicas jsonb,
  medidas_controle jsonb,
  municipio_hospital text,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  numero_cartao_sus text,
  numero_endereco text,
  numero_ficha text,
  observacoes_adicionais text,
  ocorreu_hospitalizacao text,
  ocupacao text,
  origem_caso text,
  possivel_causa text,
  profilaxia_pos_ferimento jsonb,
  raca_cor text,
  sexo text,
  situacao_vacinal_doses text,
  status text NOT NULL,
  telefone text,
  tipo_idade text,
  uf_hospital text,
  uf_notificacao text,
  uf_residencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  zona text
);

ALTER TABLE public.tetano_acidental_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: tetano_neonatal_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tetano_neonatal_cases (
  agravo text NOT NULL,
  antecedentes_doencas text,
  antecedentes_vacinais_mae text,
  antecedentes_vacinas text,
  bairro text,
  caso_autoctone text,
  cep text,
  classificacao_final text,
  codigo_ibge_notificacao text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  created_at timestamp with time zone DEFAULT now(),
  data_1a_dose_mae text,
  data_2a_dose_mae text,
  data_3a_dose_mae text,
  data_encerramento text,
  data_investigacao text,
  data_nascimento text,
  data_notificacao text NOT NULL,
  data_obito text,
  data_primeiros_sintomas text,
  data_trismo text,
  data_ultimo_reforco_mae text,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  escolaridade_mae text,
  evolucao text,
  funcao_investigador text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  idade_mae numeric,
  local_fonte_infeccao text,
  local_ocorrencia_parto text,
  local_residencia_coberta text,
  logradouro text,
  medidas_adotadas jsonb,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  numero_cartao_sus text,
  numero_consultas_pre_natal text,
  numero_endereco text,
  numero_ficha text,
  numero_gestacoes text,
  observacoes_adicionais text,
  ocorreu_hospitalizacao text,
  origem_caso text,
  parto_atendido_por text,
  raca_cor text,
  sexo text,
  sinais_sintomas jsonb,
  status text NOT NULL,
  sugou_normalmente text,
  telefone text,
  tipo_idade text,
  uf_notificacao text,
  uf_residencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  zona text
);

ALTER TABLE public.tetano_neonatal_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: tuberculose_cases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tuberculose_cases (
  agravo text NOT NULL,
  antecedentes_doencas text,
  antecedentes_vacinas text,
  baciloscopia_escarro text,
  bairro text,
  cep text,
  codigo_ibge_notificacao text,
  codigo_unidade_investigador text,
  codigo_unidade_saude text,
  created_at timestamp with time zone DEFAULT now(),
  cultura text,
  data_diagnostico text,
  data_inicio_tratamento text,
  data_nascimento text,
  data_notificacao text NOT NULL,
  dc_data_internacao text,
  dc_data_primeiros_sintomas text,
  dc_evolucao_clinica text,
  dc_houve_hospitalizacao text,
  dc_sintomas text,
  dc_sintomas_outros text,
  doencas_agravos_associados jsonb,
  escolaridade text,
  forma text,
  funcao_investigador text,
  gestante text,
  histopatologia text,
  hiv text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idade numeric,
  logradouro text,
  municipio_notificacao text,
  municipio_residencia text,
  municipio_unidade_investigador text,
  nome_investigador text,
  nome_mae text,
  nome_paciente text NOT NULL,
  numero_cartao_sus text,
  numero_endereco text,
  numero_ficha text,
  numero_prontuario text,
  observacoes_adicionais text,
  ocupacao text,
  populacoes_especiais jsonb,
  raca_cor text,
  radiografia_torax text,
  se_extrapulmonar text,
  sexo text,
  status text NOT NULL,
  telefone text,
  terapia_antirretroviral text,
  teste_sensibilidade text,
  tipo_entrada text,
  tipo_idade text,
  tmr_tb text,
  total_contatos_identificados numeric,
  uf_notificacao text,
  uf_residencia text,
  unidade_saude text,
  updated_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  zona text
);

ALTER TABLE public.tuberculose_cases ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- TABELA: user_roles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  created_at timestamp with time zone DEFAULT now(),
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;


-- =====================================================================
-- FUNÇÕES DE CONTROLE DE ACESSO E SEGURANÇA
-- =====================================================================

-- Função para verificar se um usuário possui determinado papel (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Trigger para impedir a remoção do último administrador
CREATE OR REPLACE FUNCTION public.prevent_last_admin_removal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count integer;
BEGIN
  IF (TG_OP = 'DELETE' AND OLD.role = 'admin') OR
     (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role <> 'admin') THEN
    SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Não é permitido remover ou alterar o último administrador do sistema.';
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_last_admin_removal ON public.user_roles;
CREATE TRIGGER tr_prevent_last_admin_removal
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_last_admin_removal();

-- Trigger para criar perfil automaticamente ao cadastrar usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, cargo, blocked)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'cargo',
    false
  )
  ON CONFLICT (id) DO NOTHING;

  -- Se for o primeiro usuário, atribui admin, senão perfil padrão user
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- USER_ROLES
DROP POLICY IF EXISTS "user_roles_select_authenticated" ON public.user_roles;
CREATE POLICY "user_roles_select_authenticated" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SYSTEM_LOGS
DROP POLICY IF EXISTS "system_logs_admin_all" ON public.system_logs;
CREATE POLICY "system_logs_admin_all" ON public.system_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CASOS DOS AGRAVOS (SINAN) - Leitura, Inserção e Edição por usuários autenticados
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'coqueluche_cases', 'dengue_chikungunya_cases', 'difteria_cases',
    'epizootia_cases', 'exantematica_cases', 'febre_amarela_cases',
    'hanseniase_cases', 'meningite_cases', 'raiva_humana_cases',
    'srag_cases', 'surto_dta_cases', 'tetano_acidental_cases',
    'tetano_neonatal_cases', 'tuberculose_cases', 'email_send_log',
    'email_send_state', 'email_unsubscribe_tokens', 'suppressed_emails'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tbl || '_authenticated_all', tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl || '_authenticated_all', tbl);
    EXECUTE format('GRANT ALL ON public.%I TO authenticated', tbl);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl);
  END LOOP;
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
