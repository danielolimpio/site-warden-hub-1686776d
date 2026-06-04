CREATE TABLE public.app_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_state TO authenticated;
GRANT ALL ON public.app_state TO service_role;

ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read app_state"
  ON public.app_state FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated can insert app_state"
  ON public.app_state FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update app_state"
  ON public.app_state FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.app_state_touch()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END; $$;

CREATE TRIGGER app_state_touch_trg
  BEFORE INSERT OR UPDATE ON public.app_state
  FOR EACH ROW EXECUTE FUNCTION public.app_state_touch();

INSERT INTO public.app_state (id, data) VALUES ('global', '{}'::jsonb) ON CONFLICT DO NOTHING;