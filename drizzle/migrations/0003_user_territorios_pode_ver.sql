CREATE TABLE public.user_territorios (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 municipio_ibge text,
 regional text,
 nivel text NOT NULL CHECK (nivel IN ('municipal','regional','estadual')),
 CONSTRAINT territorio_campos CHECK ((nivel='estadual' AND municipio_ibge IS NULL AND regional IS NULL) OR (nivel='regional' AND municipio_ibge IS NULL AND nullif(btrim(regional),'') IS NOT NULL) OR (nivel='municipal' AND municipio_ibge ~ '^21[0-9]{5}$' AND nullif(btrim(regional),'') IS NOT NULL))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_territorios TO authenticated;
GRANT ALL ON public.user_territorios TO service_role;
ALTER TABLE public.user_territorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY territorio_proprio ON public.user_territorios FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY territorio_admin_insert ON public.user_territorios FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY territorio_admin_update ON public.user_territorios FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY territorio_admin_delete ON public.user_territorios FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX user_territorios_user_id_idx ON public.user_territorios(user_id);
CREATE OR REPLACE FUNCTION public.territorio_regional(p_municipio_ibge text) RETURNS text LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path='' AS $$
SELECT CASE
WHEN p_municipio_ibge IN ('2100055','2102036','2102325','2103257','2105427','2110856','2111532','2112852') THEN 'ACAILANDIA'
WHEN p_municipio_ibge IN ('2100105','2100303','2102200','2103000','2103406','2103901','2111078') THEN 'CAXIAS'
WHEN p_municipio_ibge IN ('2100154','2100808','2100907','2102101','2103208','2106300','2106409','2106672','2108058','2110104','2110237','2110609','2112506') THEN 'CHAPADINHA'
WHEN p_municipio_ibge IN ('2100204','2107506','2109452','2111201','2111300') THEN 'METROPOLITANA'
WHEN p_municipio_ibge IN ('2100402','2101202','2102077','2102150','2103554','2105906','2106359','2107407','2108108','2111409','2113009') THEN 'BACABAL'
WHEN p_municipio_ibge IN ('2100436','2103307','2103604','2108454','2111508','2112100') THEN 'CODO'
WHEN p_municipio_ibge IN ('2100477','2101772','2102002','2104651','2105153','2106904','2108504','2108702','2109908','2110005','2111029','2111722','2112274') THEN 'SANTA INÊS'
WHEN p_municipio_ibge IN ('2100501','2101400','2104073','2104099','2104107','2106102','2107258','2109502','2109700','2110807','2111573','2111607','2112001') THEN 'BALSAS'
WHEN p_municipio_ibge IN ('2100550','2100873','2101970','2102606','2102903','2103158','2103174','2104305','2104677','2105658','2106201','2106326','2106375','2107357','2109239','2110039','2114007') THEN 'ZE DOCA'
WHEN p_municipio_ibge IN ('2100600','2102358','2102556','2102804','2103752','2104057','2104552','2105302','2105500','2105989','2107001','2109007','2109551','2111052','2111763','2111805') THEN 'IMPERATRIZ'
WHEN p_municipio_ibge IN ('2100709','2101004','2101731','2102705','2105401','2106631','2106755','2107209','2108801','2109304','2110401','2112605','2112704','2112902') THEN 'ITAPECURU'
WHEN p_municipio_ibge IN ('2100832','2101301','2101905','2103109','2103125','2103703','2104909','2106805','2108256','2108405','2108603','2109056','2109270','2109809','2111789','2112407','2112456') THEN 'PINHEIRO'
WHEN p_municipio_ibge IN ('2100956','2101608','2104081','2104800','2105351','2105476') THEN 'BARRA DO CORDA'
WHEN p_municipio_ibge IN ('2101103','2101251','2101707','2102374','2105005','2105104','2107100','2109205','2109403','2109601','2110203','2110278') THEN 'ROSÁRIO'
WHEN p_municipio_ibge IN ('2101350','2102408','2102507','2106508','2107456','2107605','2108306','2110500','2111003','2111706','2112803') THEN 'VIANA'
WHEN p_municipio_ibge IN ('2101509','2101806','2102309','2103505','2105450','2105922','2106706','2107308','2107704','2107902','2108009','2110658','2111102','2111904','2111953') THEN 'S.J. DOS PATOS'
WHEN p_municipio_ibge IN ('2101939','2104008','2105203','2105708','2105807','2105948','2105963','2106003','2108207','2108900','2111631','2111672','2112233') THEN 'PEDREIRAS'
WHEN p_municipio_ibge IN ('2102754','2103802','2104206','2104404','2104503','2104602','2104628','2104701','2105609','2109106','2109759','2110302','2110708','2111250','2111748','2112308') THEN 'PRESIDENTE DUTRA'
WHEN p_municipio_ibge IN ('2106607','2107803','2110906','2112209') THEN 'TIMON'
ELSE NULL END;
$$;
REVOKE ALL ON FUNCTION public.territorio_regional(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.territorio_regional(text) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.pode_ver(p_municipio_ibge text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
SELECT auth.uid() IS NOT NULL AND (
 public.has_role(auth.uid(),'admin') OR EXISTS (
 SELECT 1 FROM public.user_territorios t WHERE t.user_id=auth.uid() AND (
 t.nivel='estadual' OR (t.nivel='municipal' AND t.municipio_ibge=p_municipio_ibge)
 OR (t.nivel='regional' AND t.regional=public.territorio_regional(p_municipio_ibge))
 )));
$$;
REVOKE ALL ON FUNCTION public.pode_ver(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pode_ver(text) TO authenticated, service_role;