

# Fix: Imaging Order Duplicate Key Race Condition

## Root Cause

The `generate_imaging_order_number()` trigger uses `SELECT MAX(...)` to find the next sequence number. When two imaging orders are created near-simultaneously (e.g., two doctors ordering at the same time), both read the same MAX value, generate the same `IMG-YYMMDD-NNNN` number, and the second insert fails with a unique constraint violation.

## Fix

### 1. Update the trigger to use `FOR UPDATE SKIP LOCKED` + retry logic

Replace the trigger function with an advisory-lock-based approach:

```sql
CREATE OR REPLACE FUNCTION public.generate_imaging_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  -- Use advisory lock to prevent race conditions
  PERFORM pg_advisory_xact_lock(hashtext('imaging_order_' || NEW.organization_id::text || date_part));
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 5 + LENGTH(date_part)) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.imaging_orders
  WHERE organization_id = NEW.organization_id
    AND order_number LIKE 'IMG-' || date_part || '-%';
  
  NEW.order_number := 'IMG-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;
```

The `pg_advisory_xact_lock` serializes concurrent inserts for the same org+date, preventing duplicate numbers. The lock is released automatically when the transaction commits.

### 2. No code changes needed

The `useImaging.ts` hook already sends `order_number: ''` which correctly triggers the BEFORE INSERT trigger. The only fix is the database function.

## File Changes

- **1 migration file**: Replace the `generate_imaging_order_number()` function with the advisory-lock version

