-- Create queue display configurations table
CREATE TABLE queue_display_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  display_type TEXT NOT NULL DEFAULT 'opd' CHECK (display_type IN ('opd', 'ipd', 'emergency', 'combined')),
  departments JSONB DEFAULT '[]'::jsonb,
  linked_kiosk_ids JSONB DEFAULT '[]'::jsonb,
  doctor_ids JSONB DEFAULT '[]'::jsonb,
  show_next_count INT DEFAULT 5,
  audio_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  display_settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add linked_display_id to kiosk_configs
ALTER TABLE kiosk_configs ADD COLUMN linked_display_id UUID REFERENCES queue_display_configs(id) ON DELETE SET NULL;

-- Add kiosk_id to appointments for tracking token source
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS kiosk_id UUID REFERENCES kiosk_configs(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE queue_display_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies for queue_display_configs
CREATE POLICY "Users can view queue displays for their organization"
ON queue_display_configs FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can manage queue displays for their organization"
ON queue_display_configs FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- Public access policy for display pages (unauthenticated access)
CREATE POLICY "Public can view active queue displays"
ON queue_display_configs FOR SELECT
USING (is_active = true);

-- Create index for performance
CREATE INDEX idx_queue_display_configs_org ON queue_display_configs(organization_id);
CREATE INDEX idx_queue_display_configs_branch ON queue_display_configs(branch_id);
CREATE INDEX idx_appointments_kiosk ON appointments(kiosk_id);

-- Function to auto-create queue display when kiosk is created
CREATE OR REPLACE FUNCTION create_queue_display_for_kiosk()
RETURNS TRIGGER AS $$
DECLARE
  display_id UUID;
  display_type TEXT;
BEGIN
  -- Determine display type based on kiosk type
  display_type := CASE 
    WHEN NEW.kiosk_type = 'emergency' THEN 'emergency'
    WHEN NEW.kiosk_type = 'ipd' THEN 'ipd'
    ELSE 'opd'
  END;
  
  -- Create queue display config
  INSERT INTO queue_display_configs (
    organization_id,
    branch_id,
    name,
    display_type,
    departments,
    linked_kiosk_ids
  ) VALUES (
    NEW.organization_id,
    NEW.branch_id,
    NEW.name || ' Display',
    display_type,
    NEW.departments,
    jsonb_build_array(NEW.id)
  ) RETURNING id INTO display_id;
  
  -- Link display to kiosk
  NEW.linked_display_id := display_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create display on kiosk insert
CREATE TRIGGER auto_create_queue_display
BEFORE INSERT ON kiosk_configs
FOR EACH ROW
EXECUTE FUNCTION create_queue_display_for_kiosk();

-- Add menu items for Queue Displays
INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active)
SELECT 
  'queue_displays',
  'Queue Displays',
  '/app/settings/queue-displays',
  'Tv',
  (SELECT id FROM menu_items WHERE code = 'settings'),
  20,
  true
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'queue_displays');