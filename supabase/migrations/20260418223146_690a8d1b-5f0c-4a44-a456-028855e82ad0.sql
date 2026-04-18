
INSERT INTO public.fiscal_years (organization_id, name, start_date, end_date, is_current, is_closed)
SELECT DISTINCT je.organization_id, 'FY 2026', '2026-01-01'::date, '2026-12-31'::date, true, false
FROM public.journal_entries je
WHERE je.fiscal_year_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.fiscal_years fy
    WHERE fy.organization_id = je.organization_id
      AND je.entry_date BETWEEN fy.start_date AND fy.end_date
  );

UPDATE public.journal_entries je
SET fiscal_year_id = fy.id
FROM public.fiscal_years fy
WHERE je.fiscal_year_id IS NULL
  AND fy.organization_id = je.organization_id
  AND je.entry_date BETWEEN fy.start_date AND fy.end_date;
