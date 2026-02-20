
-- =============================================
-- Step 1: Purchase Request Tables
-- =============================================

-- Create PR status enum
CREATE TYPE public.pr_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'converted');

-- Purchase Requests table
CREATE TABLE public.purchase_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  store_id UUID REFERENCES public.stores(id),
  pr_number TEXT NOT NULL DEFAULT '',
  requested_by UUID REFERENCES auth.users(id),
  department TEXT,
  priority INTEGER DEFAULT 0,
  status public.pr_status NOT NULL DEFAULT 'draft',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Purchase Request Items table
CREATE TABLE public.purchase_request_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_request_id UUID NOT NULL REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory_items(id),
  medicine_id UUID REFERENCES public.medicines(id),
  quantity_requested NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_stock NUMERIC(15,2) DEFAULT 0,
  reorder_level NUMERIC(15,2) DEFAULT 0,
  estimated_unit_cost NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate PR number
CREATE OR REPLACE FUNCTION public.generate_pr_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(pr_number FROM 13) AS INT)), 0) + 1
  INTO seq_num
  FROM public.purchase_requests
  WHERE organization_id = NEW.organization_id
    AND pr_number LIKE 'PR-' || date_part || '-%';
  NEW.pr_number := 'PR-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_pr_number
  BEFORE INSERT ON public.purchase_requests
  FOR EACH ROW EXECUTE FUNCTION public.generate_pr_number();

-- Updated at trigger
CREATE TRIGGER update_purchase_requests_updated_at
  BEFORE UPDATE ON public.purchase_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Step 2: QC Columns on GRN
-- =============================================

-- Add QC columns to goods_received_notes
ALTER TABLE public.goods_received_notes
  ADD COLUMN IF NOT EXISTS qc_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS qc_notes TEXT,
  ADD COLUMN IF NOT EXISTS qc_checked_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS qc_checked_at TIMESTAMPTZ;

-- Add QC status column to grn_items (rejection_reason already exists)
ALTER TABLE public.grn_items
  ADD COLUMN IF NOT EXISTS qc_status TEXT DEFAULT 'pending';

-- =============================================
-- Step 3: RLS Policies
-- =============================================

ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view purchase requests in their org"
  ON public.purchase_requests FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create purchase requests in their org"
  ON public.purchase_requests FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update purchase requests in their org"
  ON public.purchase_requests FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete draft purchase requests"
  ON public.purchase_requests FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND status = 'draft'
  );

CREATE POLICY "Users can view PR items via purchase request"
  ON public.purchase_request_items FOR SELECT
  USING (purchase_request_id IN (
    SELECT id FROM public.purchase_requests WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage PR items"
  ON public.purchase_request_items FOR INSERT
  WITH CHECK (purchase_request_id IN (
    SELECT id FROM public.purchase_requests WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can update PR items"
  ON public.purchase_request_items FOR UPDATE
  USING (purchase_request_id IN (
    SELECT id FROM public.purchase_requests WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete PR items"
  ON public.purchase_request_items FOR DELETE
  USING (purchase_request_id IN (
    SELECT id FROM public.purchase_requests WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  ));
