-- =====================================================
-- Multi-Device PACS & Lab Analyzer Integration
-- =====================================================

-- 1. PACS Servers table - Multiple PACS server configurations
CREATE TABLE public.pacs_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  server_url TEXT NOT NULL,
  ae_title TEXT DEFAULT 'LOVABLE_HMS',
  username TEXT,
  password TEXT,
  modality_types TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_connection_check TIMESTAMPTZ,
  connection_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create updated_at trigger
CREATE TRIGGER update_pacs_servers_updated_at
  BEFORE UPDATE ON public.pacs_servers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for efficient lookup
CREATE INDEX idx_pacs_servers_org ON public.pacs_servers(organization_id);
CREATE INDEX idx_pacs_servers_branch ON public.pacs_servers(branch_id);

-- Enable RLS
ALTER TABLE public.pacs_servers ENABLE ROW LEVEL SECURITY;

-- RLS policies for pacs_servers
CREATE POLICY "Users can view their org PACS servers"
  ON public.pacs_servers
  FOR SELECT
  USING (public.has_permission('radiology.settings'));

CREATE POLICY "Users can insert PACS servers"
  ON public.pacs_servers
  FOR INSERT
  WITH CHECK (public.has_permission('radiology.settings'));

CREATE POLICY "Users can update PACS servers"
  ON public.pacs_servers
  FOR UPDATE
  USING (public.has_permission('radiology.settings'));

CREATE POLICY "Users can delete PACS servers"
  ON public.pacs_servers
  FOR DELETE
  USING (public.has_permission('radiology.settings'));

-- 2. Lab Analyzers table - Lab analyzer device registry
CREATE TABLE public.lab_analyzers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  analyzer_type TEXT NOT NULL, -- 'hematology', 'chemistry', 'urinalysis', 'coagulation', 'immunology', 'microbiology'
  connection_type TEXT DEFAULT 'manual', -- 'hl7', 'astm', 'api', 'manual'
  ip_address TEXT,
  port INTEGER,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  connection_status TEXT DEFAULT 'unknown', -- 'online', 'offline', 'unknown'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create updated_at trigger
CREATE TRIGGER update_lab_analyzers_updated_at
  BEFORE UPDATE ON public.lab_analyzers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_lab_analyzers_org ON public.lab_analyzers(organization_id);
CREATE INDEX idx_lab_analyzers_branch ON public.lab_analyzers(branch_id);
CREATE INDEX idx_lab_analyzers_type ON public.lab_analyzers(analyzer_type);

-- Enable RLS
ALTER TABLE public.lab_analyzers ENABLE ROW LEVEL SECURITY;

-- RLS policies for lab_analyzers
CREATE POLICY "Users can view their org lab analyzers"
  ON public.lab_analyzers
  FOR SELECT
  USING (public.has_permission('laboratory.settings'));

CREATE POLICY "Users can insert lab analyzers"
  ON public.lab_analyzers
  FOR INSERT
  WITH CHECK (public.has_permission('laboratory.settings'));

CREATE POLICY "Users can update lab analyzers"
  ON public.lab_analyzers
  FOR UPDATE
  USING (public.has_permission('laboratory.settings'));

CREATE POLICY "Users can delete lab analyzers"
  ON public.lab_analyzers
  FOR DELETE
  USING (public.has_permission('laboratory.settings'));

-- 3. Lab Analyzer Test Mappings - Link tests to analyzers
CREATE TABLE public.lab_analyzer_test_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analyzer_id UUID NOT NULL REFERENCES public.lab_analyzers(id) ON DELETE CASCADE,
  lab_test_template_id UUID NOT NULL REFERENCES public.lab_test_templates(id) ON DELETE CASCADE,
  analyzer_test_code TEXT NOT NULL,
  analyzer_test_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(analyzer_id, lab_test_template_id)
);

-- Indexes
CREATE INDEX idx_lab_analyzer_test_mappings_analyzer ON public.lab_analyzer_test_mappings(analyzer_id);
CREATE INDEX idx_lab_analyzer_test_mappings_test ON public.lab_analyzer_test_mappings(lab_test_template_id);

-- Enable RLS
ALTER TABLE public.lab_analyzer_test_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies for lab_analyzer_test_mappings
CREATE POLICY "Users can view test mappings via analyzer"
  ON public.lab_analyzer_test_mappings
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.lab_analyzers la
    WHERE la.id = analyzer_id AND public.has_permission('laboratory.settings')
  ));

CREATE POLICY "Users can insert test mappings"
  ON public.lab_analyzer_test_mappings
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.lab_analyzers la
    WHERE la.id = analyzer_id AND public.has_permission('laboratory.settings')
  ));

CREATE POLICY "Users can update test mappings"
  ON public.lab_analyzer_test_mappings
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.lab_analyzers la
    WHERE la.id = analyzer_id AND public.has_permission('laboratory.settings')
  ));

CREATE POLICY "Users can delete test mappings"
  ON public.lab_analyzer_test_mappings
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.lab_analyzers la
    WHERE la.id = analyzer_id AND public.has_permission('laboratory.settings')
  ));

-- 4. Modality to PACS Mappings - Link imaging modalities to PACS servers
CREATE TABLE public.imaging_modality_pacs_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modality_id UUID NOT NULL REFERENCES public.imaging_modalities(id) ON DELETE CASCADE,
  pacs_server_id UUID NOT NULL REFERENCES public.pacs_servers(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(modality_id, pacs_server_id)
);

-- Indexes
CREATE INDEX idx_modality_pacs_mappings_modality ON public.imaging_modality_pacs_mappings(modality_id);
CREATE INDEX idx_modality_pacs_mappings_pacs ON public.imaging_modality_pacs_mappings(pacs_server_id);

-- Enable RLS
ALTER TABLE public.imaging_modality_pacs_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies for imaging_modality_pacs_mappings
CREATE POLICY "Users can view modality PACS mappings"
  ON public.imaging_modality_pacs_mappings
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.pacs_servers ps
    WHERE ps.id = pacs_server_id AND public.has_permission('radiology.settings')
  ));

CREATE POLICY "Users can insert modality PACS mappings"
  ON public.imaging_modality_pacs_mappings
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pacs_servers ps
    WHERE ps.id = pacs_server_id AND public.has_permission('radiology.settings')
  ));

CREATE POLICY "Users can update modality PACS mappings"
  ON public.imaging_modality_pacs_mappings
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.pacs_servers ps
    WHERE ps.id = pacs_server_id AND public.has_permission('radiology.settings')
  ));

CREATE POLICY "Users can delete modality PACS mappings"
  ON public.imaging_modality_pacs_mappings
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.pacs_servers ps
    WHERE ps.id = pacs_server_id AND public.has_permission('radiology.settings')
  ));