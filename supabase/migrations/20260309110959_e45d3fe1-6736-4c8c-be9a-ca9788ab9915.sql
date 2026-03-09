
-- Prevent a user from having more than one open session at a time
CREATE UNIQUE INDEX IF NOT EXISTS unique_open_session_per_user 
  ON billing_sessions (opened_by) 
  WHERE status = 'open';

-- Prevent a counter (branch+type) from having more than one open session
CREATE UNIQUE INDEX IF NOT EXISTS unique_open_session_per_counter 
  ON billing_sessions (branch_id, counter_type) 
  WHERE status = 'open';
