
-- Remove duplicate medicine_inventory rows, keeping the one with max quantity per group
DELETE FROM public.medicine_inventory
WHERE id NOT IN (
  SELECT DISTINCT ON (
    branch_id,
    medicine_id,
    COALESCE(store_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(batch_number, '__none__'),
    COALESCE(expiry_date, '1900-01-01'::date)
  ) id
  FROM public.medicine_inventory
  ORDER BY
    branch_id,
    medicine_id,
    COALESCE(store_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(batch_number, '__none__'),
    COALESCE(expiry_date, '1900-01-01'::date),
    COALESCE(quantity, 0) DESC,
    created_at ASC
);

-- Now create the unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_med_inv_unique_batch
ON public.medicine_inventory (
  branch_id,
  medicine_id,
  COALESCE(store_id, '00000000-0000-0000-0000-000000000000'::uuid),
  COALESCE(batch_number, '__none__'),
  COALESCE(expiry_date, '1900-01-01'::date)
);
