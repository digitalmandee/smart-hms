
WITH existing_max AS (
  SELECT organization_id, 
    TO_CHAR(entry_date, 'YYYYMMDD') AS date_part,
    COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 13) AS INT)), 0) AS max_seq
  FROM public.journal_entries
  WHERE entry_number LIKE 'JE-________-____'
    AND entry_number != 'TEMP'
  GROUP BY organization_id, TO_CHAR(entry_date, 'YYYYMMDD')
),
temp_entries AS (
  SELECT id, organization_id, entry_date,
    TO_CHAR(entry_date, 'YYYYMMDD') AS date_part,
    ROW_NUMBER() OVER (PARTITION BY organization_id, entry_date ORDER BY created_at) AS rn
  FROM public.journal_entries
  WHERE entry_number = 'TEMP'
)
UPDATE public.journal_entries je
SET entry_number = 'JE-' || t.date_part || '-' || LPAD((COALESCE(e.max_seq, 0) + t.rn)::TEXT, 4, '0')
FROM temp_entries t
LEFT JOIN existing_max e ON e.organization_id = t.organization_id AND e.date_part = t.date_part
WHERE je.id = t.id;
