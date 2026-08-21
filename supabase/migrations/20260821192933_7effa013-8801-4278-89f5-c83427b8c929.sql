DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'coqueluche_cases','dengue_chikungunya_cases','difteria_cases','epizootia_cases',
    'exantematica_cases','febre_amarela_cases','hanseniase_cases','meningite_cases',
    'raiva_humana_cases','srag_cases','surto_dta_cases','tetano_acidental_cases',
    'tetano_neonatal_cases','tuberculose_cases'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_owner_or_staff', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_authenticated', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)', t || '_select_authenticated', t);
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated', t);
  END LOOP;
END $$;