-- Add surgeon and anesthetist roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'surgeon';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'anesthetist';