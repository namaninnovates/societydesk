
CREATE POLICY "complaint photos read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'complaint-photos');
CREATE POLICY "complaint photos insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'complaint-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "complaint photos delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'complaint-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
