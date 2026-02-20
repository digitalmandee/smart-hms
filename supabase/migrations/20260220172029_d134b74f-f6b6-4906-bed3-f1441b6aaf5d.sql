
-- Warehouse Zones
CREATE TABLE public.warehouse_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  zone_code TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  zone_type TEXT NOT NULL DEFAULT 'storage',
  temperature_range TEXT,
  capacity_info JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, store_id, zone_code)
);

ALTER TABLE public.warehouse_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view warehouse zones in their org" ON public.warehouse_zones
  FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage warehouse zones" ON public.warehouse_zones
  FOR ALL TO authenticated USING (public.has_permission('warehouse.zones'))
  WITH CHECK (public.has_permission('warehouse.zones'));

CREATE TRIGGER update_warehouse_zones_updated_at BEFORE UPDATE ON public.warehouse_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Warehouse Bins
CREATE TABLE public.warehouse_bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  zone_id UUID REFERENCES public.warehouse_zones(id),
  rack_id UUID REFERENCES public.store_racks(id),
  bin_code TEXT NOT NULL,
  bin_type TEXT NOT NULL DEFAULT 'shelf',
  max_weight NUMERIC(10,2),
  max_volume NUMERIC(10,2),
  current_weight NUMERIC(10,2) DEFAULT 0,
  current_volume NUMERIC(10,2) DEFAULT 0,
  is_occupied BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, store_id, bin_code)
);

ALTER TABLE public.warehouse_bins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view warehouse bins in their org" ON public.warehouse_bins
  FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage warehouse bins" ON public.warehouse_bins
  FOR ALL TO authenticated USING (public.has_permission('warehouse.zones'))
  WITH CHECK (public.has_permission('warehouse.zones'));

CREATE TRIGGER update_warehouse_bins_updated_at BEFORE UPDATE ON public.warehouse_bins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inventory Bin Assignments
CREATE TABLE public.inventory_bin_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  bin_id UUID NOT NULL REFERENCES public.warehouse_bins(id),
  item_id UUID REFERENCES public.inventory_items(id),
  medicine_id UUID REFERENCES public.medicines(id),
  stock_id UUID,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.inventory_bin_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bin assignments in their org" ON public.inventory_bin_assignments
  FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage bin assignments" ON public.inventory_bin_assignments
  FOR ALL TO authenticated USING (public.has_permission('warehouse.zones'))
  WITH CHECK (public.has_permission('warehouse.zones'));

-- Put-Away Tasks
CREATE TABLE public.putaway_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  grn_id UUID REFERENCES public.goods_received_notes(id),
  item_id UUID REFERENCES public.inventory_items(id),
  medicine_id UUID REFERENCES public.medicines(id),
  stock_id UUID,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  suggested_bin_id UUID REFERENCES public.warehouse_bins(id),
  actual_bin_id UUID REFERENCES public.warehouse_bins(id),
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES public.profiles(id),
  priority INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.putaway_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view putaway tasks in their org" ON public.putaway_tasks
  FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage putaway tasks" ON public.putaway_tasks
  FOR ALL TO authenticated USING (public.has_permission('warehouse.putaway'))
  WITH CHECK (public.has_permission('warehouse.putaway'));

CREATE TRIGGER update_putaway_tasks_updated_at BEFORE UPDATE ON public.putaway_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pick Lists
CREATE TABLE public.pick_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  pick_list_number TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL DEFAULT 'requisition',
  source_id UUID,
  status TEXT NOT NULL DEFAULT 'draft',
  assigned_to UUID REFERENCES public.profiles(id),
  priority INTEGER NOT NULL DEFAULT 0,
  pick_strategy TEXT NOT NULL DEFAULT 'fifo',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pick_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pick lists in their org" ON public.pick_lists
  FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage pick lists" ON public.pick_lists
  FOR ALL TO authenticated USING (public.has_permission('warehouse.picking'))
  WITH CHECK (public.has_permission('warehouse.picking'));

CREATE TRIGGER update_pick_lists_updated_at BEFORE UPDATE ON public.pick_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_pick_list_number()
  RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(pick_list_number FROM 13) AS INT)), 0) + 1
  INTO seq_num FROM public.pick_lists
  WHERE organization_id = NEW.organization_id AND pick_list_number LIKE 'PL-' || date_part || '-%';
  NEW.pick_list_number := 'PL-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_pick_list_number_trigger BEFORE INSERT ON public.pick_lists
  FOR EACH ROW WHEN (NEW.pick_list_number IS NULL OR NEW.pick_list_number = '')
  EXECUTE FUNCTION public.generate_pick_list_number();

