
-- =============================================
-- WAREHOUSE MANAGEMENT MODULE - FULL MIGRATION
-- =============================================

-- 1. New Enums
CREATE TYPE public.store_type AS ENUM ('central', 'medical', 'surgical', 'dental', 'equipment', 'pharmacy', 'general');
CREATE TYPE public.transfer_status AS ENUM ('draft', 'pending', 'approved', 'in_transit', 'received', 'cancelled');

-- 2. New Table: stores (Warehouses)
CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  name text NOT NULL,
  code text,
  store_type public.store_type NOT NULL DEFAULT 'general',
  description text,
  manager_id uuid REFERENCES public.profiles(id),
  is_central boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  location_info jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_stores_central_per_branch ON public.stores (branch_id) WHERE is_central = true;
CREATE INDEX idx_stores_organization ON public.stores (organization_id);
CREATE INDEX idx_stores_branch ON public.stores (branch_id);
CREATE INDEX idx_stores_manager ON public.stores (manager_id);

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add store_id to existing tables
ALTER TABLE public.inventory_stock ADD COLUMN store_id uuid REFERENCES public.stores(id);
CREATE INDEX idx_inventory_stock_store ON public.inventory_stock (store_id);

ALTER TABLE public.medicine_inventory ADD COLUMN store_id uuid REFERENCES public.stores(id);
CREATE INDEX idx_medicine_inventory_store ON public.medicine_inventory (store_id);

ALTER TABLE public.purchase_orders ADD COLUMN store_id uuid REFERENCES public.stores(id);
CREATE INDEX idx_purchase_orders_store ON public.purchase_orders (store_id);

ALTER TABLE public.goods_received_notes ADD COLUMN store_id uuid REFERENCES public.stores(id);
CREATE INDEX idx_goods_received_notes_store ON public.goods_received_notes (store_id);

ALTER TABLE public.stock_requisitions ADD COLUMN from_store_id uuid REFERENCES public.stores(id);
ALTER TABLE public.stock_requisitions ADD COLUMN to_store_id uuid REFERENCES public.stores(id);
CREATE INDEX idx_stock_requisitions_from_store ON public.stock_requisitions (from_store_id);
CREATE INDEX idx_stock_requisitions_to_store ON public.stock_requisitions (to_store_id);

-- 4. Inter-Warehouse Transfer Tables
CREATE TABLE public.store_stock_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  transfer_number text NOT NULL,
  from_store_id uuid NOT NULL REFERENCES public.stores(id),
  to_store_id uuid NOT NULL REFERENCES public.stores(id),
  status public.transfer_status NOT NULL DEFAULT 'draft',
  requested_by uuid REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  dispatched_by uuid REFERENCES public.profiles(id),
  received_by uuid REFERENCES public.profiles(id),
  request_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_store_transfers_org ON public.store_stock_transfers (organization_id);
CREATE INDEX idx_store_transfers_from ON public.store_stock_transfers (from_store_id);
CREATE INDEX idx_store_transfers_to ON public.store_stock_transfers (to_store_id);
CREATE INDEX idx_store_transfers_status ON public.store_stock_transfers (status);

CREATE TRIGGER update_store_transfers_updated_at
  BEFORE UPDATE ON public.store_stock_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.store_stock_transfer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid NOT NULL REFERENCES public.store_stock_transfers(id) ON DELETE CASCADE,
  item_type text NOT NULL DEFAULT 'inventory',
  item_id uuid,
  medicine_id uuid,
  quantity_requested integer NOT NULL DEFAULT 0,
  quantity_sent integer NOT NULL DEFAULT 0,
  quantity_received integer NOT NULL DEFAULT 0,
  batch_number text,
  expiry_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_transfer_items_transfer ON public.store_stock_transfer_items (transfer_id);

-- 5. Auto-generate transfer number trigger
CREATE OR REPLACE FUNCTION public.generate_transfer_number()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $function$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(transfer_number FROM 14) AS INT)), 0) + 1
  INTO seq_num
  FROM public.store_stock_transfers
  WHERE organization_id = NEW.organization_id
    AND transfer_number LIKE 'TRF-' || date_part || '-%';
  
  NEW.transfer_number := 'TRF-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_transfer_number
  BEFORE INSERT ON public.store_stock_transfers
  FOR EACH ROW
  WHEN (NEW.transfer_number IS NULL OR NEW.transfer_number = '')
  EXECUTE FUNCTION public.generate_transfer_number();

-- 6. RLS Policies
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stores in their organization"
  ON public.stores FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage stores"
  ON public.stores FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE public.store_stock_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transfers in their organization"
  ON public.store_stock_transfers FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage transfers"
  ON public.store_stock_transfers FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE public.store_stock_transfer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transfer items"
  ON public.store_stock_transfer_items FOR SELECT
  TO authenticated
  USING (transfer_id IN (
    SELECT id FROM public.store_stock_transfers 
    WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  ));

CREATE POLICY "Admins can manage transfer items"
  ON public.store_stock_transfer_items FOR ALL
  TO authenticated
  USING (transfer_id IN (
    SELECT id FROM public.store_stock_transfers 
    WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  ))
  WITH CHECK (transfer_id IN (
    SELECT id FROM public.store_stock_transfers 
    WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  ));

-- 7. Seed Central Warehouses for existing branches
INSERT INTO public.stores (organization_id, branch_id, name, code, store_type, is_central, is_active)
SELECT 
  b.organization_id,
  b.id,
  'Central Warehouse',
  'CW-' || ROW_NUMBER() OVER (PARTITION BY b.organization_id ORDER BY b.name),
  'central',
  true,
  true
FROM public.branches b;

-- 8. Update existing stock to point to central store
UPDATE public.inventory_stock ist
SET store_id = s.id
FROM public.stores s
WHERE s.branch_id = ist.branch_id AND s.is_central = true;

UPDATE public.medicine_inventory mi
SET store_id = s.id
FROM public.stores s
WHERE s.branch_id = mi.branch_id AND s.is_central = true;

-- 9. Permissions
INSERT INTO public.permissions (code, name, description, module)
VALUES 
  ('inventory.stores.manage', 'Manage Stores/Warehouses', 'Create, edit, and manage warehouse stores', 'inventory'),
  ('inventory.transfers.manage', 'Manage Store Transfers', 'Create and manage inter-store transfers', 'inventory')
ON CONFLICT (code) DO NOTHING;

-- Grant to admin roles and store_manager
INSERT INTO public.role_permissions (role, permission_id, is_granted)
SELECT r.role, p.id, true
FROM (VALUES ('super_admin'::app_role), ('org_admin'::app_role), ('branch_admin'::app_role), ('store_manager'::app_role)) AS r(role)
CROSS JOIN public.permissions p
WHERE p.code IN ('inventory.stores.manage', 'inventory.transfers.manage')
ON CONFLICT DO NOTHING;

-- 10. Menu items for warehouse management
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active, required_permission)
VALUES
  ('inventory_stores', 'Warehouses', 'Warehouse', '/app/inventory/stores', 
   (SELECT id FROM public.menu_items WHERE code = 'inventory_dashboard' LIMIT 1), 
   10, true, 'inventory.stores.manage'),
  ('inventory_transfers', 'Store Transfers', 'ArrowLeftRight', '/app/inventory/transfers',
   (SELECT id FROM public.menu_items WHERE code = 'inventory_dashboard' LIMIT 1),
   11, true, 'inventory.transfers.manage');
