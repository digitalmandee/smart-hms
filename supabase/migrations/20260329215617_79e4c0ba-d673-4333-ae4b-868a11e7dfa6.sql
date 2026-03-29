
-- Create radiology-images storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('radiology-images', 'radiology-images', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for radiology-images bucket
CREATE POLICY "Authenticated users can upload radiology images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'radiology-images');

CREATE POLICY "Authenticated users can view radiology images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'radiology-images');

CREATE POLICY "Authenticated users can update radiology images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'radiology-images');

CREATE POLICY "Authenticated users can delete radiology images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'radiology-images');
