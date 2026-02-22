
-- Phase 1: Shift Handovers table
CREATE TABLE public.shift_handovers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID REFERENCES public.stores(id),
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL DEFAULT 'morning',
  handed_over_by UUID REFERENCES public.profiles(id),
  received_by UUID REFERENCES public.profiles(id),
  pending_receipts TEXT,
  pending_dispatches TEXT,
  issues_notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shift_handovers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view shift handovers in their org" ON public.shift_handovers FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can create shift handovers" ON public.shift_handovers FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update shift handovers" ON public.shift_handovers FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete shift handovers" ON public.shift_handovers FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Phase 1: Safety Incidents table
CREATE TABLE public.safety_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID REFERENCES public.stores(id),
  incident_date DATE NOT NULL,
  incident_type TEXT NOT NULL DEFAULT 'other',
  severity TEXT NOT NULL DEFAULT 'minor',
  description TEXT,
  reported_by UUID REFERENCES public.profiles(id),
  location TEXT,
  action_taken TEXT,
  status TEXT NOT NULL DEFAULT 'reported',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view safety incidents in their org" ON public.safety_incidents FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can create safety incidents" ON public.safety_incidents FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update safety incidents" ON public.safety_incidents FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Phase 3: Warehouse Orders
CREATE TABLE public.warehouse_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID REFERENCES public.stores(id),
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  required_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.warehouse_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view warehouse orders in their org" ON public.warehouse_orders FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can create warehouse orders" ON public.warehouse_orders FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update warehouse orders" ON public.warehouse_orders FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete warehouse orders" ON public.warehouse_orders FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Auto-generate order number
CREATE OR REPLACE FUNCTION public.generate_warehouse_order_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 13) AS INT)), 0) + 1
  INTO seq_num FROM public.warehouse_orders
  WHERE organization_id = NEW.organization_id AND order_number LIKE 'WO-' || date_part || '-%';
  NEW.order_number := 'WO-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;
CREATE TRIGGER generate_warehouse_order_number_trigger BEFORE INSERT ON public.warehouse_orders FOR EACH ROW WHEN (NEW.order_number IS NULL OR NEW.order_number = '') EXECUTE FUNCTION public.generate_warehouse_order_number();

CREATE TABLE public.warehouse_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.warehouse_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory_items(id),
  quantity NUMERIC NOT NULL DEFAULT 0,
  picked_quantity NUMERIC NOT NULL DEFAULT 0,
  packed_quantity NUMERIC NOT NULL DEFAULT 0,
  notes TEXT
);
ALTER TABLE public.warehouse_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view order items via order" ON public.warehouse_order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.warehouse_orders wo WHERE wo.id = order_id AND wo.organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Users can insert order items" ON public.warehouse_order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.warehouse_orders wo WHERE wo.id = order_id AND wo.organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Users can update order items" ON public.warehouse_order_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.warehouse_orders wo WHERE wo.id = order_id AND wo.organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Users can delete order items" ON public.warehouse_order_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.warehouse_orders wo WHERE wo.id = order_id AND wo.organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

-- Link pick lists to orders
ALTER TABLE public.pick_lists ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.warehouse_orders(id);

-- Phase 4: Dock Appointments
CREATE TABLE public.dock_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID REFERENCES public.stores(id),
  appointment_type TEXT NOT NULL DEFAULT 'inbound',
  dock_number TEXT,
  vehicle_number TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  scheduled_time TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,
  po_id UUID REFERENCES public.purchase_orders(id),
  shipment_id UUID REFERENCES public.shipments(id),
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dock_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view dock appointments in their org" ON public.dock_appointments FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can create dock appointments" ON public.dock_appointments FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update dock appointments" ON public.dock_appointments FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete dock appointments" ON public.dock_appointments FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Gate Logs
CREATE TABLE public.gate_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  store_id UUID REFERENCES public.stores(id),
  vehicle_number TEXT NOT NULL,
  driver_name TEXT,
  entry_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  exit_time TIMESTAMPTZ,
  purpose TEXT NOT NULL DEFAULT 'delivery',
  dock_appointment_id UUID REFERENCES public.dock_appointments(id),
  logged_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gate_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view gate logs in their org" ON public.gate_logs FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can create gate logs" ON public.gate_logs FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update gate logs" ON public.gate_logs FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Phase 5: QC Status on GRN Items
ALTER TABLE public.grn_items ADD COLUMN IF NOT EXISTS qc_status TEXT NOT NULL DEFAULT 'passed';

-- Phase 7: Vendor Documents
CREATE TABLE public.vendor_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL DEFAULT 'other',
  document_name TEXT NOT NULL,
  file_url TEXT,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vendor_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view vendor documents in their org" ON public.vendor_documents FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can create vendor documents" ON public.vendor_documents FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update vendor documents" ON public.vendor_documents FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete vendor documents" ON public.vendor_documents FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Auto-post shipping costs to journal trigger
CREATE OR REPLACE FUNCTION public.post_shipping_cost_to_journal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_shipping_expense_account UUID;
  v_cash_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_org_id UUID;
