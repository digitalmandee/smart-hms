
-- Add share_token column to donation_campaigns
ALTER TABLE public.donation_campaigns ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Function to auto-generate share token on insert
CREATE OR REPLACE FUNCTION public.generate_campaign_share_token()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.share_token IS NULL THEN
    NEW.share_token := substr(md5(random()::text || NEW.id::text), 1, 12);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate share token
CREATE TRIGGER set_campaign_share_token
  BEFORE INSERT ON public.donation_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_campaign_share_token();

-- Backfill existing campaigns with share tokens
UPDATE public.donation_campaigns
SET share_token = substr(md5(random()::text || id::text), 1, 12)
WHERE share_token IS NULL;

-- Anon read policy for public campaign pages (active campaigns only)
CREATE POLICY "anon_read_active_campaigns"
  ON public.donation_campaigns
  FOR SELECT
  TO anon
  USING (status = 'active');

-- Allow anon to read organization info for public campaign pages
CREATE POLICY "anon_read_org_for_campaigns"
  ON public.organizations
  FOR SELECT
  TO anon
  USING (true);
