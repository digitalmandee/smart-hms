
-- Fix: Remove public/anon policies that expose sensitive patient and lab data

-- 1. Drop the policy allowing anonymous access to published lab orders
-- (exposes sensitive medical test results, clinical notes, patient identifiers)
DROP POLICY IF EXISTS "Public can view published lab reports" ON public.lab_orders;

-- 2. Drop the policy allowing anonymous access to lab order items
-- (exposes CBC, liver function, blood sugar results and clinical notes)
DROP POLICY IF EXISTS "Public can view items of published orders" ON public.lab_order_items;

-- 3. Drop the policy allowing anonymous access to patient records
-- (exposes full names, phone numbers, email, national IDs, addresses, blood group, medical details)
DROP POLICY IF EXISTS "Public can verify patient for published reports" ON public.patients;
