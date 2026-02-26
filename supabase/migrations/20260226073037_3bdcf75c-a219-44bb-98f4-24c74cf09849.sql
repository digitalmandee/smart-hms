
-- 1. Create donation_campaigns table
CREATE TABLE public.donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  campaign_number TEXT NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  goal_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  collected_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  donor_count INT NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general',
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  cover_image_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Auto-number trigger
CREATE OR REPLACE FUNCTION public.generate_campaign_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE date_part TEXT; seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(campaign_number FROM 15) AS INT)), 0) + 1
  INTO seq_num FROM public.donation_campaigns
  WHERE organization_id = NEW.organization_id AND campaign_number LIKE 'CAMP-' || date_part || '-%';
  NEW.campaign_number := 'CAMP-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END; $$;

CREATE TRIGGER set_campaign_number BEFORE INSERT ON public.donation_campaigns
FOR EACH ROW WHEN (NEW.campaign_number IS NULL OR NEW.campaign_number = '')
EXECUTE FUNCTION public.generate_campaign_number();

-- 3. RLS
ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaigns in their org" ON public.donation_campaigns FOR SELECT TO authenticated
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert campaigns in their org" ON public.donation_campaigns FOR INSERT TO authenticated
WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update campaigns in their org" ON public.donation_campaigns FOR UPDATE TO authenticated
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete campaigns in their org" ON public.donation_campaigns FOR DELETE TO authenticated
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 4. Add campaign_id to financial_donations
ALTER TABLE public.financial_donations ADD COLUMN campaign_id UUID REFERENCES public.donation_campaigns(id);

-- 5. Trigger to auto-update campaign totals
CREATE OR REPLACE FUNCTION public.update_campaign_totals()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_campaign_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN v_campaign_id := OLD.campaign_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.campaign_id IS DISTINCT FROM NEW.campaign_id AND OLD.campaign_id IS NOT NULL THEN
      UPDATE public.donation_campaigns SET
        collected_amount = COALESCE((SELECT SUM(amount) FROM public.financial_donations WHERE campaign_id = OLD.campaign_id AND status = 'received'), 0),
        donor_count = COALESCE((SELECT COUNT(DISTINCT donor_id) FROM public.financial_donations WHERE campaign_id = OLD.campaign_id AND status = 'received'), 0),
        updated_at = now()
      WHERE id = OLD.campaign_id;
    END IF;
    v_campaign_id := NEW.campaign_id;
  ELSE v_campaign_id := NEW.campaign_id;
  END IF;
  IF v_campaign_id IS NOT NULL THEN
    UPDATE public.donation_campaigns SET
      collected_amount = COALESCE((SELECT SUM(amount) FROM public.financial_donations WHERE campaign_id = v_campaign_id AND status = 'received'), 0),
      donor_count = COALESCE((SELECT COUNT(DISTINCT donor_id) FROM public.financial_donations WHERE campaign_id = v_campaign_id AND status = 'received'), 0),
      updated_at = now()
    WHERE id = v_campaign_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE TRIGGER update_campaign_totals_on_donation
AFTER INSERT OR UPDATE OR DELETE ON public.financial_donations
FOR EACH ROW EXECUTE FUNCTION public.update_campaign_totals();

-- 6. Seed campaigns
DO $$
DECLARE v_org_id UUID; v_camp1 UUID; v_camp2 UUID; v_camp3 UUID;
BEGIN
  SELECT id INTO v_org_id FROM public.organizations LIMIT 1;
  IF v_org_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.donation_campaigns (id, organization_id, campaign_number, title, title_ar, description, goal_amount, category, start_date, end_date, status)
  VALUES (gen_random_uuid(), v_org_id, 'CAMP-20260101-0001', 'New MRI Machine', 'جهاز رنين مغناطيسي جديد', 'Fundraising for a state-of-the-art MRI machine for the radiology department.', 5000000, 'equipment', '2026-01-01', '2026-12-31', 'active')
  RETURNING id INTO v_camp1;

  INSERT INTO public.donation_campaigns (id, organization_id, campaign_number, title, title_ar, description, goal_amount, category, start_date, end_date, status)
  VALUES (gen_random_uuid(), v_org_id, 'CAMP-20260201-0001', 'Ramadan Patient Welfare 2026', 'رعاية المرضى في رمضان 2026', 'Supporting underprivileged patients during the holy month of Ramadan.', 1000000, 'patient_welfare', '2026-02-01', '2026-04-30', 'active')
  RETURNING id INTO v_camp2;

  INSERT INTO public.donation_campaigns (id, organization_id, campaign_number, title, title_ar, description, goal_amount, category, start_date, end_date, status)
  VALUES (gen_random_uuid(), v_org_id, 'CAMP-20260101-0002', 'Hospital Building Extension', 'توسيع مبنى المستشفى', 'Building a new wing with 50 additional beds and modern facilities.', 10000000, 'building', '2026-01-15', NULL, 'active')
  RETURNING id INTO v_camp3;

  -- Link existing donations to campaigns
  UPDATE public.financial_donations SET campaign_id = v_camp1 WHERE organization_id = v_org_id AND purpose = 'equipment' AND campaign_id IS NULL;
  UPDATE public.financial_donations SET campaign_id = v_camp2 WHERE organization_id = v_org_id AND purpose = 'patient_welfare' AND campaign_id IS NULL;
  UPDATE public.financial_donations SET campaign_id = v_camp3 WHERE organization_id = v_org_id AND purpose = 'building_fund' AND campaign_id IS NULL;
  UPDATE public.financial_donations SET campaign_id = v_camp2 WHERE organization_id = v_org_id AND purpose IN ('zakat', 'sadaqah') AND campaign_id IS NULL
    AND id IN (SELECT id FROM public.financial_donations WHERE organization_id = v_org_id AND purpose IN ('zakat', 'sadaqah') AND campaign_id IS NULL LIMIT 3);
END; $$;

-- 7. Add sidebar menu item
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_module, is_active)
VALUES ('donations-campaigns', 'Campaigns', 'Target', '/app/donations/campaigns', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5, 'donations', true);
