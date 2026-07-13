
CREATE POLICY "Review photos readable to authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'review-photos');

CREATE POLICY "Users upload their own review photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'review-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete their own review photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'review-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
