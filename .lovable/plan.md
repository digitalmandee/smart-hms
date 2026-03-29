

# Fix: Imaging Order Number Generation — Broken SUBSTRING Parsing

## Root Cause

The `generate_imaging_order_number()` trigger has a wrong SUBSTRING offset. The order number format is `IMG-YYMMDD-NNNN` (e.g., `IMG-260329-0001`).

The current code does:
```sql
SUBSTRING(order_number FROM 5 + LENGTH(date_part))
-- = SUBSTRING('IMG-260329-0001' FROM 11)
-- = '-0001'  ← includes the dash!
```

This extracts `-0001`, which casts to INT as `-1`. So `MAX(-1) + 1 = 0`, producing `IMG-260329-0000`. When a second order is created the same day, it also computes MAX of existing broken values and can produce the same number, hitting the unique constraint.

The correct offset is `12` — skipping `IMG-` (4) + `YYMMDD` (6) + `-` (1) = 11 chars, so position 12 onward.

## Fix

### 1. New migration to fix the trigger function

Replace the SUBSTRING expression:

```sql
-- Old (broken):
SUBSTRING(order_number FROM 5 + LENGTH(date_part))

-- New (correct):
SUBSTRING(order_number FROM 4 + LENGTH(date_part) + 2)
-- = SUBSTRING('IMG-260329-0001' FROM 12) = '0001'
```

Full corrected function (keeps advisory lock from previous fix):

```sql
CREATE OR REPLACE FUNCTION public.generate_imaging_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
  prefix TEXT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  prefix := 'IMG-' || date_part || '-';
  
  PERFORM pg_advisory_xact_lock(
    hashtext('imaging_order_' || NEW.organization_id::text || date_part)
  );
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM LENGTH(prefix) + 1) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.imaging_orders
  WHERE organization_id = NEW.organization_id
    AND order_number LIKE prefix || '%';
  
  NEW.order_number := prefix || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;
```

Using `LENGTH(prefix) + 1` is cleaner and always correct regardless of format changes.

### 2. Fix existing bad data

Update existing `0000`-suffixed order numbers to use `0001` (or next available) so they don't cause future collisions.

```sql
-- Data fix via insert tool
UPDATE imaging_orders 
SET order_number = REPLACE(order_number, '-0000', '-0001')
WHERE order_number LIKE '%-0000';
```

## Files to Change

- **1 new migration**: Replace `generate_imaging_order_number()` with corrected SUBSTRING logic
- **1 data update**: Fix existing `0000` order numbers

