-- Add discharge_invoice_id to admissions to track the generated invoice
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS discharge_invoice_id UUID REFERENCES invoices(id);

-- Create discharge checklist items table to persist checklist state
CREATE TABLE IF NOT EXISTS discharge_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(admission_id, item_id)
);

-- Enable RLS on discharge_checklist_items
ALTER TABLE discharge_checklist_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for discharge_checklist_items
CREATE POLICY "Users can view discharge checklist items for their organization admissions"
  ON discharge_checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admissions a
      JOIN profiles p ON p.organization_id = a.organization_id
      WHERE a.id = discharge_checklist_items.admission_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert discharge checklist items for their organization admissions"
  ON discharge_checklist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admissions a
      JOIN profiles p ON p.organization_id = a.organization_id
      WHERE a.id = discharge_checklist_items.admission_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can update discharge checklist items for their organization admissions"
  ON discharge_checklist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admissions a
      JOIN profiles p ON p.organization_id = a.organization_id
      WHERE a.id = discharge_checklist_items.admission_id
      AND p.id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_discharge_checklist_items_updated_at
  BEFORE UPDATE ON discharge_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_discharge_checklist_admission 
  ON discharge_checklist_items(admission_id);