BEGIN
  IF NEW.status = 'dispatched' AND (OLD.status IS NULL OR OLD.status != 'dispatched') AND COALESCE(NEW.shipping_cost, 0) > 0 THEN
    SELECT organization_id INTO v_org_id FROM public.stores WHERE id = NEW.store_id;
    IF v_org_id IS NULL THEN RETURN NEW; END IF;
    v_shipping_expense_account := public.get_or_create_default_account(v_org_id, 'EXP-SHIP-001', 'Shipping Expense', 'expense');
    v_cash_account := public.get_or_create_default_account(v_org_id, 'CASH-001', 'Cash in Hand', 'asset');
    v_entry_number := 'JE-SHP-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    INSERT INTO public.journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (v_org_id, v_entry_number, CURRENT_DATE, 'Shipping cost: ' || NEW.shipment_number, 'shipment', NEW.id, true)
    RETURNING id INTO v_journal_id;
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_shipping_expense_account, 'Shipping cost', NEW.shipping_cost, 0);
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_cash_account, 'Shipping payment', 0, NEW.shipping_cost);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER post_shipping_cost_trigger AFTER UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.post_shipping_cost_to_journal();

-- Auto-post stock write-offs to journal trigger
CREATE OR REPLACE FUNCTION public.post_stock_writeoff_to_journal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_writeoff_account UUID;
  v_inventory_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_amount NUMERIC;
BEGIN
  IF NEW.adjustment_type IN ('write_off', 'damaged', 'expired') AND COALESCE(NEW.quantity, 0) != 0 THEN
    v_amount := ABS(COALESCE(NEW.quantity, 0) * COALESCE(NEW.unit_cost, 0));
    IF v_amount <= 0 THEN RETURN NEW; END IF;
    v_writeoff_account := public.get_or_create_default_account(NEW.organization_id, 'EXP-WO-001', 'Inventory Write-off', 'expense');
    v_inventory_account := public.get_or_create_default_account(NEW.organization_id, 'INV-001', 'Inventory Asset', 'asset');
    v_entry_number := 'JE-WO-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    INSERT INTO public.journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (NEW.organization_id, v_entry_number, CURRENT_DATE, 'Stock write-off: ' || NEW.adjustment_type, 'stock_adjustment', NEW.id, true)
    RETURNING id INTO v_journal_id;
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_writeoff_account, 'Inventory ' || NEW.adjustment_type, v_amount, 0);
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_inventory_account, 'Stock reduction', 0, v_amount);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER post_stock_writeoff_trigger AFTER INSERT ON public.stock_adjustments FOR EACH ROW EXECUTE FUNCTION public.post_stock_writeoff_to_journal();

-- Menu items for new warehouse pages
INSERT INTO public.menu_items (name, code, icon, path, parent_id, sort_order, is_active, required_permission)
SELECT 'Warehouse Orders', 'warehouse_orders', 'ShoppingCart', '/app/inventory/warehouse-orders', mi.id, 15, true, 'inventory.view'
FROM public.menu_items mi WHERE mi.code = 'warehouse_operations' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'warehouse_orders')
LIMIT 1;

INSERT INTO public.menu_items (name, code, icon, path, parent_id, sort_order, is_active, required_permission)
SELECT 'Dock Schedule', 'dock_schedule', 'Truck', '/app/inventory/dock-schedule', mi.id, 16, true, 'inventory.view'
FROM public.menu_items mi WHERE mi.code = 'warehouse_operations' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'dock_schedule')
LIMIT 1;

INSERT INTO public.menu_items (name, code, icon, path, parent_id, sort_order, is_active, required_permission)
SELECT 'Gate Log', 'gate_log', 'DoorOpen', '/app/inventory/gate-log', mi.id, 17, true, 'inventory.view'
FROM public.menu_items mi WHERE mi.code = 'warehouse_operations' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'gate_log')
LIMIT 1;

INSERT INTO public.menu_items (name, code, icon, path, parent_id, sort_order, is_active, required_permission)
SELECT 'Warehouse KPIs', 'warehouse_kpis', 'Gauge', '/app/inventory/warehouse-kpis', mi.id, 1, true, 'inventory.view'
FROM public.menu_items mi WHERE mi.code = 'inventory_reports' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'warehouse_kpis')
LIMIT 1;

INSERT INTO public.menu_items (name, code, icon, path, parent_id, sort_order, is_active, required_permission)
SELECT 'Shift Handover', 'shift_handover', 'ArrowRightLeft', '/app/hr/attendance/shift-handover', mi.id, 10, true, 'hr.view'
FROM public.menu_items mi WHERE mi.code = 'hr_attendance' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'shift_handover')
LIMIT 1;

INSERT INTO public.menu_items (name, code, icon, path, parent_id, sort_order, is_active, required_permission)
SELECT 'Safety Incidents', 'safety_incidents', 'AlertTriangle', '/app/hr/safety-incidents', mi.id, 20, true, 'hr.view'
FROM public.menu_items mi WHERE mi.code = 'hr_staff' AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'safety_incidents')
LIMIT 1;
