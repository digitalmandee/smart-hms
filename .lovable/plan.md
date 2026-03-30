

# Doctor Wallet Not Updated for Lab Tests, Radiology & Other Sources

## Problem

The `auto_create_doctor_earnings` trigger (in migration `20260309224505`) **only processes invoice items where `description ILIKE '%consultation%'`** (line 41). It explicitly skips everything else:

```sql
IF item.description NOT ILIKE '%consultation%' THEN
  CONTINUE;
END IF;
```

This means doctor earnings are **never created** for:
- Lab test referrals (uses `lab_referral_percent` from compensation plan)
- Radiology/imaging referrals (uses `radiology_referral_percent`)
- Procedures (uses `procedure_share_percent`)
- Surgeries (uses `surgery_share_percent`)
- IPD visits (uses `ipd_visit_share_percent`)

The compensation plan table already has all these share percentages defined, but the trigger ignores them.

## Fix

Replace the trigger function `auto_create_doctor_earnings()` with an expanded version that:

1. Matches invoice item descriptions to source types using pattern matching:
   - `%consultation%` → `consultation` (share from `consultation_share_percent`)
   - `%lab%` or `%test%` or `%pathology%` → `lab_referral` (share from `lab_referral_percent`)
   - `%radiology%` or `%imaging%` or `%x-ray%` or `%ultrasound%` or `%ct%` or `%mri%` → `radiology_referral` (share from `radiology_referral_percent`)
   - `%procedure%` → `procedure` (share from `procedure_share_percent`)
   - `%surgery%` or `%operation%` → `surgery` (share from `surgery_share_percent`)

2. Uses the correct share percentage from the compensation plan for each source type

3. Creates separate `doctor_earnings` records per source type (duplicate check includes `source_type`)

4. Falls back to 0% share if no compensation plan exists (same as current behavior)

## Technical Details

### Migration: Update `auto_create_doctor_earnings()` function

```sql
CREATE OR REPLACE FUNCTION public.auto_create_doctor_earnings()
RETURNS TRIGGER AS $$
DECLARE
  inv RECORD;
  item RECORD;
  comp_plan RECORD;
  share_pct NUMERIC;
  v_source_type TEXT;
  v_doctor_id UUID;
BEGIN
  SELECT * INTO inv FROM public.invoices WHERE id = NEW.invoice_id;
  IF NOT FOUND OR inv.status != 'paid' THEN RETURN NEW; END IF;

  FOR item IN SELECT * FROM public.invoice_items WHERE invoice_id = NEW.invoice_id
  LOOP
    v_doctor_id := item.doctor_id;
    IF v_doctor_id IS NULL THEN
      SELECT a.doctor_id INTO v_doctor_id FROM public.appointments a
      WHERE a.invoice_id = inv.id AND a.doctor_id IS NOT NULL LIMIT 1;
    END IF;
    IF v_doctor_id IS NULL THEN CONTINUE; END IF;

    -- Determine source type from description
    v_source_type := NULL;
    IF item.description ILIKE '%consultation%' THEN v_source_type := 'consultation';
    ELSIF item.description ILIKE ANY(ARRAY['%lab%','%test%','%pathology%','%blood%','%urine%']) THEN v_source_type := 'lab_referral';
    ELSIF item.description ILIKE ANY(ARRAY['%radiology%','%imaging%','%x-ray%','%xray%','%ultrasound%','%ct scan%','%mri%','%echo%']) THEN v_source_type := 'radiology_referral';
    ELSIF item.description ILIKE '%procedure%' THEN v_source_type := 'procedure';
    ELSIF item.description ILIKE ANY(ARRAY['%surgery%','%operation%']) THEN v_source_type := 'surgery';
    END IF;

    IF v_source_type IS NULL THEN CONTINUE; END IF;

    -- Get compensation plan & correct share %
    SELECT * INTO comp_plan FROM public.doctor_compensation_plans
    WHERE doctor_id = v_doctor_id AND is_active = true LIMIT 1;

    share_pct := 0;
    IF FOUND THEN
      share_pct := CASE v_source_type
        WHEN 'consultation' THEN COALESCE(comp_plan.consultation_share_percent, 0)
        WHEN 'lab_referral' THEN COALESCE(comp_plan.lab_referral_percent, 0)
        WHEN 'radiology_referral' THEN COALESCE(comp_plan.radiology_referral_percent, 0)
        WHEN 'procedure' THEN COALESCE(comp_plan.procedure_share_percent, 0)
        WHEN 'surgery' THEN COALESCE(comp_plan.surgery_share_percent, 0)
        ELSE 0
      END;
    END IF;

    -- Deduplicate by source_id + doctor_id + source_type
    IF NOT EXISTS (
      SELECT 1 FROM public.doctor_earnings
      WHERE source_id = inv.id::text AND doctor_id = v_doctor_id AND source_type = v_source_type
    ) THEN
      INSERT INTO public.doctor_earnings (...) VALUES (...);
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

No new tables or columns needed. The `doctor_earnings.source_type` column and all compensation plan share columns already exist.

## Files Changed
- 1 migration SQL file — replace `auto_create_doctor_earnings()` function with expanded version supporting all source types

