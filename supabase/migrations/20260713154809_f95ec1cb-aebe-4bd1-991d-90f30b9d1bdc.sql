
-- 1) Review photos: restrict authenticated SELECT to uploader (folder = uid) or admin
DROP POLICY IF EXISTS "Review photos readable to authenticated" ON storage.objects;
CREATE POLICY "Review photo owners or admins can read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'review-photos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'admin')
    )
  );

-- 2) Staff: public read only for staff of approved/published businesses; owners & admins can still read their own
DROP POLICY IF EXISTS "Staff are viewable by everyone" ON public.staff;
CREATE POLICY "Staff of published businesses are viewable"
  ON public.staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = staff.business_id
        AND b.status = 'approved'
    )
  );
CREATE POLICY "Owners and admins can read their staff"
  ON public.staff FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = staff.business_id
        AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- 3) Businesses update: prevent owners from setting status to 'approved'
DROP POLICY IF EXISTS "Owners can update their business" ON public.businesses;
CREATE POLICY "Owners can update their business"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (auth.uid() = owner_id AND status <> 'approved')
  );
