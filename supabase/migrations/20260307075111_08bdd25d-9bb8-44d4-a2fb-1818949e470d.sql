
-- Claim Attachments table
CREATE TABLE public.claim_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES public.insurance_claims(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  attachment_type TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.claim_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage claim attachments" ON public.claim_attachments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket for claim attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-attachments', 'claim-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload claim attachments" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'claim-attachments');

CREATE POLICY "Authenticated users can read claim attachments" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'claim-attachments');

CREATE POLICY "Authenticated users can delete claim attachments" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'claim-attachments');

-- Assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  serial_number TEXT,
  purchase_date DATE,
  purchase_cost NUMERIC(15,2) DEFAULT 0,
  location TEXT,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  warranty_expiry DATE,
  vendor_id UUID REFERENCES public.vendors(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage assets" ON public.assets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Maintenance Records table
CREATE TABLE public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  maintenance_type TEXT NOT NULL DEFAULT 'preventive',
  description TEXT,
  scheduled_date DATE,
  completed_date DATE,
  technician_name TEXT,
  cost NUMERIC(15,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage maintenance records" ON public.maintenance_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Housekeeping Tasks table
CREATE TABLE public.housekeeping_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  branch_id UUID REFERENCES public.branches(id),
  task_type TEXT NOT NULL DEFAULT 'cleaning',
  area TEXT NOT NULL,
  room_id TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage housekeeping tasks" ON public.housekeeping_tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Housekeeping Inspections table
CREATE TABLE public.housekeeping_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  task_id UUID REFERENCES public.housekeeping_tasks(id),
  area TEXT NOT NULL,
  inspector_id UUID REFERENCES public.profiles(id),
  checklist JSONB DEFAULT '[]',
  score NUMERIC(5,2),
  passed BOOLEAN DEFAULT false,
  photo_urls TEXT[],
  notes TEXT,
  inspected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.housekeeping_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage housekeeping inspections" ON public.housekeeping_inspections
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
