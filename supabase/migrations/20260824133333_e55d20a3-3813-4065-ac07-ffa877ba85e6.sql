DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'coqueluche_cases','dengue_chikungunya_cases','difteria_cases','epizootia_cases',
    'exantematica_cases','febre_amarela_cases','hanseniase_cases','meningite_cases',
    'raiva_humana_cases','srag_cases','surto_dta_cases','tetano_acidental_cases',
    'tetano_neonatal_cases','tuberculose_cases','profiles','user_roles','system_logs'])
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;