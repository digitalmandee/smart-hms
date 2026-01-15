
-- =====================================================
-- INVENTORY & PROCUREMENT MODULE - DATABASE SCHEMA
-- =====================================================

-- Enum Types
CREATE TYPE po_status AS ENUM ('draft', 'pending_approval', 'approved', 'ordered', 'partially_received', 'received', 'cancelled');
CREATE TYPE grn_status AS ENUM ('draft', 'pending_verification', 'verified', 'posted');
CREATE TYPE requisition_status AS ENUM ('draft', 'pending', 'approved', 'partially_issued', 'issued', 'rejected', 'cancelled');

-- =====================================================
-- 1. INVENTORY CATEGORIES
-- =====================================================
CREATE TABLE public.inventory_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org categories" ON public.inventory_categories
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can insert their org categories" ON public.inventory_categories
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can update their org categories" ON public.inventory_categories
  FOR UPDATE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can delete their org categories" ON public.inventory_categories
  FOR DELETE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- =====================================================
-- 2. INVENTORY ITEMS (Master Catalog)
-- =====================================================
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  unit_of_measure TEXT NOT NULL DEFAULT 'Unit',
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  standard_cost DECIMAL(12,2) DEFAULT 0,
  is_consumable BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, item_code)
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org items" ON public.inventory_items
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can insert their org items" ON public.inventory_items
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can update their org items" ON public.inventory_items
  FOR UPDATE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can delete their org items" ON public.inventory_items
  FOR DELETE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Item code generator
CREATE OR REPLACE FUNCTION public.generate_item_code()
RETURNS TRIGGER AS $$
DECLARE
  seq_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(item_code FROM 5) AS INT)), 0) + 1
  INTO seq_num
  FROM public.inventory_items
  WHERE organization_id = NEW.organization_id;
  
  NEW.item_code := 'ITM-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_item_code
  BEFORE INSERT ON public.inventory_items
  FOR EACH ROW
  WHEN (NEW.item_code IS NULL OR NEW.item_code = '')
  EXECUTE FUNCTION public.generate_item_code();

-- =====================================================
-- 3. VENDORS
-- =====================================================
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vendor_code TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Pakistan',
  payment_terms TEXT DEFAULT 'Net 30',
  tax_number TEXT,
  bank_details JSONB DEFAULT '{}'::jsonb,
  rating INTEGER DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, vendor_code)
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org vendors" ON public.vendors
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can insert their org vendors" ON public.vendors
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can update their org vendors" ON public.vendors
  FOR UPDATE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can delete their org vendors" ON public.vendors
  FOR DELETE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Vendor code generator
CREATE OR REPLACE FUNCTION public.generate_vendor_code()
RETURNS TRIGGER AS $$
DECLARE
  seq_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(vendor_code FROM 5) AS INT)), 0) + 1
  INTO seq_num
  FROM public.vendors
  WHERE organization_id = NEW.organization_id;
  
  NEW.vendor_code := 'VND-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_vendor_code
  BEFORE INSERT ON public.vendors
  FOR EACH ROW
  WHEN (NEW.vendor_code IS NULL OR NEW.vendor_code = '')
  EXECUTE FUNCTION public.generate_vendor_code();

