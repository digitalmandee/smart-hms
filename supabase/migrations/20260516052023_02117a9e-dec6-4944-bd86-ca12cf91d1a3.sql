-- Auto-decrement vaccine_lots.quantity_remaining when an immunization with vaccine_lot_id is recorded.
-- Idempotent: AFTER INSERT only fires for new rows; cow-sync's unique client_uuid upsert
-- prevents the same record from being re-inserted on offline replay.
CREATE OR REPLACE FUNCTION public.trg_decrement_vaccine_lot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.vaccine_lot_id IS NOT NULL AND NEW.status = 'given' THEN
    UPDATE public.vaccine_lots
       SET quantity_remaining = GREATEST(0, quantity_remaining - 1)
     WHERE id = NEW.vaccine_lot_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_decrement_vaccine_lot_after_insert ON public.immunizations;
CREATE TRIGGER trg_decrement_vaccine_lot_after_insert
  AFTER INSERT ON public.immunizations
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_decrement_vaccine_lot();