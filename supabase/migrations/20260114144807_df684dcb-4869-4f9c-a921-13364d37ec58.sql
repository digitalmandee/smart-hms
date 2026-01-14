-- Add employee_id to doctors table to link doctors with employees
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.employees(id);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_doctors_employee_id ON public.doctors(employee_id);

-- Add unique constraint to prevent multiple doctor records per employee
ALTER TABLE public.doctors 
ADD CONSTRAINT doctors_employee_id_unique UNIQUE (employee_id);

-- Update RLS policy to allow organization members to view doctors with employee data
DROP POLICY IF EXISTS "Users can view doctors in their organization" ON public.doctors;
CREATE POLICY "Users can view doctors in their organization" 
ON public.doctors 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Policy for inserting doctors
DROP POLICY IF EXISTS "Users can create doctors in their organization" ON public.doctors;
CREATE POLICY "Users can create doctors in their organization" 
ON public.doctors 
FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Policy for updating doctors
DROP POLICY IF EXISTS "Users can update doctors in their organization" ON public.doctors;
CREATE POLICY "Users can update doctors in their organization" 
ON public.doctors 
FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Policy for deleting doctors
DROP POLICY IF EXISTS "Users can delete doctors in their organization" ON public.doctors;
CREATE POLICY "Users can delete doctors in their organization" 
ON public.doctors 
FOR DELETE 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);