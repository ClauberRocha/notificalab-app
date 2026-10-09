-- Run through the privileged database query tool; all fixtures are rolled back.
BEGIN;
DO $test$
DECLARE
 actor uuid; administrador uuid; n integer; blocked boolean; p record;
 a uuid:='00000000-0000-4000-8000-00000000bc01';
 b uuid:='00000000-0000-4000-8000-00000000bc02';
 c uuid:='00000000-0000-4000-8000-00000000bc03';
BEGIN
 SELECT id INTO actor FROM public.profiles WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=profiles.id AND role='admin') ORDER BY id LIMIT 1;
 SELECT user_id INTO administrador FROM public.user_roles WHERE role='admin' ORDER BY user_id LIMIT 1;
 IF actor IS NULL OR administrador IS NULL THEN RAISE EXCEPTION 'Test requires an existing nonadmin and admin'; END IF;
 FOR p IN SELECT * FROM pg_policies WHERE schemaname='public' AND tablename LIKE '%\_cases' LOOP
   IF p.cmd='INSERT' THEN
     IF p.with_check IS DISTINCT FROM '(auth.uid() = user_id)' THEN RAISE EXCEPTION 'INSERT changed: %',p.tablename; END IF;
   ELSIF p.cmd IN ('SELECT','UPDATE','DELETE') THEN
     IF position('pode_ver(' in p.qual)=0 THEN RAISE EXCEPTION 'Missing territory USING: %',p.tablename; END IF;
     IF p.cmd='UPDATE' AND position('pode_ver(' in p.with_check)=0 THEN RAISE EXCEPTION 'Missing territory WITH CHECK: %',p.tablename; END IF;
   ELSE RAISE EXCEPTION 'Unexpected policy operation'; END IF;
 END LOOP;
 SELECT count(*) INTO n FROM pg_policies WHERE schemaname='public' AND tablename LIKE '%\_cases';
 IF n<>56 THEN RAISE EXCEPTION 'Expected 56 case policies, got %',n; END IF;
 IF public.territorio_codigo_ibge('São Luís','MA') IS DISTINCT FROM '2111300' OR public.territorio_codigo_ibge('Balsas','MA') IS DISTINCT FROM '2101400' OR public.territorio_codigo_ibge('Balsas','PI') IS NOT NULL THEN RAISE EXCEPTION 'IBGE lookup mismatch'; END IF;
 DELETE FROM public.user_territorios WHERE user_id=actor;
 INSERT INTO public.meningite_cases(id,user_id,agravo,data_notificacao,nome_paciente,municipio_residencia,uf_residencia)
 VALUES (a,actor,'outras_meningites','2026-01-01','TEST ONLY','Balsas','MA'),(b,actor,'outras_meningites','2026-01-01','TEST ONLY','Alto Parnaíba','MA'),(c,actor,'outras_meningites','2026-01-01','TEST ONLY','São Luís','MA');
 IF (SELECT codigo_ibge_residencia FROM public.meningite_cases WHERE id=a) IS DISTINCT FROM '2101400' THEN RAISE EXCEPTION 'Trigger missing IBGE'; END IF;
 PERFORM set_config('request.jwt.claim.sub',actor::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 SELECT count(*) INTO n FROM public.meningite_cases WHERE id IN (a,b,c);
 IF n<>0 OR public.pode_ver('2101400') IS DISTINCT FROM false THEN RAISE EXCEPTION 'No territory must deny reads'; END IF;
 EXECUTE 'RESET ROLE';
 INSERT INTO public.user_territorios(user_id,nivel,regional,municipio_ibge) VALUES(actor,'municipal','BALSAS','2101400');
 EXECUTE 'SET LOCAL ROLE authenticated';
 SELECT count(*) INTO n FROM public.meningite_cases WHERE id IN (a,b,c);
 IF n<>1 OR public.pode_ver('2101400') IS DISTINCT FROM true OR public.pode_ver('2100501') IS DISTINCT FROM false THEN RAISE EXCEPTION 'Municipal restriction failed'; END IF;
 UPDATE public.meningite_cases SET nome_paciente='TEST UPDATED' WHERE id=a;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'Owner update inside territory failed'; END IF;
 UPDATE public.meningite_cases SET nome_paciente='TEST UPDATED' WHERE id=c;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>0 THEN RAISE EXCEPTION 'Outside territory update allowed'; END IF;
 blocked:=false;
 BEGIN
   UPDATE public.meningite_cases SET municipio_residencia='São Luís' WHERE id=a;
 EXCEPTION WHEN insufficient_privilege THEN blocked:=true;
 END;
 IF NOT blocked THEN RAISE EXCEPTION 'UPDATE WITH CHECK must block territory transfer'; END IF;
 DELETE FROM public.meningite_cases WHERE id=a;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>0 THEN RAISE EXCEPTION 'Nonadmin deletion allowed'; END IF;
 blocked:=false;
 BEGIN
   UPDATE public.user_territorios SET nivel='estadual',regional=NULL,municipio_ibge=NULL WHERE user_id=actor;
   GET DIAGNOSTICS n=ROW_COUNT;
   blocked:=(n=0);
 EXCEPTION WHEN insufficient_privilege THEN blocked:=true;
 END;
 IF NOT blocked THEN RAISE EXCEPTION 'Nonadmin changed own territory'; END IF;
 EXECUTE 'RESET ROLE';
 UPDATE public.user_territorios SET nivel='regional',municipio_ibge=NULL WHERE user_id=actor;
 EXECUTE 'SET LOCAL ROLE authenticated';
 SELECT count(*) INTO n FROM public.meningite_cases WHERE id IN (a,b,c);
 IF n<>2 OR public.pode_ver('2100501') IS DISTINCT FROM true OR public.pode_ver('2111300') IS DISTINCT FROM false THEN RAISE EXCEPTION 'Regional restriction failed'; END IF;
 EXECUTE 'RESET ROLE';
 UPDATE public.user_territorios SET nivel='estadual',regional=NULL WHERE user_id=actor;
 EXECUTE 'SET LOCAL ROLE authenticated';
 SELECT count(*) INTO n FROM public.meningite_cases WHERE id IN (a,b,c);
 IF n<>3 OR public.pode_ver('2111300') IS DISTINCT FROM true THEN RAISE EXCEPTION 'Statewide access failed'; END IF;
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',administrador::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',administrador,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 SELECT count(*) INTO n FROM public.meningite_cases WHERE id IN (a,b,c);
 IF n<>3 THEN RAISE EXCEPTION 'Admin read access failed'; END IF;
 DELETE FROM public.meningite_cases WHERE id=c;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'Admin delete failed'; END IF;
 EXECUTE 'RESET ROLE';
 RAISE NOTICE 'PASS: 14 table policies; IBGE trigger; municipal/regional/statewide/no territory/admin; UPDATE old/new; DELETE; territory write protection; INSERT definitions unchanged';
END;
$test$;
ROLLBACK;