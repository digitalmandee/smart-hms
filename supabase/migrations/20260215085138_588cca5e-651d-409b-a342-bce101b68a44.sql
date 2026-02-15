
-- Create enum for AI context types
CREATE TYPE public.ai_context_type AS ENUM ('patient_intake', 'doctor_assist', 'general');

-- Create enum for AI suggestion types
CREATE TYPE public.ai_suggestion_type AS ENUM ('diagnosis', 'prescription', 'lab_order', 'soap_note');

-- AI Conversations table
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  context_type ai_context_type NOT NULL DEFAULT 'general',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Suggestions Log table
CREATE TABLE public.ai_suggestions_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  suggestion_type ai_suggestion_type NOT NULL,
  suggestion_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  accepted BOOLEAN DEFAULT NULL,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations (org-scoped)
CREATE POLICY "Users can view conversations in their org"
  ON public.ai_conversations FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create conversations in their org"
  ON public.ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update conversations in their org"
  ON public.ai_conversations FOR UPDATE
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- RLS Policies for ai_suggestions_log
CREATE POLICY "Users can view suggestions in their org"
  ON public.ai_suggestions_log FOR SELECT
  TO authenticated
  USING (conversation_id IN (
    SELECT id FROM public.ai_conversations WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can create suggestions"
  ON public.ai_suggestions_log FOR INSERT
  TO authenticated
  WITH CHECK (conversation_id IN (
    SELECT id FROM public.ai_conversations WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can update suggestions in their org"
  ON public.ai_suggestions_log FOR UPDATE
  TO authenticated
  USING (conversation_id IN (
    SELECT id FROM public.ai_conversations WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

-- Updated_at trigger for ai_conversations
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