-- Pick List Items
CREATE TABLE public.pick_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pick_list_id UUID NOT NULL REFERENCES public.pick_lists(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory_items(id),
  medicine_id UUID REFERENCES public.medicines(id),
  quantity_required NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity_picked NUMERIC(12,2) NOT NULL DEFAULT 0,
  bin_id UUID REFERENCES public.warehouse_bins(id),
  batch_number TEXT,
  expiry_date DATE,
  pick_sequence INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  picked_at TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE public.pick_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pick list items via pick list" ON public.pick_list_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.pick_lists pl WHERE pl.id = pick_list_id AND pl.organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can manage pick list items" ON public.pick_list_items
  FOR ALL TO authenticated USING (public.has_permission('warehouse.picking'))
  WITH CHECK (public.has_permission('warehouse.picking'));

-- Packing Slips
CREATE TABLE public.packing_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  packing_slip_number TEXT NOT NULL DEFAULT '',
  pick_list_id UUID REFERENCES public.pick_lists(id),
  source_type TEXT,
  source_id UUID,
  status TEXT NOT NULL DEFAULT 'draft',
  packed_by UUID REFERENCES public.profiles(id),
  verified_by UUID REFERENCES public.profiles(id),
  total_items INTEGER NOT NULL DEFAULT 0,
  total_weight NUMERIC(10,2),
  box_count INTEGER NOT NULL DEFAULT 0,
  packed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.packing_slips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view packing slips in their org" ON public.packing_slips
  FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage packing slips" ON public.packing_slips
  FOR ALL TO authenticated USING (public.has_permission('warehouse.packing'))
  WITH CHECK (public.has_permission('warehouse.packing'));

CREATE TRIGGER update_packing_slips_updated_at BEFORE UPDATE ON public.packing_slips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_packing_slip_number()
  RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(packing_slip_number FROM 13) AS INT)), 0) + 1
  INTO seq_num FROM public.packing_slips
  WHERE organization_id = NEW.organization_id AND packing_slip_number LIKE 'PS-' || date_part || '-%';
  NEW.packing_slip_number := 'PS-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_packing_slip_number_trigger BEFORE INSERT ON public.packing_slips
  FOR EACH ROW WHEN (NEW.packing_slip_number IS NULL OR NEW.packing_slip_number = '')
  EXECUTE FUNCTION public.generate_packing_slip_number();

-- Packing Slip Items
CREATE TABLE public.packing_slip_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  packing_slip_id UUID NOT NULL REFERENCES public.packing_slips(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory_items(id),
  medicine_id UUID REFERENCES public.medicines(id),
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  batch_number TEXT,
  box_number INTEGER,
  notes TEXT
);

ALTER TABLE public.packing_slip_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view packing slip items via slip" ON public.packing_slip_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.packing_slips ps WHERE ps.id = packing_slip_id AND ps.organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can manage packing slip items" ON public.packing_slip_items
  FOR ALL TO authenticated USING (public.has_permission('warehouse.packing'))
  WITH CHECK (public.has_permission('warehouse.packing'));

-- Shipments
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  shipment_number TEXT NOT NULL DEFAULT '',
  packing_slip_id UUID REFERENCES public.packing_slips(id),
  transfer_id UUID REFERENCES public.store_stock_transfers(id),
  destination_type TEXT NOT NULL DEFAULT 'store',
  destination_id UUID,
  destination_address JSONB DEFAULT '{}',
  carrier_name TEXT,
  tracking_number TEXT,
  shipping_method TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'pending',
  estimated_delivery DATE,
  actual_delivery DATE,
  total_weight NUMERIC(10,2),
  total_boxes INTEGER,
  shipping_cost NUMERIC(12,2),
  dispatched_by UUID REFERENCES public.profiles(id),
  dispatched_at TIMESTAMPTZ,
  received_by_name TEXT,
  received_at TIMESTAMPTZ,
  proof_of_delivery TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shipments in their org" ON public.shipments
  FOR SELECT TO authenticated USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage shipments" ON public.shipments
  FOR ALL TO authenticated USING (public.has_permission('warehouse.shipping'))
  WITH CHECK (public.has_permission('warehouse.shipping'));

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_shipment_number()
  RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(shipment_number FROM 14) AS INT)), 0) + 1
  INTO seq_num FROM public.shipments
  WHERE organization_id = NEW.organization_id AND shipment_number LIKE 'SHP-' || date_part || '-%';
  NEW.shipment_number := 'SHP-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_shipment_number_trigger BEFORE INSERT ON public.shipments
  FOR EACH ROW WHEN (NEW.shipment_number IS NULL OR NEW.shipment_number = '')
  EXECUTE FUNCTION public.generate_shipment_number();

-- Shipment Tracking Events
CREATE TABLE public.shipment_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_description TEXT,
  location TEXT,
  event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipment_tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking events via shipment" ON public.shipment_tracking_events
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_id AND s.organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can manage tracking events" ON public.shipment_tracking_events
  FOR ALL TO authenticated USING (public.has_permission('warehouse.shipping'))
  WITH CHECK (public.has_permission('warehouse.shipping'));

-- Insert warehouse permissions
INSERT INTO public.permissions (code, name, module) VALUES
  ('warehouse.dashboard', 'View Warehouse Dashboard', 'warehouse'),
  ('warehouse.putaway', 'Manage Put-Away Tasks', 'warehouse'),
  ('warehouse.picking', 'Manage Picking', 'warehouse'),
  ('warehouse.packing', 'Manage Packing', 'warehouse'),
  ('warehouse.shipping', 'Manage Shipping', 'warehouse'),
  ('warehouse.zones', 'Manage Zones & Bins', 'warehouse'),
  ('warehouse.api_settings', 'Manage Integrations', 'warehouse')
ON CONFLICT DO NOTHING;

-- Grant all warehouse permissions to admin roles
INSERT INTO public.role_permissions (role, permission_id, is_granted)
SELECT r.role, p.id, true
FROM (VALUES ('warehouse_admin'::app_role), ('org_admin'::app_role), ('branch_admin'::app_role), ('store_manager'::app_role)) AS r(role)
CROSS JOIN public.permissions p
WHERE p.module = 'warehouse'
ON CONFLICT DO NOTHING;

-- Grant operational permissions to warehouse_user
INSERT INTO public.role_permissions (role, permission_id, is_granted)
SELECT 'warehouse_user'::app_role, p.id, true
FROM public.permissions p
WHERE p.module = 'warehouse' AND p.code != 'warehouse.api_settings'
ON CONFLICT DO NOTHING;
