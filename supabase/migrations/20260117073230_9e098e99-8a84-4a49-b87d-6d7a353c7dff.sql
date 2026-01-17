-- Add status column to kiosk_token_logs for queue integration
ALTER TABLE kiosk_token_logs ADD COLUMN IF NOT EXISTS status text DEFAULT 'waiting';
-- Values: 'waiting', 'called', 'in_progress', 'completed', 'no_show', 'cancelled'

-- Create trigger to sync appointment status to token logs
CREATE OR REPLACE FUNCTION sync_token_log_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Map appointment status to token log status
  UPDATE kiosk_token_logs
  SET status = CASE 
    WHEN NEW.status = 'checked_in' THEN 'waiting'
    WHEN NEW.status = 'in_progress' THEN 'in_progress'
    WHEN NEW.status = 'completed' THEN 'completed'
    WHEN NEW.status = 'no_show' THEN 'no_show'
    WHEN NEW.status = 'cancelled' THEN 'cancelled'
    ELSE 'waiting'
  END
  WHERE appointment_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on appointments table
DROP TRIGGER IF EXISTS sync_token_status ON appointments;
CREATE TRIGGER sync_token_status
AFTER UPDATE OF status ON appointments
FOR EACH ROW
EXECUTE FUNCTION sync_token_log_status();

-- Insert menu items for kiosk sessions and activity log
INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active)
SELECT 
  'kiosk_sessions', 
  'Kiosk Sessions', 
  '/app/settings/kiosks/sessions', 
  'Monitor', 
  (SELECT id FROM menu_items WHERE code = 'kiosk_management' LIMIT 1),
  16, 
  true
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'kiosk_sessions');

INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active)
SELECT 
  'kiosk_activity_log', 
  'Activity Log', 
  '/app/settings/kiosks/activity', 
  'FileText', 
  (SELECT id FROM menu_items WHERE code = 'kiosk_management' LIMIT 1),
  17, 
  true
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'kiosk_activity_log');