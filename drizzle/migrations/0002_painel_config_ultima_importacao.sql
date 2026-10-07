CREATE TABLE public.painel_config (
 chave text PRIMARY KEY,
 valor jsonb NOT NULL DEFAULT '{}'::jsonb,
 atualizado_por uuid,
 atualizado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.painel_config TO authenticated;
GRANT ALL ON public.painel_config TO service_role;
ALTER TABLE public.painel_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read panel configuration" ON public.painel_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert panel configuration" ON public.painel_config FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update panel configuration" ON public.painel_config FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete panel configuration" ON public.painel_config FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.painel_config_audit() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
 NEW.atualizado_por := auth.uid();
 NEW.atualizado_em := now();
 RETURN NEW;
END;
$$;
CREATE TRIGGER painel_config_audit BEFORE INSERT OR UPDATE ON public.painel_config FOR EACH ROW EXECUTE FUNCTION public.painel_config_audit();
CREATE FUNCTION public.painel_ultima_importacao() RETURNS timestamptz LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Autenticação necessária' USING ERRCODE = '42501'; END IF;
 RETURN (SELECT max(created_at) FROM public.system_logs WHERE
 action IN ('import','importacao','import_cases','import_csv','import_spreadsheet')
 OR entity_type IN ('import','importacao','case_import','spreadsheet_import')
 OR metadata->>'event' IN ('import.completed','import.success','case_import.completed','importacao')
 OR description ~* '(importad[oa]|importação (concluída|realizada)|importacao (concluida|realizada))');
END;
$$;
REVOKE ALL ON FUNCTION public.painel_ultima_importacao() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.painel_ultima_importacao() TO authenticated;
COMMENT ON FUNCTION public.painel_ultima_importacao() IS 'Returns only the latest recorded import timestamp to authenticated panel users; no log contents or personal data exposed. Existing system_logs RLS remains unchanged.';