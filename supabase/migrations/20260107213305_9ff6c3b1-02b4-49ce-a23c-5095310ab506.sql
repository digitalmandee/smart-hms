-- Create lab order status enum
CREATE TYPE lab_order_status AS ENUM ('ordered', 'collected', 'processing', 'completed', 'cancelled');

-- Create lab order priority enum
CREATE TYPE lab_order_priority AS ENUM ('routine', 'urgent', 'stat');

-- Create lab item status enum
CREATE TYPE lab_item_status AS ENUM ('pending', 'collected', 'processing', 'completed');

-- Create lab_orders table
CREATE TABLE public.lab_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  priority lab_order_priority NOT NULL DEFAULT 'routine',
  clinical_notes TEXT,
  status lab_order_status NOT NULL DEFAULT 'ordered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create lab_order_items table
CREATE TABLE public.lab_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_order_id UUID NOT NULL REFERENCES public.lab_orders(id) ON DELETE CASCADE,
  service_type_id UUID REFERENCES public.service_types(id),
  test_name TEXT NOT NULL,
  test_category TEXT NOT NULL DEFAULT 'blood',
  instructions TEXT,
  result TEXT,
  result_date TIMESTAMPTZ,
  status lab_item_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_lab_orders_consultation ON lab_orders(consultation_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);
CREATE INDEX idx_lab_order_items_order ON lab_order_items(lab_order_id);

-- Create trigger function for auto-generating order number
CREATE OR REPLACE FUNCTION public.generate_lab_order_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 5 + LENGTH(date_part)) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.lab_orders
  WHERE order_number LIKE 'LO-' || date_part || '-%';
  
  NEW.order_number := 'LO-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
CREATE TRIGGER generate_lab_order_number_trigger
BEFORE INSERT ON public.lab_orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_lab_order_number();

-- Add updated_at trigger
CREATE TRIGGER update_lab_orders_updated_at
BEFORE UPDATE ON public.lab_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lab_orders
CREATE POLICY "Users can view lab orders in their organization"
ON public.lab_orders FOR SELECT
USING (branch_id IN (
  SELECT id FROM public.branches WHERE organization_id = public.get_user_organization_id()
));

CREATE POLICY "Users with consultation permission can create lab orders"
ON public.lab_orders FOR INSERT
WITH CHECK (public.has_permission('consultations.create'));

CREATE POLICY "Users with consultation permission can update lab orders"
ON public.lab_orders FOR UPDATE
USING (public.has_permission('consultations.update'));

-- RLS Policies for lab_order_items
CREATE POLICY "Users can view lab order items in their organization"
ON public.lab_order_items FOR SELECT
USING (lab_order_id IN (
  SELECT id FROM public.lab_orders WHERE branch_id IN (
    SELECT id FROM public.branches WHERE organization_id = public.get_user_organization_id()
  )
));

CREATE POLICY "Users with consultation permission can create lab order items"
ON public.lab_order_items FOR INSERT
WITH CHECK (lab_order_id IN (
  SELECT id FROM public.lab_orders WHERE public.has_permission('consultations.create')
));

CREATE POLICY "Users with consultation permission can update lab order items"
ON public.lab_order_items FOR UPDATE
USING (lab_order_id IN (
  SELECT id FROM public.lab_orders WHERE public.has_permission('consultations.update')
));