-- =====================================================
-- 4. INVENTORY STOCK (with batch tracking)
-- =====================================================
CREATE TABLE public.inventory_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  batch_number TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  expiry_date DATE,
  location TEXT,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  grn_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org stock" ON public.inventory_stock
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.inventory_items i
      WHERE i.id = inventory_stock.item_id
      AND (i.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can insert their org stock" ON public.inventory_stock
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inventory_items i
      WHERE i.id = inventory_stock.item_id
      AND (i.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can update their org stock" ON public.inventory_stock
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.inventory_items i
      WHERE i.id = inventory_stock.item_id
      AND (i.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can delete their org stock" ON public.inventory_stock
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.inventory_items i
      WHERE i.id = inventory_stock.item_id
      AND (i.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

-- =====================================================
-- 5. PURCHASE ORDERS
-- =====================================================
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  status po_status NOT NULL DEFAULT 'draft',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  terms TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, po_number)
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org POs" ON public.purchase_orders
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can insert their org POs" ON public.purchase_orders
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can update their org POs" ON public.purchase_orders
  FOR UPDATE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can delete their org POs" ON public.purchase_orders
  FOR DELETE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- PO number generator
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM 13) AS INT)), 0) + 1
  INTO seq_num
  FROM public.purchase_orders
  WHERE organization_id = NEW.organization_id
    AND po_number LIKE 'PO-' || date_part || '-%';
  
  NEW.po_number := 'PO-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_po_number
  BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW
  WHEN (NEW.po_number IS NULL OR NEW.po_number = '')
  EXECUTE FUNCTION public.generate_po_number();

-- =====================================================
-- 6. PURCHASE ORDER ITEMS
-- =====================================================
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  received_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org PO items" ON public.purchase_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_items.purchase_order_id
      AND (po.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can insert their org PO items" ON public.purchase_order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_items.purchase_order_id
      AND (po.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can update their org PO items" ON public.purchase_order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_items.purchase_order_id
      AND (po.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can delete their org PO items" ON public.purchase_order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_items.purchase_order_id
      AND (po.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

-- =====================================================
-- 7. GOODS RECEIVED NOTES (GRN)
-- =====================================================
CREATE TABLE public.goods_received_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  grn_number TEXT NOT NULL,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_number TEXT,
  invoice_date DATE,
  invoice_amount DECIMAL(12,2),
  status grn_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  received_by UUID REFERENCES public.profiles(id),
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, grn_number)
);

ALTER TABLE public.goods_received_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org GRNs" ON public.goods_received_notes
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can insert their org GRNs" ON public.goods_received_notes
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can update their org GRNs" ON public.goods_received_notes
  FOR UPDATE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can delete their org GRNs" ON public.goods_received_notes
  FOR DELETE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- GRN number generator
CREATE OR REPLACE FUNCTION public.generate_grn_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(grn_number FROM 14) AS INT)), 0) + 1
  INTO seq_num
  FROM public.goods_received_notes
  WHERE organization_id = NEW.organization_id
    AND grn_number LIKE 'GRN-' || date_part || '-%';
  
  NEW.grn_number := 'GRN-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_grn_number
  BEFORE INSERT ON public.goods_received_notes
  FOR EACH ROW
  WHEN (NEW.grn_number IS NULL OR NEW.grn_number = '')
  EXECUTE FUNCTION public.generate_grn_number();

-- =====================================================
-- 8. GRN ITEMS
-- =====================================================
CREATE TABLE public.grn_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grn_id UUID NOT NULL REFERENCES public.goods_received_notes(id) ON DELETE CASCADE,
  po_item_id UUID REFERENCES public.purchase_order_items(id) ON DELETE SET NULL,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  quantity_received INTEGER NOT NULL DEFAULT 0,
  quantity_accepted INTEGER NOT NULL DEFAULT 0,
  quantity_rejected INTEGER NOT NULL DEFAULT 0,
  rejection_reason TEXT,
  batch_number TEXT,
  expiry_date DATE,
  unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.grn_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org GRN items" ON public.grn_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.goods_received_notes grn
      WHERE grn.id = grn_items.grn_id
      AND (grn.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can insert their org GRN items" ON public.grn_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goods_received_notes grn
      WHERE grn.id = grn_items.grn_id
      AND (grn.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can update their org GRN items" ON public.grn_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.goods_received_notes grn
      WHERE grn.id = grn_items.grn_id
      AND (grn.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can delete their org GRN items" ON public.grn_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.goods_received_notes grn
      WHERE grn.id = grn_items.grn_id
      AND (grn.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

-- =====================================================
-- 9. STOCK REQUISITIONS
-- =====================================================
CREATE TABLE public.stock_requisitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  requisition_number TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  required_date DATE,
  status requisition_status NOT NULL DEFAULT 'draft',
  priority INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  issued_by UUID REFERENCES public.profiles(id),
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, requisition_number)
);

ALTER TABLE public.stock_requisitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org requisitions" ON public.stock_requisitions
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can insert their org requisitions" ON public.stock_requisitions
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can update their org requisitions" ON public.stock_requisitions
  FOR UPDATE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can delete their org requisitions" ON public.stock_requisitions
  FOR DELETE USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Requisition number generator
CREATE OR REPLACE FUNCTION public.generate_requisition_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(requisition_number FROM 14) AS INT)), 0) + 1
  INTO seq_num
  FROM public.stock_requisitions
  WHERE organization_id = NEW.organization_id
    AND requisition_number LIKE 'REQ-' || date_part || '-%';
  
  NEW.requisition_number := 'REQ-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_requisition_number
  BEFORE INSERT ON public.stock_requisitions
  FOR EACH ROW
  WHEN (NEW.requisition_number IS NULL OR NEW.requisition_number = '')
  EXECUTE FUNCTION public.generate_requisition_number();

