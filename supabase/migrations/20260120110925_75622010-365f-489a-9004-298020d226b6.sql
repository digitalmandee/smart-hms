-- Make session_id nullable for session-free POS operation
ALTER TABLE pharmacy_pos_transactions 
ALTER COLUMN session_id DROP NOT NULL;