-- Add organization-level default settings
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,2) DEFAULT 17.00,
ADD COLUMN IF NOT EXISTS receipt_header TEXT,
ADD COLUMN IF NOT EXISTS receipt_footer TEXT DEFAULT 'Thank you for visiting!',
ADD COLUMN IF NOT EXISTS working_hours_start TIME DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS working_hours_end TIME DEFAULT '20:00',
ADD COLUMN IF NOT EXISTS working_days TEXT[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday','saturday'];

-- Add branch-level override settings
ALTER TABLE public.branches
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS receipt_header TEXT,
ADD COLUMN IF NOT EXISTS receipt_footer TEXT,
ADD COLUMN IF NOT EXISTS working_hours_start TIME,
ADD COLUMN IF NOT EXISTS working_hours_end TIME,
ADD COLUMN IF NOT EXISTS working_days TEXT[],
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Karachi';

-- Add comment explaining the inheritance pattern
COMMENT ON COLUMN public.branches.tax_rate IS 'Branch-specific tax rate. NULL means use organization default.';
COMMENT ON COLUMN public.branches.receipt_header IS 'Branch-specific receipt header. NULL means use organization default.';
COMMENT ON COLUMN public.branches.receipt_footer IS 'Branch-specific receipt footer. NULL means use organization default.';
COMMENT ON COLUMN public.branches.working_hours_start IS 'Branch-specific opening time. NULL means use organization default.';
COMMENT ON COLUMN public.branches.working_hours_end IS 'Branch-specific closing time. NULL means use organization default.';
COMMENT ON COLUMN public.branches.working_days IS 'Branch-specific working days. NULL means use organization default.';