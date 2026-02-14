
-- 1. Store racks table
CREATE TABLE public.store_racks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  rack_code text NOT NULL,
  rack_name text,
  section text,
  capacity_info jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, rack_code)
);

ALTER TABLE public.store_racks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage racks in their org"
  ON public.store_racks FOR ALL TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 2. Medicine-to-rack assignments
CREATE TABLE public.medicine_rack_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  rack_id uuid NOT NULL REFERENCES public.store_racks(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  shelf_number text,
  position text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(medicine_id, store_id)
);

ALTER TABLE public.medicine_rack_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage rack assignments in their org"
  ON public.medicine_rack_assignments FOR ALL TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 3. Add context column to stores
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS context text NOT NULL DEFAULT 'hospital';

-- 4. Triggers for updated_at
CREATE TRIGGER update_store_racks_updated_at
  BEFORE UPDATE ON public.store_racks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicine_rack_assignments_updated_at
  BEFORE UPDATE ON public.medicine_rack_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
