-- Cycle Count tables
CREATE TABLE public.cycle_counts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  zone_id UUID REFERENCES public.warehouse_zones(id),
  count_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
  count_type TEXT NOT NULL DEFAULT 'full' CHECK (count_type IN ('full', 'zone', 'random', 'abc')),
  assigned_to UUID REFERENCES public.profiles(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cycle_count_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_count_id UUID NOT NULL REFERENCES public.cycle_counts(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  bin_id UUID REFERENCES public.warehouse_bins(id),
  expected_quantity NUMERIC(15,2) NOT NULL DEFAULT 0,
  counted_quantity NUMERIC(15,2),
  variance NUMERIC(15,2),
  batch_number TEXT,
  notes TEXT,
  counted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Return to Vendor tables
CREATE TABLE public.return_to_vendor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  rtv_number TEXT NOT NULL,
  grn_id UUID REFERENCES public.goods_received_notes(id),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  store_id UUID REFERENCES public.stores(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'shipped', 'completed', 'cancelled')),
  reason TEXT,
  notes TEXT,
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.rtv_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rtv_id UUID NOT NULL REFERENCES public.return_to_vendor(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  quantity NUMERIC(15,2) NOT NULL,
  unit_cost NUMERIC(15,2) NOT NULL DEFAULT 0,
  reason TEXT,
  batch_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-number generators
CREATE OR REPLACE FUNCTION public.generate_cycle_count_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(count_number FROM 13) AS INT)), 0) + 1
  INTO seq_num FROM public.cycle_counts
  WHERE organization_id = NEW.organization_id AND count_number LIKE 'CC-' || date_part || '-%';
  NEW.count_number := 'CC-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_cycle_count_number
BEFORE INSERT ON public.cycle_counts
FOR EACH ROW EXECUTE FUNCTION public.generate_cycle_count_number();

CREATE OR REPLACE FUNCTION public.generate_rtv_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(rtv_number FROM 14) AS INT)), 0) + 1
  INTO seq_num FROM public.return_to_vendor
  WHERE organization_id = NEW.organization_id AND rtv_number LIKE 'RTV-' || date_part || '-%';
  NEW.rtv_number := 'RTV-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_rtv_number
BEFORE INSERT ON public.return_to_vendor
FOR EACH ROW EXECUTE FUNCTION public.generate_rtv_number();

-- Timestamp triggers
CREATE TRIGGER update_cycle_counts_updated_at
BEFORE UPDATE ON public.cycle_counts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_return_to_vendor_updated_at
BEFORE UPDATE ON public.return_to_vendor
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.cycle_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_count_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_to_vendor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rtv_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cycle counts in their org" ON public.cycle_counts
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage cycle counts in their org" ON public.cycle_counts
FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view cycle count items" ON public.cycle_count_items
FOR SELECT USING (cycle_count_id IN (SELECT id FROM public.cycle_counts WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Users can manage cycle count items" ON public.cycle_count_items
FOR ALL USING (cycle_count_id IN (SELECT id FROM public.cycle_counts WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Users can view RTVs in their org" ON public.return_to_vendor
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage RTVs in their org" ON public.return_to_vendor
FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view RTV items" ON public.rtv_items
FOR SELECT USING (rtv_id IN (SELECT id FROM public.return_to_vendor WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Users can manage RTV items" ON public.rtv_items
FOR ALL USING (rtv_id IN (SELECT id FROM public.return_to_vendor WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));