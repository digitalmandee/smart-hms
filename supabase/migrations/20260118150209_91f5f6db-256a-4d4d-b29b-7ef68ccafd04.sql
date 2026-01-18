-- Enable RLS on available_modules table
ALTER TABLE available_modules ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Everyone can read available modules"
  ON available_modules FOR SELECT
  USING (true);