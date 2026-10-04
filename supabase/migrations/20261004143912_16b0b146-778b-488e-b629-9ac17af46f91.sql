CREATE TABLE public.blood_camps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL DEFAULT public.get_user_organization_id(),
  branch_id uuid,
  camp_number text,
  name text NOT NULL,
  location text,
  address text,
  latitude numeric, longitude numeric,
  camp_date date NOT NULL DEFAULT current_date,
  start_time time, end_time time,
  organiser text, contact_person text, contact_phone text,
  in_charge text,
  target_bags integer DEFAULT 0,
  bags_sent integer DEFAULT 0,
  kits_notes text,
  status text NOT NULL DEFAULT 'planned',
  closed_at timestamptz, closed_by uuid, closing_notes text,
  received_at timestamptz,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_camps TO authenticated;
GRANT ALL ON public.blood_camps TO service_role;
ALTER TABLE public.blood_camps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members manage camps" ON public.blood_camps FOR ALL TO authenticated
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE TABLE public.blood_camp_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id uuid NOT NULL REFERENCES public.blood_camps(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL DEFAULT public.get_user_organization_id(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'phlebotomist',
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_camp_staff TO authenticated;
GRANT ALL ON public.blood_camp_staff TO service_role;
ALTER TABLE public.blood_camp_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members manage camp staff" ON public.blood_camp_staff FOR ALL TO authenticated
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE TABLE public.blood_camp_transport (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id uuid NOT NULL REFERENCES public.blood_camps(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL DEFAULT public.get_user_organization_id(),
  departed_at timestamptz, departure_temp numeric,
  arrived_at timestamptz, arrival_temp numeric,
  carrier text, bag_count integer,
  flagged boolean NOT NULL DEFAULT false,
  flag_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_camp_transport TO authenticated;
GRANT ALL ON public.blood_camp_transport TO service_role;
ALTER TABLE public.blood_camp_transport ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members manage camp transport" ON public.blood_camp_transport FOR ALL TO authenticated
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE OR REPLACE FUNCTION public.bb_camp_touch() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER trg_camps_touch BEFORE UPDATE ON public.blood_camps FOR EACH ROW EXECUTE FUNCTION public.bb_camp_touch();
CREATE TRIGGER trg_camp_staff_touch BEFORE UPDATE ON public.blood_camp_staff FOR EACH ROW EXECUTE FUNCTION public.bb_camp_touch();

-- Cold-chain flag: whole blood transport must stay 1–10 °C, bag count must match
CREATE OR REPLACE FUNCTION public.bb_camp_transport_flag() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE _collected int;
BEGIN
  NEW.updated_at = now();
  SELECT count(*) INTO _collected FROM blood_donations WHERE camp_id = NEW.camp_id AND status <> 'rejected';
  NEW.flagged := false; NEW.flag_reason := null;
  IF (NEW.departure_temp IS NOT NULL AND (NEW.departure_temp < 1 OR NEW.departure_temp > 10))
     OR (NEW.arrival_temp IS NOT NULL AND (NEW.arrival_temp < 1 OR NEW.arrival_temp > 10)) THEN
    NEW.flagged := true; NEW.flag_reason := 'temperature_out_of_range';
  ELSIF NEW.bag_count IS NOT NULL AND NEW.bag_count <> _collected THEN
    NEW.flagged := true; NEW.flag_reason := 'bag_count_mismatch';
  END IF;
  RETURN NEW;
END $$;

ALTER TABLE public.blood_donations ADD COLUMN IF NOT EXISTS camp_id uuid REFERENCES public.blood_camps(id) ON DELETE SET NULL;
ALTER TABLE public.blood_donations ADD COLUMN IF NOT EXISTS received_status text;
ALTER TABLE public.blood_donations ADD COLUMN IF NOT EXISTS received_reason text;
ALTER TABLE public.blood_inventory ADD COLUMN IF NOT EXISTS camp_id uuid REFERENCES public.blood_camps(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_blood_donations_camp ON public.blood_donations(camp_id);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_camp ON public.blood_inventory(camp_id);

CREATE TRIGGER trg_camp_transport_flag BEFORE INSERT OR UPDATE ON public.blood_camp_transport FOR EACH ROW EXECUTE FUNCTION public.bb_camp_transport_flag();

-- Camp number
CREATE OR REPLACE FUNCTION public.bb_camp_number() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.camp_number IS NULL THEN
    NEW.camp_number := 'CAMP-' || to_char(NEW.camp_date,'YYMMDD') || '-' ||
      lpad((SELECT count(*)+1 FROM blood_camps WHERE organization_id = NEW.organization_id AND camp_date = NEW.camp_date)::text, 2, '0');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_camp_number BEFORE INSERT ON public.blood_camps FOR EACH ROW EXECUTE FUNCTION public.bb_camp_number();

-- Camp donations start pending receipt; cannot complete (split) until accepted
CREATE OR REPLACE FUNCTION public.bb_camp_donation_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.camp_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' AND NEW.received_status IS NULL THEN NEW.received_status := 'pending'; END IF;
    IF NEW.status = 'completed' AND COALESCE(NEW.received_status,'pending') <> 'accepted' THEN
      RAISE EXCEPTION 'CAMP_BAG_NOT_RECEIVED: camp bags must be accepted at the blood bank before processing';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_camp_donation_guard BEFORE INSERT OR UPDATE ON public.blood_donations FOR EACH ROW EXECUTE FUNCTION public.bb_camp_donation_guard();

-- Carry camp onto bags created from a camp donation
CREATE OR REPLACE FUNCTION public.bb_inventory_camp() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.camp_id IS NULL AND NEW.donation_id IS NOT NULL THEN
    SELECT camp_id INTO NEW.camp_id FROM blood_donations WHERE id = NEW.donation_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_inventory_camp BEFORE INSERT ON public.blood_inventory FOR EACH ROW EXECUTE FUNCTION public.bb_inventory_camp();

CREATE OR REPLACE FUNCTION public.receive_camp_bags(_camp_id uuid, _accepted uuid[], _rejected jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE _r jsonb; _pending int; _acc int := 0; _rej int := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM blood_camps WHERE id = _camp_id AND organization_id = get_user_organization_id()) THEN
    RAISE EXCEPTION 'CAMP_NOT_FOUND';
  END IF;
  UPDATE blood_donations SET received_status = 'accepted', received_reason = NULL, status = 'processing'
   WHERE camp_id = _camp_id AND id = ANY(COALESCE(_accepted, '{}')) AND status <> 'rejected';
  GET DIAGNOSTICS _acc = ROW_COUNT;
  FOR _r IN SELECT * FROM jsonb_array_elements(COALESCE(_rejected,'[]'::jsonb)) LOOP
    UPDATE blood_donations SET received_status = 'rejected', received_reason = _r->>'reason',
      status = 'rejected', rejection_reason = _r->>'reason'
     WHERE camp_id = _camp_id AND id = (_r->>'id')::uuid;
    _rej := _rej + 1;
  END LOOP;
  SELECT count(*) INTO _pending FROM blood_donations
   WHERE camp_id = _camp_id AND status <> 'rejected' AND COALESCE(received_status,'pending') = 'pending';
  IF _pending = 0 THEN
    UPDATE blood_camps SET status = 'received', received_at = now() WHERE id = _camp_id;
  END IF;
  RETURN jsonb_build_object('accepted', _acc, 'rejected', _rej, 'pending', _pending);
END $$;
REVOKE EXECUTE ON FUNCTION public.receive_camp_bags(uuid, uuid[], jsonb) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.receive_camp_bags(uuid, uuid[], jsonb) TO authenticated;