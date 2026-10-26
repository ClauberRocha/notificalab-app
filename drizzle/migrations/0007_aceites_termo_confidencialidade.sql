CREATE TABLE public.aceites_termo (
  user_id uuid NOT NULL,
  versao_termo text NOT NULL CHECK (length(btrim(versao_termo)) > 0),
  aceito_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, versao_termo)
);
GRANT SELECT ON public.aceites_termo TO authenticated;
GRANT INSERT (user_id, versao_termo) ON public.aceites_termo TO authenticated;
GRANT ALL ON public.aceites_termo TO service_role;
ALTER TABLE public.aceites_termo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own term acceptances" ON public.aceites_termo FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users accept terms for themselves" ON public.aceites_termo FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
COMMENT ON TABLE public.aceites_termo IS 'Immutable user acceptance history by confidentiality term version; acceptance time assigned by the database.';