
DROP POLICY IF EXISTS "Anyone can log events" ON public.business_events;

CREATE POLICY "Log events for approved businesses"
  ON public.business_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id AND b.status = 'approved'
    )
    AND (user_id IS NULL OR user_id = auth.uid())
  );
