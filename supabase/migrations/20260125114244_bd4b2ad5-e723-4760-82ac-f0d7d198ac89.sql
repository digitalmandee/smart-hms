-- Add 'booked' and 'confirmed' status to surgery_status enum
ALTER TYPE surgery_status ADD VALUE IF NOT EXISTS 'booked' BEFORE 'pre_op';
ALTER TYPE surgery_status ADD VALUE IF NOT EXISTS 'confirmed' BEFORE 'pre_op';