
-- Create a prior fiscal year (FY 2025) for any organization that has JEs dated before its earliest FY
INSERT INTO public.fiscal_years (organization_id, name, start_date, end_date, is_current, is_closed)
SELECT DISTINCT je.organization_id, 'FY 2025', '2025-01-01'::date, '2025-12-31'::date, false, false
FROM public.journal_entries je
WHERE je.fiscal_year_id IS NULL
  AND je.entry_date < '2026-01-01'
  AND NOT EXISTS (
    SELECT 1 FROM public.fiscal_years fy
    WHERE fy.organization_id = je.organization_id
      AND fy.start_date <= '2025-01-01' AND fy.end_date >= '2025-12-31'
  );

-- Re-run backfill
UPDATE public.journal_entries je
SET fiscal_year_id = fy.id
FROM public.fiscal_years fy
WHERE je.fiscal_year_id IS NULL
  AND fy.organization_id = je.organization_id
  AND je.entry_date BETWEEN fy.start_date AND fy.end_date;

-- For any orphans (e.g. dates in early 2026 before FY start), create a partial FY
INSERT INTO public.fiscal_years (organization_id, name, start_date, end_date, is_current, is_closed)
SELECT DISTINCT je.organization_id, 'FY 2026 (partial pre-period)', 
  date_trunc('year', MIN(je.entry_date))::date, '2025-12-31'::date, false, false
FROM public.journal_entries je
WHERE je.fiscal_year_id IS NULL
GROUP BY je.organization_id
ON CONFLICT DO NOTHING;

UPDATE public.journal_entries je
SET fiscal_year_id = fy.id
FROM public.fiscal_years fy
WHERE je.fiscal_year_id IS NULL
  AND fy.organization_id = je.organization_id
  AND je.entry_date BETWEEN fy.start_date AND fy.end_date;