-- =====================================================
-- 10. REQUISITION ITEMS
-- =====================================================
CREATE TABLE public.requisition_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requisition_id UUID NOT NULL REFERENCES public.stock_requisitions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  quantity_requested INTEGER NOT NULL DEFAULT 1,
  quantity_approved INTEGER NOT NULL DEFAULT 0,
  quantity_issued INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.requisition_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org requisition items" ON public.requisition_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stock_requisitions r
      WHERE r.id = requisition_items.requisition_id
      AND (r.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can insert their org requisition items" ON public.requisition_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stock_requisitions r
      WHERE r.id = requisition_items.requisition_id
      AND (r.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can update their org requisition items" ON public.requisition_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.stock_requisitions r
      WHERE r.id = requisition_items.requisition_id
      AND (r.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can delete their org requisition items" ON public.requisition_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.stock_requisitions r
      WHERE r.id = requisition_items.requisition_id
      AND (r.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

-- =====================================================
-- 11. STOCK ADJUSTMENTS (for tracking changes)
-- =====================================================
CREATE TABLE public.stock_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('increase', 'decrease', 'write_off', 'expired', 'damaged', 'transfer_in', 'transfer_out')),
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  reference_type TEXT,
  reference_id UUID,
  adjusted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org adjustments" ON public.stock_adjustments
  FOR SELECT USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can insert their org adjustments" ON public.stock_adjustments
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================
CREATE TRIGGER update_inventory_categories_updated_at BEFORE UPDATE ON public.inventory_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_stock_updated_at BEFORE UPDATE ON public.inventory_stock FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goods_received_notes_updated_at BEFORE UPDATE ON public.goods_received_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stock_requisitions_updated_at BEFORE UPDATE ON public.stock_requisitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_inventory_items_org ON public.inventory_items(organization_id);
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category_id);
CREATE INDEX idx_inventory_stock_item ON public.inventory_stock(item_id);
CREATE INDEX idx_inventory_stock_branch ON public.inventory_stock(branch_id);
CREATE INDEX idx_vendors_org ON public.vendors(organization_id);
CREATE INDEX idx_purchase_orders_org ON public.purchase_orders(organization_id);
CREATE INDEX idx_purchase_orders_vendor ON public.purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_grn_org ON public.goods_received_notes(organization_id);
CREATE INDEX idx_grn_po ON public.goods_received_notes(purchase_order_id);
CREATE INDEX idx_requisitions_org ON public.stock_requisitions(organization_id);
CREATE INDEX idx_requisitions_status ON public.stock_requisitions(status);

-- Add grn_id foreign key to inventory_stock
ALTER TABLE public.inventory_stock
  ADD CONSTRAINT inventory_stock_grn_id_fkey
  FOREIGN KEY (grn_id) REFERENCES public.goods_received_notes(id) ON DELETE SET NULL;
