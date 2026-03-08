
-- Add disinfection tracking to dialysis machines
ALTER TABLE public.dialysis_machines 
  ADD COLUMN IF NOT EXISTS last_disinfected_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_disinfection_due timestamptz;

-- Create dental_images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('dental-images', 'dental-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for dental images
CREATE POLICY "Authenticated users can upload dental images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dental-images');

CREATE POLICY "Authenticated users can view dental images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'dental-images');

CREATE POLICY "Authenticated users can delete dental images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'dental-images');
