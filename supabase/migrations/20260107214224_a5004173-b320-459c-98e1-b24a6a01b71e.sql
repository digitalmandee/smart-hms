-- Add columns to lab_order_items for result storage
ALTER TABLE public.lab_order_items 
ADD COLUMN IF NOT EXISTS result_values jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS result_notes text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS performed_by uuid REFERENCES public.profiles(id);

-- Add columns to lab_orders for completion tracking
ALTER TABLE public.lab_orders 
ADD COLUMN IF NOT EXISTS completed_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS result_notes text DEFAULT NULL;

-- Create lab_test_templates table for structured result entry
CREATE TABLE IF NOT EXISTS public.lab_test_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  test_name text NOT NULL,
  test_category text NOT NULL DEFAULT 'blood',
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on lab_test_templates
ALTER TABLE public.lab_test_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for lab_test_templates
CREATE POLICY "Users can view lab test templates in their org or global"
  ON public.lab_test_templates FOR SELECT
  USING (organization_id IS NULL OR organization_id = get_user_organization_id());

CREATE POLICY "Org admins can manage their lab test templates"
  ON public.lab_test_templates FOR ALL
  USING ((organization_id = get_user_organization_id()) AND has_role(auth.uid(), 'org_admin'::app_role));

CREATE POLICY "Super admins can manage all lab test templates"
  ON public.lab_test_templates FOR ALL
  USING (is_super_admin());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lab_test_templates_org ON public.lab_test_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_templates_test_name ON public.lab_test_templates(test_name);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON public.lab_orders(status);
CREATE INDEX IF NOT EXISTS idx_lab_orders_priority ON public.lab_orders(priority);

-- Insert common lab test templates (global, organization_id = NULL)
INSERT INTO public.lab_test_templates (organization_id, test_name, test_category, fields) VALUES
(NULL, 'Complete Blood Count (CBC)', 'blood', '[
  {"name": "Hemoglobin", "unit": "g/dL", "normal_min": 12.0, "normal_max": 17.0},
  {"name": "WBC Count", "unit": "x10^9/L", "normal_min": 4.5, "normal_max": 11.0},
  {"name": "RBC Count", "unit": "x10^12/L", "normal_min": 4.5, "normal_max": 5.5},
  {"name": "Platelet Count", "unit": "x10^9/L", "normal_min": 150, "normal_max": 400},
  {"name": "Hematocrit", "unit": "%", "normal_min": 38, "normal_max": 50},
  {"name": "MCV", "unit": "fL", "normal_min": 80, "normal_max": 100},
  {"name": "MCH", "unit": "pg", "normal_min": 27, "normal_max": 33},
  {"name": "MCHC", "unit": "g/dL", "normal_min": 32, "normal_max": 36}
]'::jsonb),
(NULL, 'Liver Function Test (LFT)', 'blood', '[
  {"name": "Bilirubin Total", "unit": "mg/dL", "normal_min": 0.1, "normal_max": 1.2},
  {"name": "Bilirubin Direct", "unit": "mg/dL", "normal_min": 0, "normal_max": 0.3},
  {"name": "ALT (SGPT)", "unit": "U/L", "normal_min": 7, "normal_max": 56},
  {"name": "AST (SGOT)", "unit": "U/L", "normal_min": 10, "normal_max": 40},
  {"name": "ALP", "unit": "U/L", "normal_min": 44, "normal_max": 147},
  {"name": "GGT", "unit": "U/L", "normal_min": 9, "normal_max": 48},
  {"name": "Albumin", "unit": "g/dL", "normal_min": 3.5, "normal_max": 5.0},
  {"name": "Total Protein", "unit": "g/dL", "normal_min": 6.0, "normal_max": 8.3}
]'::jsonb),
(NULL, 'Renal Function Test (RFT)', 'blood', '[
  {"name": "Creatinine", "unit": "mg/dL", "normal_min": 0.7, "normal_max": 1.3},
  {"name": "Urea", "unit": "mg/dL", "normal_min": 7, "normal_max": 20},
  {"name": "BUN", "unit": "mg/dL", "normal_min": 6, "normal_max": 24},
  {"name": "eGFR", "unit": "mL/min/1.73m²", "normal_min": 90, "normal_max": 120},
  {"name": "Uric Acid", "unit": "mg/dL", "normal_min": 3.5, "normal_max": 7.2}
]'::jsonb),
(NULL, 'Lipid Profile', 'blood', '[
  {"name": "Total Cholesterol", "unit": "mg/dL", "normal_min": 0, "normal_max": 200},
  {"name": "LDL Cholesterol", "unit": "mg/dL", "normal_min": 0, "normal_max": 100},
  {"name": "HDL Cholesterol", "unit": "mg/dL", "normal_min": 40, "normal_max": 60},
  {"name": "Triglycerides", "unit": "mg/dL", "normal_min": 0, "normal_max": 150},
  {"name": "VLDL Cholesterol", "unit": "mg/dL", "normal_min": 5, "normal_max": 40}
]'::jsonb),
(NULL, 'Thyroid Panel', 'blood', '[
  {"name": "TSH", "unit": "mIU/L", "normal_min": 0.4, "normal_max": 4.0},
  {"name": "T3", "unit": "ng/dL", "normal_min": 80, "normal_max": 200},
  {"name": "T4", "unit": "µg/dL", "normal_min": 5.0, "normal_max": 12.0},
  {"name": "Free T3", "unit": "pg/mL", "normal_min": 2.0, "normal_max": 4.4},
  {"name": "Free T4", "unit": "ng/dL", "normal_min": 0.8, "normal_max": 1.8}
]'::jsonb),
(NULL, 'Fasting Blood Sugar', 'blood', '[
  {"name": "Glucose (Fasting)", "unit": "mg/dL", "normal_min": 70, "normal_max": 100}
]'::jsonb),
(NULL, 'HbA1c', 'blood', '[
  {"name": "HbA1c", "unit": "%", "normal_min": 4.0, "normal_max": 5.6}
]'::jsonb),
(NULL, 'Urine Routine', 'pathology', '[
  {"name": "Color", "unit": "", "normal_min": null, "normal_max": null, "type": "text"},
  {"name": "Appearance", "unit": "", "normal_min": null, "normal_max": null, "type": "text"},
  {"name": "pH", "unit": "", "normal_min": 4.5, "normal_max": 8.0},
  {"name": "Specific Gravity", "unit": "", "normal_min": 1.005, "normal_max": 1.030},
  {"name": "Protein", "unit": "", "normal_min": null, "normal_max": null, "type": "text"},
  {"name": "Glucose", "unit": "", "normal_min": null, "normal_max": null, "type": "text"},
  {"name": "Ketones", "unit": "", "normal_min": null, "normal_max": null, "type": "text"},
  {"name": "Blood", "unit": "", "normal_min": null, "normal_max": null, "type": "text"},
  {"name": "WBC", "unit": "/hpf", "normal_min": 0, "normal_max": 5},
  {"name": "RBC", "unit": "/hpf", "normal_min": 0, "normal_max": 2}
]'::jsonb);