-- Fix IPD menu item paths to match actual routes
UPDATE menu_items SET path = '/app/ipd/wards' WHERE path = '/app/ipd/beds/wards';
UPDATE menu_items SET path = '/app/ipd/transfers' WHERE path = '/app/ipd/beds/transfers';
UPDATE menu_items SET path = '/app/ipd/nursing' WHERE path = '/app/ipd/nursing-notes';
UPDATE menu_items SET path = '/app/ipd/medication-chart' WHERE path = '/app/ipd/care/medications';
UPDATE menu_items SET path = '/app/ipd/emar' WHERE path = '/app/ipd/care/emar';
UPDATE menu_items SET path = '/app/ipd/history' WHERE path = '/app/ipd/admissions/history';
UPDATE menu_items SET path = '/app/ipd/discharge-billing' WHERE path = '/app/ipd/discharge/billing';
UPDATE menu_items SET path = '/app/ipd/discharge-summaries' WHERE path = '/app/ipd/discharge/summaries';
UPDATE menu_items SET path = '/app/ipd/diet-types' WHERE path = '/app/ipd/setup/diet-types';

-- Add building column to wards table for floor/building management
ALTER TABLE wards ADD COLUMN IF NOT EXISTS building VARCHAR(100);
ALTER TABLE wards ADD COLUMN IF NOT EXISTS room_section VARCHAR(100);