
-- Create medical_knowledge table for RAG
CREATE TABLE public.medical_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('red_flags', 'drug_reference', 'clinical_guideline', 'symptom_guide')),
  condition TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar', 'ur')),
  source TEXT DEFAULT 'custom',
  priority INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GIN index for fast keyword array overlap searches
CREATE INDEX idx_medical_knowledge_keywords ON public.medical_knowledge USING GIN (keywords);
CREATE INDEX idx_medical_knowledge_category ON public.medical_knowledge (category);
CREATE INDEX idx_medical_knowledge_condition ON public.medical_knowledge (condition);
CREATE INDEX idx_medical_knowledge_language ON public.medical_knowledge (language);

-- Enable RLS
ALTER TABLE public.medical_knowledge ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active entries (global or their org)
CREATE POLICY "Authenticated users can read active medical knowledge"
ON public.medical_knowledge
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (organization_id IS NULL OR organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
);

-- Only users with admin permission can manage entries
CREATE POLICY "Admins can manage medical knowledge"
ON public.medical_knowledge
FOR ALL
TO authenticated
USING (public.has_permission('manage_settings'))
WITH CHECK (public.has_permission('manage_settings'));

-- Service role (edge functions) can read all active entries
CREATE POLICY "Service role can read all medical knowledge"
ON public.medical_knowledge
FOR SELECT
TO service_role
USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_medical_knowledge_updated_at
BEFORE UPDATE ON public.medical_knowledge
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
