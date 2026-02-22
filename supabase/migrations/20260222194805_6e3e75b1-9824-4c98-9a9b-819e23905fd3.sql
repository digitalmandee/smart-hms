
-- Create vendor-documents storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-documents', 'vendor-documents', false);

-- RLS policies for vendor-documents bucket
CREATE POLICY "Authenticated users can upload vendor documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vendor-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read vendor documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete vendor documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'vendor-documents' AND auth.role() = 'authenticated');
