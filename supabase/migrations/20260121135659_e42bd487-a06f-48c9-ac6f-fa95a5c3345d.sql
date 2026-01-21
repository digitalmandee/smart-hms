-- Add 'pending' value to admission_status enum
ALTER TYPE admission_status ADD VALUE IF NOT EXISTS 'pending' BEFORE 'admitted';

-- Add columns to track admission confirmation by nurse
ALTER TABLE admissions 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES profiles(id);