REVOKE DELETE ON public.system_logs FROM anon, authenticated, service_role;
DROP POLICY IF EXISTS "Admins delete logs" ON public.system_logs;
CREATE OR REPLACE FUNCTION public.prevent_log_deletion() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$ BEGIN RAISE EXCEPTION 'Os logs de auditoria não podem ser apagados.' USING ERRCODE='42501'; END $$;
CREATE TRIGGER system_logs_no_delete BEFORE DELETE ON public.system_logs FOR EACH ROW EXECUTE FUNCTION public.prevent_log_deletion();
CREATE OR REPLACE FUNCTION public.case_soft_delete_guard() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Use exclusão lógica com motivo.' USING ERRCODE='42501'; END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.deleted_at IS NOT NULL OR NEW.deleted_by IS NOT NULL OR NEW.motivo_exclusao IS NOT NULL THEN RAISE EXCEPTION 'Ficha nova não pode estar excluída.' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 END IF;
 IF OLD.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Ficha excluída não pode ser alterada.' USING ERRCODE='42501'; END IF;
 IF NEW.deleted_at IS NOT NULL THEN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Apenas administradores podem excluir fichas.' USING ERRCODE='42501'; END IF;
  IF nullif(btrim(NEW.motivo_exclusao),'') IS NULL THEN RAISE EXCEPTION 'Informe o motivo da exclusão.' USING ERRCODE='23514'; END IF;
  NEW.motivo_exclusao := btrim(NEW.motivo_exclusao);
  NEW.deleted_at := clock_timestamp(); NEW.deleted_by := auth.uid();
 ELSIF NEW.deleted_by IS NOT NULL OR NEW.motivo_exclusao IS NOT NULL THEN RAISE EXCEPTION 'Metadados de exclusão exigem exclusão lógica.' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
DO $$ DECLARE t text; definition text; BEGIN
 FOREACH t IN ARRAY ARRAY['coqueluche_cases','dengue_chikungunya_cases','difteria_cases','epizootia_cases','exantematica_cases','febre_amarela_cases','hanseniase_cases','meningite_cases','raiva_humana_cases','srag_cases','surto_dta_cases','tetano_acidental_cases','tetano_neonatal_cases','tuberculose_cases'] LOOP
  EXECUTE format('ALTER TABLE public.%I ADD COLUMN deleted_at timestamptz, ADD COLUMN deleted_by uuid, ADD COLUMN motivo_exclusao text',t);
  EXECUTE format('REVOKE DELETE ON public.%I FROM anon, authenticated',t);
  EXECUTE format('CREATE TRIGGER case_soft_delete_guard BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.case_soft_delete_guard()',t);
 END LOOP;
 definition := pg_get_viewdef('public.vw_notificacoes'::regclass,true);
 definition := regexp_replace(definition, 'FROM ([a-z_]+_cases)(\s|$)', 'FROM \1 WHERE \1.deleted_at IS NULL\2', 'g');
 EXECUTE 'CREATE OR REPLACE VIEW public.vw_notificacoes WITH (security_invoker=true) AS ' || definition;
 SELECT pg_get_functiondef(oid) INTO definition FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname='painel_resumo' AND pronargs=5;
 definition := replace(definition,'FROM origem','FROM origem WHERE r->>''deleted_at'' IS NULL');
 EXECUTE definition;
END $$;