-- Close all open billing sessions so Daily Closing wizard works
UPDATE billing_sessions
SET status = 'closed', closed_at = now(), updated_at = now()
WHERE status = 'open';