DROP POLICY IF EXISTS "Authenticated can read app_state" ON public.app_state;
DROP POLICY IF EXISTS "Authenticated can insert app_state" ON public.app_state;
DROP POLICY IF EXISTS "Authenticated can update app_state" ON public.app_state;

CREATE POLICY "Admin can read app_state"
ON public.app_state
FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = 'canalbocarose@gmail.com');

CREATE POLICY "Admin can insert app_state"
ON public.app_state
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'email') = 'canalbocarose@gmail.com');

CREATE POLICY "Admin can update app_state"
ON public.app_state
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'canalbocarose@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'canalbocarose@gmail.com');