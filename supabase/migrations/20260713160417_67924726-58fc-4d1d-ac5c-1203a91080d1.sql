
-- 1) Remove the redundant, unrestricted update policy on businesses.
DROP POLICY IF EXISTS "Owners can update their own businesses" ON public.businesses;

-- 2) Tighten business-media storage write policies: require the uploader to
-- actually own at least one business (or be an admin), on top of the folder
-- check. Public read stays unchanged.
DROP POLICY IF EXISTS "Owners can upload business media" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update their business media" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete their business media" ON storage.objects;

CREATE POLICY "Owners can upload business media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.businesses b WHERE b.owner_id = auth.uid())
  )
);

CREATE POLICY "Owners can update their business media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.businesses b WHERE b.owner_id = auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'business-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.businesses b WHERE b.owner_id = auth.uid())
  )
);

CREATE POLICY "Owners can delete their business media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.businesses b WHERE b.owner_id = auth.uid())
  )
);
