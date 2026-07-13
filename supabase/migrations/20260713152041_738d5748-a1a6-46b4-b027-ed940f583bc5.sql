
-- RLS policies for business-media storage bucket
CREATE POLICY "Public can read business media"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-media');

CREATE POLICY "Owners can upload business media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'business-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owners can update their business media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'business-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owners can delete their business media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'business-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
