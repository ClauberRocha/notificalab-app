export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      coqueluche_cases: {
        Row: {
          agravo: string
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          bairro: string | null
          casos_secundarios_confirmados: string | null
          cep: string | null
          classificacao_final: string | null
          codigo_ibge_notificacao: string | null
          codigo_ibge_residencia: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          coleta_nasofaringe: string | null
          coleta_nasofaringe_comunicantes: string | null
          complemento: string | null
          complicacoes: Json
          comunicantes_cultura_positivo: number | null
          contato_caso_suspeito: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_adm_antibiotico: string | null
          data_coleta_material: string | null
          data_encerramento: string | null
          data_inicio_tosse: string | null
          data_internacao: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_obito: string | null
          data_primeiros_sintomas: string | null
          data_ultima_dose: string | null
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          distrito: string | null
          doenca_relacionada_trabalho: string | null
          doses_vacina_triplice: string | null
          endereco_contato: string | null
          escolaridade: string | null
          evolucao: string | null
          funcao_investigador: string | null
          gestante: string | null
          id: string
          idade: number | null
          identificacao_comunicantes: string | null
          logradouro: string | null
          medidas_prevencao: string | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_contato: string | null
          nome_hospital: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_comunicantes: number | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorreu_hospitalizacao: string | null
          ocupacao: string | null
          pais: string | null
          ponto_referencia: string | null
          quantidade_comunicantes_coleta: number | null
          raca_cor: string | null
          resultado_cultura: string | null
          sexo: string | null
          sinais_sintomas: Json
          status: string
          telefone: string | null
          tipo_idade: string | null
          tipo_notificacao: string
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          unidade_sentinela: string | null
          updated_at: string
          user_id: string
          utilizou_antibiotico: string | null
          zona: string | null
        }
        Insert: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          casos_secundarios_confirmados?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_residencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          coleta_nasofaringe?: string | null
          coleta_nasofaringe_comunicantes?: string | null
          complemento?: string | null
          complicacoes?: Json
          comunicantes_cultura_positivo?: number | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_adm_antibiotico?: string | null
          data_coleta_material?: string | null
          data_encerramento?: string | null
          data_inicio_tosse?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          distrito?: string | null
          doenca_relacionada_trabalho?: string | null
          doses_vacina_triplice?: string | null
          endereco_contato?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          identificacao_comunicantes?: string | null
          logradouro?: string | null
          medidas_prevencao?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_comunicantes?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          pais?: string | null
          ponto_referencia?: string | null
          quantidade_comunicantes_coleta?: number | null
          raca_cor?: string | null
          resultado_cultura?: string | null
          sexo?: string | null
          sinais_sintomas?: Json
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          tipo_notificacao?: string
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          unidade_sentinela?: string | null
          updated_at?: string
          user_id: string
          utilizou_antibiotico?: string | null
          zona?: string | null
        }
        Update: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          casos_secundarios_confirmados?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_residencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          coleta_nasofaringe?: string | null
          coleta_nasofaringe_comunicantes?: string | null
          complemento?: string | null
          complicacoes?: Json
          comunicantes_cultura_positivo?: number | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_adm_antibiotico?: string | null
          data_coleta_material?: string | null
          data_encerramento?: string | null
          data_inicio_tosse?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          distrito?: string | null
          doenca_relacionada_trabalho?: string | null
          doses_vacina_triplice?: string | null
          endereco_contato?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          identificacao_comunicantes?: string | null
          logradouro?: string | null
          medidas_prevencao?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_comunicantes?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          pais?: string | null
          ponto_referencia?: string | null
          quantidade_comunicantes_coleta?: number | null
          raca_cor?: string | null
          resultado_cultura?: string | null
          sexo?: string | null
          sinais_sintomas?: Json
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          tipo_notificacao?: string
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          unidade_sentinela?: string | null
          updated_at?: string
          user_id?: string
          utilizou_antibiotico?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      dengue_chikungunya_cases: {
        Row: {
          agravo: string
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          bairro: string | null
          caso_autoctone: string | null
          cep: string | null
          classificacao: string | null
          codigo_ibge_notificacao: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_encerramento: string | null
          data_internacao: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_obito: string | null
          data_primeiros_sintomas: string | null
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          dengue_grave: string | null
          dengue_sinais_alarme: string | null
          doencas_preexistentes: Json | null
          escolaridade: string | null
          evolucao: string | null
          funcao_investigador: string | null
          gestante: string | null
          id: string
          idade: number | null
          logradouro: string | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_hospital: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          ns1_data: string | null
          ns1_resultado: string | null
          numero_cartao_sus: string | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorreu_hospitalizacao: string | null
          ocupacao: string | null
          raca_cor: string | null
          rt_pcr_data: string | null
          rt_pcr_resultado: string | null
          sexo: string | null
          sinais_clinicos: Json | null
          sorologia_chikungunya_resultado_s1: string | null
          sorologia_chikungunya_resultado_s2: string | null
          sorologia_chikungunya_s1_data: string | null
          sorologia_chikungunya_s2_data: string | null
          sorologia_dengue_data: string | null
          sorologia_dengue_resultado: string | null
          sorotipo: string | null
          status: string
          telefone: string | null
          tipo_idade: string | null
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          zona: string | null
        }
        Insert: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          caso_autoctone?: string | null
          cep?: string | null
          classificacao?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          dengue_grave?: string | null
          dengue_sinais_alarme?: string | null
          doencas_preexistentes?: Json | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          ns1_data?: string | null
          ns1_resultado?: string | null
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          raca_cor?: string | null
          rt_pcr_data?: string | null
          rt_pcr_resultado?: string | null
          sexo?: string | null
          sinais_clinicos?: Json | null
          sorologia_chikungunya_resultado_s1?: string | null
          sorologia_chikungunya_resultado_s2?: string | null
          sorologia_chikungunya_s1_data?: string | null
          sorologia_chikungunya_s2_data?: string | null
          sorologia_dengue_data?: string | null
          sorologia_dengue_resultado?: string | null
          sorotipo?: string | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          zona?: string | null
        }
        Update: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          caso_autoctone?: string | null
          cep?: string | null
          classificacao?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          dengue_grave?: string | null
          dengue_sinais_alarme?: string | null
          doencas_preexistentes?: Json | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          ns1_data?: string | null
          ns1_resultado?: string | null
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          raca_cor?: string | null
          rt_pcr_data?: string | null
          rt_pcr_resultado?: string | null
          sexo?: string | null
          sinais_clinicos?: Json | null
          sorologia_chikungunya_resultado_s1?: string | null
          sorologia_chikungunya_resultado_s2?: string | null
          sorologia_chikungunya_s1_data?: string | null
          sorologia_chikungunya_s2_data?: string | null
          sorologia_dengue_data?: string | null
          sorologia_dengue_resultado?: string | null
          sorotipo?: string | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          zona?: string | null
        }
        Relationships: []
      }
      difteria_cases: {
        Row: {
          agravo: string
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          bairro: string | null
          casos_secundarios_confirmados: string | null
          cep: string | null
          classificacao_final: string | null
          codigo_hospital: string | null
          codigo_ibge_notificacao: string | null
          codigo_ibge_residencia: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          coleta_material_comunicantes: string | null
          complemento: string | null
          complicacoes: Json | null
          contato_caso_suspeito: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_adm_antibiotico: string | null
          data_aplicacao_soro: string | null
          data_coleta: string | null
          data_encerramento: string | null
          data_internacao: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_obito: string | null
          data_primeiros_sintomas: string | null
          data_ultima_dose: string | null
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          distrito: string | null
          doenca_relacionada_trabalho: string | null
          doses_vacina: string | null
          endereco_contato: string | null
          escolaridade: string | null
          evolucao: string | null
          funcao_investigador: string | null
          gestante: string | null
          id: string
          idade: number | null
          identificacao_comunicantes: string | null
          localizacao_pseudomembrana: Json | null
          logradouro: string | null
          material_coletado: string | null
          medidas_prevencao: string | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_contato: string | null
          nome_hospital: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_comunicantes: number | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorreu_hospitalizacao: string | null
          ocupacao: string | null
          pais: string | null
          ponto_referencia: string | null
          portadores_identificados: number | null
          provas_toxigenicidade: string | null
          quantidade_comunicantes_coleta: number | null
          raca_cor: string | null
          resultado_cultura: string | null
          sexo: string | null
          sinais_sintomas: Json | null
          status: string
          telefone: string | null
          temperatura_corporal: number | null
          tipo_idade: string | null
          tipo_notificacao: string | null
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          utilizou_antibiotico: string | null
          zona: string | null
        }
        Insert: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          casos_secundarios_confirmados?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_hospital?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_residencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          coleta_material_comunicantes?: string | null
          complemento?: string | null
          complicacoes?: Json | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_adm_antibiotico?: string | null
          data_aplicacao_soro?: string | null
          data_coleta?: string | null
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          distrito?: string | null
          doenca_relacionada_trabalho?: string | null
          doses_vacina?: string | null
          endereco_contato?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          identificacao_comunicantes?: string | null
          localizacao_pseudomembrana?: Json | null
          logradouro?: string | null
          material_coletado?: string | null
          medidas_prevencao?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_comunicantes?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          pais?: string | null
          ponto_referencia?: string | null
          portadores_identificados?: number | null
          provas_toxigenicidade?: string | null
          quantidade_comunicantes_coleta?: number | null
          raca_cor?: string | null
          resultado_cultura?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          temperatura_corporal?: number | null
          tipo_idade?: string | null
          tipo_notificacao?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          utilizou_antibiotico?: string | null
          zona?: string | null
        }
        Update: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          casos_secundarios_confirmados?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_hospital?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_residencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          coleta_material_comunicantes?: string | null
          complemento?: string | null
          complicacoes?: Json | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_adm_antibiotico?: string | null
          data_aplicacao_soro?: string | null
          data_coleta?: string | null
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          distrito?: string | null
          doenca_relacionada_trabalho?: string | null
          doses_vacina?: string | null
          endereco_contato?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          identificacao_comunicantes?: string | null
          localizacao_pseudomembrana?: Json | null
          logradouro?: string | null
          material_coletado?: string | null
          medidas_prevencao?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_comunicantes?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          pais?: string | null
          ponto_referencia?: string | null
          portadores_identificados?: number | null
          provas_toxigenicidade?: string | null
          quantidade_comunicantes_coleta?: number | null
          raca_cor?: string | null
          resultado_cultura?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          temperatura_corporal?: number | null
          tipo_idade?: string | null
          tipo_notificacao?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          utilizou_antibiotico?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      epizootia_cases: {
        Row: {
          agravo: string
          ambiente: string | null
          animais_acometidos: Json | null
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          bairro: string | null
          cep: string | null
          codigo_ibge_notificacao: string | null
          codigo_ibge_ocorrencia: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          complemento: string | null
          created_at: string
          data_coleta: string | null
          data_inicio_epizootia: string | null
          data_notificacao: string
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          distrito: string | null
          fonte_informacao: string | null
          funcao_investigador: string | null
          geocampo1: string | null
          geocampo2: string | null
          houve_coleta: string | null
          id: string
          logradouro: string | null
          material_coletado: Json | null
          municipio_notificacao: string
          municipio_ocorrencia: string | null
          municipio_unidade_investigador: string | null
          nome_investigador: string | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ponto_referencia: string | null
          resultado_laboratorial: Json | null
          status: string
          suspeita_diagnostica: Json | null
          telefone: string | null
          telefone_fonte: string | null
          tipo_notificacao: string | null
          uf_notificacao: string | null
          uf_ocorrencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          zona: string | null
        }
        Insert: {
          agravo?: string
          ambiente?: string | null
          animais_acometidos?: Json | null
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          cep?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_ocorrencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          complemento?: string | null
          created_at?: string
          data_coleta?: string | null
          data_inicio_epizootia?: string | null
          data_notificacao: string
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          distrito?: string | null
          fonte_informacao?: string | null
          funcao_investigador?: string | null
          geocampo1?: string | null
          geocampo2?: string | null
          houve_coleta?: string | null
          id?: string
          logradouro?: string | null
          material_coletado?: Json | null
          municipio_notificacao: string
          municipio_ocorrencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ponto_referencia?: string | null
          resultado_laboratorial?: Json | null
          status?: string
          suspeita_diagnostica?: Json | null
          telefone?: string | null
          telefone_fonte?: string | null
          tipo_notificacao?: string | null
          uf_notificacao?: string | null
          uf_ocorrencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          zona?: string | null
        }
        Update: {
          agravo?: string
          ambiente?: string | null
          animais_acometidos?: Json | null
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          cep?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_ocorrencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          complemento?: string | null
          created_at?: string
          data_coleta?: string | null
          data_inicio_epizootia?: string | null
          data_notificacao?: string
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          distrito?: string | null
          fonte_informacao?: string | null
          funcao_investigador?: string | null
          geocampo1?: string | null
          geocampo2?: string | null
          houve_coleta?: string | null
          id?: string
          logradouro?: string | null
          material_coletado?: Json | null
          municipio_notificacao?: string
          municipio_ocorrencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ponto_referencia?: string | null
          resultado_laboratorial?: Json | null
          status?: string
          suspeita_diagnostica?: Json | null
          telefone?: string | null
          telefone_fonte?: string | null
          tipo_notificacao?: string | null
          uf_notificacao?: string | null
          uf_ocorrencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          zona?: string | null
        }
        Relationships: []
      }
      exantematica_cases: {
        Row: {
          agravo: string
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          bairro: string | null
          cep: string | null
          classificacao_final: string | null
          codigo_ibge_notificacao: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          complemento: string | null
          contato_caso_suspeito: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_coleta_s1: string | null
          data_coleta_s2: string | null
          data_encerramento: string | null
          data_inicio_exantema: string | null
          data_inicio_febre: string | null
          data_internacao: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_obito: string | null
          data_primeiros_sintomas: string | null
          data_ultima_dose_vacina: string | null
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          endereco_contato: string | null
          escolaridade: string | null
          evolucao: string | null
          funcao_investigador: string | null
          gestante: string | null
          id: string
          idade: number | null
          logradouro: string | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_contato: string | null
          nome_hospital: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorreu_hospitalizacao: string | null
          ocupacao: string | null
          raca_cor: string | null
          realizou_bloqueio_vacinal: string | null
          resultado_sorologia_rubeola_s1_igg: string | null
          resultado_sorologia_rubeola_s1_igm: string | null
          resultado_sorologia_sarampo_s1_igg: string | null
          resultado_sorologia_sarampo_s1_igm: string | null
          sexo: string | null
          sinais_sintomas: Json | null
          status: string
          telefone: string | null
          tipo_idade: string | null
          tomou_vacina_sarampo_rubeola: string | null
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          zona: string | null
        }
        Insert: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          complemento?: string | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_coleta_s1?: string | null
          data_coleta_s2?: string | null
          data_encerramento?: string | null
          data_inicio_exantema?: string | null
          data_inicio_febre?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose_vacina?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          endereco_contato?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          raca_cor?: string | null
          realizou_bloqueio_vacinal?: string | null
          resultado_sorologia_rubeola_s1_igg?: string | null
          resultado_sorologia_rubeola_s1_igm?: string | null
          resultado_sorologia_sarampo_s1_igg?: string | null
          resultado_sorologia_sarampo_s1_igm?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          tomou_vacina_sarampo_rubeola?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          zona?: string | null
        }
        Update: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          complemento?: string | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_coleta_s1?: string | null
          data_coleta_s2?: string | null
          data_encerramento?: string | null
          data_inicio_exantema?: string | null
          data_inicio_febre?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose_vacina?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          endereco_contato?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          raca_cor?: string | null
          realizou_bloqueio_vacinal?: string | null
          resultado_sorologia_rubeola_s1_igg?: string | null
          resultado_sorologia_rubeola_s1_igm?: string | null
          resultado_sorologia_sarampo_s1_igg?: string | null
          resultado_sorologia_sarampo_s1_igm?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          tomou_vacina_sarampo_rubeola?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          zona?: string | null
        }
        Relationships: []
      }
      febre_amarela_cases: {
        Row: {
          agravo: string
          alt_tgp: number | null
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          ast_tgo: number | null
          atividade_local_infeccao: string | null
          bairro: string | null
          bilirrubina_direta: number | null
          bilirrubina_total: number | null
          caso_autoctone: string | null
          cep: string | null
          classificacao_final: string | null
          codigo_ibge_notificacao: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          complemento: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_coleta_isolamento: string | null
          data_coleta_s1: string | null
          data_coleta_s2: string | null
          data_encerramento: string | null
          data_internacao: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_obito: string | null
          data_primeiros_sintomas: string | null
          data_vacinacao: string | null
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          doenca_relacionada_trabalho: string | null
          escolaridade: string | null
          evolucao: string | null
          funcao_investigador: string | null
          gestante: string | null
          histopatologia: string | null
          id: string
          idade: number | null
          imunohistoquimica: string | null
          isolamento_virus_mosquitos: string | null
          logradouro: string | null
          material_coletado_isolamento: string | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          municipio_vacinacao: string | null
          nome_hospital: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorrencia_epizootias: string | null
          ocorreu_hospitalizacao: string | null
          ocupacao: string | null
          presenca_mosquito_aedes: string | null
          raca_cor: string | null
          resultado_isolamento: string | null
          resultado_s1: string | null
          resultado_s2: string | null
          rt_pcr_data: string | null
          rt_pcr_resultado: string | null
          sexo: string | null
          sinais_sintomas: Json | null
          status: string
          telefone: string | null
          tipo_idade: string | null
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          uf_vacinacao: string | null
          unidade_saude: string | null
          unidade_saude_vacinacao: string | null
          updated_at: string
          user_id: string
          vacinado_febre_amarela: string | null
          zona: string | null
        }
        Insert: {
          agravo?: string
          alt_tgp?: number | null
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          ast_tgo?: number | null
          atividade_local_infeccao?: string | null
          bairro?: string | null
          bilirrubina_direta?: number | null
          bilirrubina_total?: number | null
          caso_autoctone?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          complemento?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_coleta_isolamento?: string | null
          data_coleta_s1?: string | null
          data_coleta_s2?: string | null
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_vacinacao?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          doenca_relacionada_trabalho?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          histopatologia?: string | null
          id?: string
          idade?: number | null
          imunohistoquimica?: string | null
          isolamento_virus_mosquitos?: string | null
          logradouro?: string | null
          material_coletado_isolamento?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          municipio_vacinacao?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorrencia_epizootias?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          presenca_mosquito_aedes?: string | null
          raca_cor?: string | null
          resultado_isolamento?: string | null
          resultado_s1?: string | null
          resultado_s2?: string | null
          rt_pcr_data?: string | null
          rt_pcr_resultado?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          uf_vacinacao?: string | null
          unidade_saude?: string | null
          unidade_saude_vacinacao?: string | null
          updated_at?: string
          user_id: string
          vacinado_febre_amarela?: string | null
          zona?: string | null
        }
        Update: {
          agravo?: string
          alt_tgp?: number | null
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          ast_tgo?: number | null
          atividade_local_infeccao?: string | null
          bairro?: string | null
          bilirrubina_direta?: number | null
          bilirrubina_total?: number | null
          caso_autoctone?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          complemento?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_coleta_isolamento?: string | null
          data_coleta_s1?: string | null
          data_coleta_s2?: string | null
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_vacinacao?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          doenca_relacionada_trabalho?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          histopatologia?: string | null
          id?: string
          idade?: number | null
          imunohistoquimica?: string | null
          isolamento_virus_mosquitos?: string | null
          logradouro?: string | null
          material_coletado_isolamento?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          municipio_vacinacao?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorrencia_epizootias?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          presenca_mosquito_aedes?: string | null
          raca_cor?: string | null
          resultado_isolamento?: string | null
          resultado_s1?: string | null
          resultado_s2?: string | null
          rt_pcr_data?: string | null
          rt_pcr_resultado?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          uf_vacinacao?: string | null
          unidade_saude?: string | null
          unidade_saude_vacinacao?: string | null
          updated_at?: string
          user_id?: string
          vacinado_febre_amarela?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      hanseniase_cases: {
        Row: {
          agravo: string
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          baciloscopia: string | null
          bairro: string | null
          cep: string | null
          classificacao_operacional: string | null
          codigo_ibge_notificacao: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          created_at: string
          data_diagnostico: string | null
          data_inicio_tratamento: string | null
          data_nascimento: string | null
          data_notificacao: string
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          escolaridade: string | null
          esquema_terapeutico: string | null
          forma_clinica: string | null
          funcao_investigador: string | null
          gestante: string | null
          grau_incapacidade_fisica: string | null
          id: string
          idade: number | null
          logradouro: string | null
          modo_deteccao: string | null
          modo_entrada: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_contatos_registrados: number | null
          numero_endereco: string | null
          numero_ficha: string | null
          numero_lesoes_cutaneas: number | null
          numero_nervos_afetados: number | null
          numero_prontuario: string | null
          observacoes_adicionais: string | null
          ocupacao: string | null
          raca_cor: string | null
          sexo: string | null
          status: string
          telefone: string | null
          tipo_idade: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          zona: string | null
        }
        Insert: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          baciloscopia?: string | null
          bairro?: string | null
          cep?: string | null
          classificacao_operacional?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          data_diagnostico?: string | null
          data_inicio_tratamento?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          escolaridade?: string | null
          esquema_terapeutico?: string | null
          forma_clinica?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          grau_incapacidade_fisica?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          modo_deteccao?: string | null
          modo_entrada?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_contatos_registrados?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          numero_lesoes_cutaneas?: number | null
          numero_nervos_afetados?: number | null
          numero_prontuario?: string | null
          observacoes_adicionais?: string | null
          ocupacao?: string | null
          raca_cor?: string | null
          sexo?: string | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          zona?: string | null
        }
        Update: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          baciloscopia?: string | null
          bairro?: string | null
          cep?: string | null
          classificacao_operacional?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          data_diagnostico?: string | null
          data_inicio_tratamento?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          escolaridade?: string | null
          esquema_terapeutico?: string | null
          forma_clinica?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          grau_incapacidade_fisica?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          modo_deteccao?: string | null
          modo_entrada?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_contatos_registrados?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          numero_lesoes_cutaneas?: number | null
          numero_nervos_afetados?: number | null
          numero_prontuario?: string | null
          observacoes_adicionais?: string | null
          ocupacao?: string | null
          raca_cor?: string | null
          sexo?: string | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          zona?: string | null
        }
        Relationships: []
      }
      meningite_cases: {
        Row: {
          agravo: string
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          aspecto_liquor: string | null
          bairro: string | null
          caso_secundario: string | null
          cep: string | null
          classificacao_caso: string | null
          codigo_hospital: string | null
          codigo_ibge_notificacao: string | null
          codigo_ibge_residencia: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          complemento: string | null
          contato_caso_suspeito: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_encerramento: string | null
          data_evolucao: string | null
          data_internacao: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_primeiros_sintomas: string | null
          data_puncao: string | null
          data_quimioprofilaxia: string | null
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          distrito: string | null
          doenca_relacionada_trabalho: string | null
          doencas_preexistentes: Json | null
          endereco_contato: string | null
          escolaridade: string | null
          especificacao_confirmado: string | null
          evolucao_caso: string | null
          exame_quimiocitologico: Json | null
          funcao_investigador: string | null
          gestante: string | null
          id: string
          idade: number | null
          logradouro: string | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_contato: string | null
          nome_hospital: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_comunicantes: number | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorreu_hospitalizacao: string | null
          ocupacao: string | null
          pais: string | null
          ponto_referencia: string | null
          puncao_lombar: string | null
          quimioprofilaxia_comunicantes: string | null
          raca_cor: string | null
          resultados_laboratoriais: Json | null
          sexo: string | null
          sinais_sintomas: Json | null
          sorogrupo_meningitidis: string | null
          status: string
          telefone: string | null
          telefone_contato: string | null
          tipo_idade: string | null
          tipo_notificacao: string | null
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          vacinacao: Json | null
          zona: string | null
        }
        Insert: {
          agravo: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          aspecto_liquor?: string | null
          bairro?: string | null
          caso_secundario?: string | null
          cep?: string | null
          classificacao_caso?: string | null
          codigo_hospital?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_residencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          complemento?: string | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_encerramento?: string | null
          data_evolucao?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_primeiros_sintomas?: string | null
          data_puncao?: string | null
          data_quimioprofilaxia?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          distrito?: string | null
          doenca_relacionada_trabalho?: string | null
          doencas_preexistentes?: Json | null
          endereco_contato?: string | null
          escolaridade?: string | null
          especificacao_confirmado?: string | null
          evolucao_caso?: string | null
          exame_quimiocitologico?: Json | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_comunicantes?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          pais?: string | null
          ponto_referencia?: string | null
          puncao_lombar?: string | null
          quimioprofilaxia_comunicantes?: string | null
          raca_cor?: string | null
          resultados_laboratoriais?: Json | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          sorogrupo_meningitidis?: string | null
          status?: string
          telefone?: string | null
          telefone_contato?: string | null
          tipo_idade?: string | null
          tipo_notificacao?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          vacinacao?: Json | null
          zona?: string | null
        }
        Update: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          aspecto_liquor?: string | null
          bairro?: string | null
          caso_secundario?: string | null
          cep?: string | null
          classificacao_caso?: string | null
          codigo_hospital?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_residencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          complemento?: string | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_encerramento?: string | null
          data_evolucao?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_primeiros_sintomas?: string | null
          data_puncao?: string | null
          data_quimioprofilaxia?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          distrito?: string | null
          doenca_relacionada_trabalho?: string | null
          doencas_preexistentes?: Json | null
          endereco_contato?: string | null
          escolaridade?: string | null
          especificacao_confirmado?: string | null
          evolucao_caso?: string | null
          exame_quimiocitologico?: Json | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_comunicantes?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          pais?: string | null
          ponto_referencia?: string | null
          puncao_lombar?: string | null
          quimioprofilaxia_comunicantes?: string | null
          raca_cor?: string | null
          resultados_laboratoriais?: Json | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          sorogrupo_meningitidis?: string | null
          status?: string
          telefone?: string | null
          telefone_contato?: string | null
          tipo_idade?: string | null
          tipo_notificacao?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          vacinacao?: Json | null
          zona?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          blocked: boolean
          cargo: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          blocked?: boolean
          cargo?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          blocked?: boolean
          cargo?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      raiva_humana_cases: {
        Row: {
          agravo: string
          animal_vacinado: string | null
          antecedentes_doencas: string | null
          antecedentes_tratamento_antirabico: string | null
          antecedentes_vacinas: string | null
          aplicacao_vacina_antirabica: string | null
          bairro: string | null
          cep: string | null
          classificacao_final: string | null
          codigo_ibge_notificacao: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_1a_dose: string | null
          data_aplicacao_soro: string | null
          data_encerramento: string | null
          data_exposicao: string | null
          data_inicio_tratamento_atual: string | null
          data_internacao: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_obito: string | null
          data_primeiros_sintomas: string | null
          data_ultima_dose: string | null
          data_ultima_dose_anterior: string | null
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          diagnostico_laboratorial: Json | null
          doenca_relacionada_trabalho: string | null
          escolaridade: string | null
          especie_animal_agressor: string | null
          evolucao: string | null
          ferimento: string | null
          foi_aplicado_soro: string | null
          funcao_investigador: string | null
          gestante: string | null
          id: string
          idade: number | null
          infiltracao_soro_ferimento: string | null
          localizacao_exposicao: Json | null
          logradouro: string | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_hospital: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_doses_anteriores: number | null
          numero_doses_atuais: number | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorreu_hospitalizacao: string | null
          ocupacao: string | null
          quantidade_soro_ml: number | null
          raca_cor: string | null
          sexo: string | null
          sinais_sintomas: Json | null
          status: string
          telefone: string | null
          tipo_exposicao: Json | null
          tipo_ferimento: Json | null
          tipo_idade: string | null
          tipo_tratamento_anterior: string | null
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          zona: string | null
        }
        Insert: {
          agravo?: string
          animal_vacinado?: string | null
          antecedentes_doencas?: string | null
          antecedentes_tratamento_antirabico?: string | null
          antecedentes_vacinas?: string | null
          aplicacao_vacina_antirabica?: string | null
          bairro?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_1a_dose?: string | null
          data_aplicacao_soro?: string | null
          data_encerramento?: string | null
          data_exposicao?: string | null
          data_inicio_tratamento_atual?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          data_ultima_dose_anterior?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          diagnostico_laboratorial?: Json | null
          doenca_relacionada_trabalho?: string | null
          escolaridade?: string | null
          especie_animal_agressor?: string | null
          evolucao?: string | null
          ferimento?: string | null
          foi_aplicado_soro?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          infiltracao_soro_ferimento?: string | null
          localizacao_exposicao?: Json | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_doses_anteriores?: number | null
          numero_doses_atuais?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          quantidade_soro_ml?: number | null
          raca_cor?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          tipo_exposicao?: Json | null
          tipo_ferimento?: Json | null
          tipo_idade?: string | null
          tipo_tratamento_anterior?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          zona?: string | null
        }
        Update: {
          agravo?: string
          animal_vacinado?: string | null
          antecedentes_doencas?: string | null
          antecedentes_tratamento_antirabico?: string | null
          antecedentes_vacinas?: string | null
          aplicacao_vacina_antirabica?: string | null
          bairro?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_1a_dose?: string | null
          data_aplicacao_soro?: string | null
          data_encerramento?: string | null
          data_exposicao?: string | null
          data_inicio_tratamento_atual?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          data_ultima_dose_anterior?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          diagnostico_laboratorial?: Json | null
          doenca_relacionada_trabalho?: string | null
          escolaridade?: string | null
          especie_animal_agressor?: string | null
          evolucao?: string | null
          ferimento?: string | null
          foi_aplicado_soro?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          infiltracao_soro_ferimento?: string | null
          localizacao_exposicao?: Json | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_doses_anteriores?: number | null
          numero_doses_atuais?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          quantidade_soro_ml?: number | null
          raca_cor?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          tipo_exposicao?: Json | null
          tipo_ferimento?: Json | null
          tipo_idade?: string | null
          tipo_tratamento_anterior?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          zona?: string | null
        }
        Relationships: []
      }
      srag_cases: {
        Row: {
          agravo: string
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          bairro: string | null
          cep: string | null
          classificacao_final: string | null
          codigo_cnes: string | null
          codigo_ibge_notificacao: string | null
          codigo_unidade_investigador: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_alta_obito: string | null
          data_coleta: string | null
          data_encerramento: string | null
          data_entrada_uti: string | null
          data_inicio_tratamento: string | null
          data_internacao: string | null
          data_nascimento: string | null
          data_preenchimento: string
          data_primeiros_sintomas: string | null
          data_raio_x: string | null
          data_saida_uti: string | null
          data_ultima_dose_vacina: string | null
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          diagnostico_etiologico: Json | null
          escolaridade: string | null
          evolucao: string | null
          fatores_risco: Json | null
          funcao_investigador: string | null
          gestante: string | null
          id: string
          idade: number | null
          internado_uti: string | null
          logradouro: string | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_hospital: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorreu_internacao: string | null
          raca_cor: string | null
          raio_x_torax: string | null
          recebeu_vacina_gripe: string | null
          sexo: string | null
          sinais_sintomas: Json | null
          status: string
          suporte_ventilatorio: string | null
          telefone: string | null
          tipo_amostra: string | null
          tipo_idade: string | null
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          uso_antiviral: string | null
          zona: string | null
        }
        Insert: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_cnes?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_alta_obito?: string | null
          data_coleta?: string | null
          data_encerramento?: string | null
          data_entrada_uti?: string | null
          data_inicio_tratamento?: string | null
          data_internacao?: string | null
          data_nascimento?: string | null
          data_preenchimento: string
          data_primeiros_sintomas?: string | null
          data_raio_x?: string | null
          data_saida_uti?: string | null
          data_ultima_dose_vacina?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          diagnostico_etiologico?: Json | null
          escolaridade?: string | null
          evolucao?: string | null
          fatores_risco?: Json | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          internado_uti?: string | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_internacao?: string | null
          raca_cor?: string | null
          raio_x_torax?: string | null
          recebeu_vacina_gripe?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          suporte_ventilatorio?: string | null
          telefone?: string | null
          tipo_amostra?: string | null
          tipo_idade?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          uso_antiviral?: string | null
          zona?: string | null
        }
        Update: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_cnes?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_alta_obito?: string | null
          data_coleta?: string | null
          data_encerramento?: string | null
          data_entrada_uti?: string | null
          data_inicio_tratamento?: string | null
          data_internacao?: string | null
          data_nascimento?: string | null
          data_preenchimento?: string
          data_primeiros_sintomas?: string | null
          data_raio_x?: string | null
          data_saida_uti?: string | null
          data_ultima_dose_vacina?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          diagnostico_etiologico?: Json | null
          escolaridade?: string | null
          evolucao?: string | null
          fatores_risco?: Json | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          internado_uti?: string | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_internacao?: string | null
          raca_cor?: string | null
          raio_x_torax?: string | null
          recebeu_vacina_gripe?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          suporte_ventilatorio?: string | null
          telefone?: string | null
          tipo_amostra?: string | null
          tipo_idade?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          uso_antiviral?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      surto_dta_cases: {
        Row: {
          agente_etiologico: string | null
          agravo: string
          alimento_causador: string | null
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          bairro: string | null
          cep: string | null
          codigo_ibge_notificacao: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          coletadas_amostras_alimentos: string | null
          coletadas_amostras_clinicas: string | null
          complemento: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_1os_sintomas_1o_caso: string | null
          data_encerramento: string | null
          data_investigacao: string | null
          data_notificacao: string
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          fatores_causais: Json | null
          funcao_investigador: string | null
          id: string
          local_ingestao: string | null
          local_inicial_ocorrencia: string | null
          local_producao_preparacao: string | null
          logradouro: string | null
          mediana_periodo_incubacao: number | null
          medidas_adotadas: string | null
          modo_transmissao: string | null
          municipio_notificacao: string
          municipio_ocorrencia: string | null
          municipio_unidade_investigador: string | null
          nome_investigador: string | null
          numero_amostras_alimentos: number | null
          numero_amostras_clinicas: number | null
          numero_casos_suspeitos: number | null
          numero_doentes_entrevistados: number | null
          numero_endereco: string | null
          numero_entrevistados: number | null
          numero_ficha: string | null
          numero_obitos: number | null
          numero_total_doentes: number | null
          numero_total_hospitalizados: number | null
          observacoes: string | null
          periodo_incubacao_maximo: number | null
          periodo_incubacao_minimo: number | null
          resultado_bromatologico_1: string | null
          resultado_clinico_1: string | null
          resultado_clinico_2: string | null
          sinais_sintomas: Json | null
          status: string
          telefone: string | null
          uf_notificacao: string | null
          uf_ocorrencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          veiculo_transmissao: string | null
          zona: string | null
        }
        Insert: {
          agente_etiologico?: string | null
          agravo?: string
          alimento_causador?: string | null
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          cep?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          coletadas_amostras_alimentos?: string | null
          coletadas_amostras_clinicas?: string | null
          complemento?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_1os_sintomas_1o_caso?: string | null
          data_encerramento?: string | null
          data_investigacao?: string | null
          data_notificacao: string
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          fatores_causais?: Json | null
          funcao_investigador?: string | null
          id?: string
          local_ingestao?: string | null
          local_inicial_ocorrencia?: string | null
          local_producao_preparacao?: string | null
          logradouro?: string | null
          mediana_periodo_incubacao?: number | null
          medidas_adotadas?: string | null
          modo_transmissao?: string | null
          municipio_notificacao: string
          municipio_ocorrencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          numero_amostras_alimentos?: number | null
          numero_amostras_clinicas?: number | null
          numero_casos_suspeitos?: number | null
          numero_doentes_entrevistados?: number | null
          numero_endereco?: string | null
          numero_entrevistados?: number | null
          numero_ficha?: string | null
          numero_obitos?: number | null
          numero_total_doentes?: number | null
          numero_total_hospitalizados?: number | null
          observacoes?: string | null
          periodo_incubacao_maximo?: number | null
          periodo_incubacao_minimo?: number | null
          resultado_bromatologico_1?: string | null
          resultado_clinico_1?: string | null
          resultado_clinico_2?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          uf_notificacao?: string | null
          uf_ocorrencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          veiculo_transmissao?: string | null
          zona?: string | null
        }
        Update: {
          agente_etiologico?: string | null
          agravo?: string
          alimento_causador?: string | null
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          cep?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          coletadas_amostras_alimentos?: string | null
          coletadas_amostras_clinicas?: string | null
          complemento?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_1os_sintomas_1o_caso?: string | null
          data_encerramento?: string | null
          data_investigacao?: string | null
          data_notificacao?: string
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          fatores_causais?: Json | null
          funcao_investigador?: string | null
          id?: string
          local_ingestao?: string | null
          local_inicial_ocorrencia?: string | null
          local_producao_preparacao?: string | null
          logradouro?: string | null
          mediana_periodo_incubacao?: number | null
          medidas_adotadas?: string | null
          modo_transmissao?: string | null
          municipio_notificacao?: string
          municipio_ocorrencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          numero_amostras_alimentos?: number | null
          numero_amostras_clinicas?: number | null
          numero_casos_suspeitos?: number | null
          numero_doentes_entrevistados?: number | null
          numero_endereco?: string | null
          numero_entrevistados?: number | null
          numero_ficha?: string | null
          numero_obitos?: number | null
          numero_total_doentes?: number | null
          numero_total_hospitalizados?: number | null
          observacoes?: string | null
          periodo_incubacao_maximo?: number | null
          periodo_incubacao_minimo?: number | null
          resultado_bromatologico_1?: string | null
          resultado_clinico_1?: string | null
          resultado_clinico_2?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          uf_notificacao?: string | null
          uf_ocorrencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          veiculo_transmissao?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      tetano_acidental_cases: {
        Row: {
          agravo: string
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          bairro: string | null
          caso_autoctone: string | null
          cep: string | null
          classificacao_final: string | null
          codigo_ibge_notificacao: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          created_at: string
          data_encerramento: string | null
          data_internacao: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_obito: string | null
          data_primeiros_sintomas: string | null
          data_ultima_dose: string | null
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          escolaridade: string | null
          evolucao: string | null
          funcao_investigador: string | null
          gestante: string | null
          id: string
          idade: number | null
          local_fonte_infeccao: string | null
          local_lesao: string | null
          logradouro: string | null
          manifestacoes_clinicas: Json | null
          medidas_controle: Json | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorreu_hospitalizacao: string | null
          ocupacao: string | null
          origem_caso: string | null
          possivel_causa: string | null
          profilaxia_pos_ferimento: Json | null
          raca_cor: string | null
          sexo: string | null
          situacao_vacinal_doses: string | null
          status: string
          telefone: string | null
          tipo_idade: string | null
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          zona: string | null
        }
        Insert: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          caso_autoctone?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          local_fonte_infeccao?: string | null
          local_lesao?: string | null
          logradouro?: string | null
          manifestacoes_clinicas?: Json | null
          medidas_controle?: Json | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          origem_caso?: string | null
          possivel_causa?: string | null
          profilaxia_pos_ferimento?: Json | null
          raca_cor?: string | null
          sexo?: string | null
          situacao_vacinal_doses?: string | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          zona?: string | null
        }
        Update: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          caso_autoctone?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          local_fonte_infeccao?: string | null
          local_lesao?: string | null
          logradouro?: string | null
          manifestacoes_clinicas?: Json | null
          medidas_controle?: Json | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          origem_caso?: string | null
          possivel_causa?: string | null
          profilaxia_pos_ferimento?: Json | null
          raca_cor?: string | null
          sexo?: string | null
          situacao_vacinal_doses?: string | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          zona?: string | null
        }
        Relationships: []
      }
      tetano_neonatal_cases: {
        Row: {
          agravo: string
          antecedentes_doencas: string | null
          antecedentes_vacinais_mae: string | null
          antecedentes_vacinas: string | null
          bairro: string | null
          caso_autoctone: string | null
          cep: string | null
          classificacao_final: string | null
          codigo_ibge_notificacao: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          created_at: string
          data_1a_dose_mae: string | null
          data_2a_dose_mae: string | null
          data_3a_dose_mae: string | null
          data_encerramento: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_obito: string | null
          data_primeiros_sintomas: string | null
          data_trismo: string | null
          data_ultimo_reforco_mae: string | null
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          escolaridade_mae: string | null
          evolucao: string | null
          funcao_investigador: string | null
          id: string
          idade: number | null
          idade_mae: number | null
          local_fonte_infeccao: string | null
          local_ocorrencia_parto: string | null
          local_residencia_coberta: string | null
          logradouro: string | null
          medidas_adotadas: Json | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_consultas_pre_natal: string | null
          numero_endereco: string | null
          numero_ficha: string | null
          numero_gestacoes: string | null
          observacoes_adicionais: string | null
          ocorreu_hospitalizacao: string | null
          origem_caso: string | null
          parto_atendido_por: string | null
          raca_cor: string | null
          sexo: string | null
          sinais_sintomas: Json | null
          status: string
          sugou_normalmente: string | null
          telefone: string | null
          tipo_idade: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          zona: string | null
        }
        Insert: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinais_mae?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          caso_autoctone?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          data_1a_dose_mae?: string | null
          data_2a_dose_mae?: string | null
          data_3a_dose_mae?: string | null
          data_encerramento?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_trismo?: string | null
          data_ultimo_reforco_mae?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          escolaridade_mae?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          id?: string
          idade?: number | null
          idade_mae?: number | null
          local_fonte_infeccao?: string | null
          local_ocorrencia_parto?: string | null
          local_residencia_coberta?: string | null
          logradouro?: string | null
          medidas_adotadas?: Json | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_consultas_pre_natal?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          numero_gestacoes?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          origem_caso?: string | null
          parto_atendido_por?: string | null
          raca_cor?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          sugou_normalmente?: string | null
          telefone?: string | null
          tipo_idade?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          zona?: string | null
        }
        Update: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinais_mae?: string | null
          antecedentes_vacinas?: string | null
          bairro?: string | null
          caso_autoctone?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          data_1a_dose_mae?: string | null
          data_2a_dose_mae?: string | null
          data_3a_dose_mae?: string | null
          data_encerramento?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_trismo?: string | null
          data_ultimo_reforco_mae?: string | null
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          escolaridade_mae?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          id?: string
          idade?: number | null
          idade_mae?: number | null
          local_fonte_infeccao?: string | null
          local_ocorrencia_parto?: string | null
          local_residencia_coberta?: string | null
          logradouro?: string | null
          medidas_adotadas?: Json | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_consultas_pre_natal?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          numero_gestacoes?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          origem_caso?: string | null
          parto_atendido_por?: string | null
          raca_cor?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          sugou_normalmente?: string | null
          telefone?: string | null
          tipo_idade?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          zona?: string | null
        }
        Relationships: []
      }
      tuberculose_cases: {
        Row: {
          agravo: string
          antecedentes_doencas: string | null
          antecedentes_vacinas: string | null
          baciloscopia_escarro: string | null
          bairro: string | null
          cep: string | null
          codigo_ibge_notificacao: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          created_at: string
          cultura: string | null
          data_diagnostico: string | null
          data_inicio_tratamento: string | null
          data_nascimento: string | null
          data_notificacao: string
          dc_data_internacao: string | null
          dc_data_primeiros_sintomas: string | null
          dc_evolucao_clinica: string | null
          dc_houve_hospitalizacao: string | null
          dc_sintomas: string | null
          dc_sintomas_outros: string | null
          doencas_agravos_associados: Json | null
          escolaridade: string | null
          forma: string | null
          funcao_investigador: string | null
          gestante: string | null
          histopatologia: string | null
          hiv: string | null
          id: string
          idade: number | null
          logradouro: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_endereco: string | null
          numero_ficha: string | null
          numero_prontuario: string | null
          observacoes_adicionais: string | null
          ocupacao: string | null
          populacoes_especiais: Json | null
          raca_cor: string | null
          radiografia_torax: string | null
          se_extrapulmonar: string | null
          sexo: string | null
          status: string
          telefone: string | null
          terapia_antirretroviral: string | null
          teste_sensibilidade: string | null
          tipo_entrada: string | null
          tipo_idade: string | null
          tmr_tb: string | null
          total_contatos_identificados: number | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          zona: string | null
        }
        Insert: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          baciloscopia_escarro?: string | null
          bairro?: string | null
          cep?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          cultura?: string | null
          data_diagnostico?: string | null
          data_inicio_tratamento?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          doencas_agravos_associados?: Json | null
          escolaridade?: string | null
          forma?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          histopatologia?: string | null
          hiv?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          numero_prontuario?: string | null
          observacoes_adicionais?: string | null
          ocupacao?: string | null
          populacoes_especiais?: Json | null
          raca_cor?: string | null
          radiografia_torax?: string | null
          se_extrapulmonar?: string | null
          sexo?: string | null
          status?: string
          telefone?: string | null
          terapia_antirretroviral?: string | null
          teste_sensibilidade?: string | null
          tipo_entrada?: string | null
          tipo_idade?: string | null
          tmr_tb?: string | null
          total_contatos_identificados?: number | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          zona?: string | null
        }
        Update: {
          agravo?: string
          antecedentes_doencas?: string | null
          antecedentes_vacinas?: string | null
          baciloscopia_escarro?: string | null
          bairro?: string | null
          cep?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          cultura?: string | null
          data_diagnostico?: string | null
          data_inicio_tratamento?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          dc_data_internacao?: string | null
          dc_data_primeiros_sintomas?: string | null
          dc_evolucao_clinica?: string | null
          dc_houve_hospitalizacao?: string | null
          dc_sintomas?: string | null
          dc_sintomas_outros?: string | null
          doencas_agravos_associados?: Json | null
          escolaridade?: string | null
          forma?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          histopatologia?: string | null
          hiv?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          numero_prontuario?: string | null
          observacoes_adicionais?: string | null
          ocupacao?: string | null
          populacoes_especiais?: Json | null
          raca_cor?: string | null
          radiografia_torax?: string | null
          se_extrapulmonar?: string | null
          sexo?: string | null
          status?: string
          telefone?: string | null
          terapia_antirretroviral?: string | null
          teste_sensibilidade?: string | null
          tipo_entrada?: string | null
          tipo_idade?: string | null
          tmr_tb?: string | null
          total_contatos_identificados?: number | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          zona?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "gestor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "gestor"],
    },
  },
} as const
