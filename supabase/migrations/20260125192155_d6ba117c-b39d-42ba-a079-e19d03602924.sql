-- Add completion_override_reason column to intra_op_notes table
ALTER TABLE public.intra_op_notes 
ADD COLUMN IF NOT EXISTS completion_override_reason TEXT;