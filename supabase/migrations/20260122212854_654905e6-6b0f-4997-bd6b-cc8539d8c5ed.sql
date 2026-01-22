-- Add color column to shifts table for visual identification in rosters
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366f1';

-- Add comment for documentation
COMMENT ON COLUMN public.shifts.color IS 'Hex color code for shift badge display in rosters';