-- Delete orphaned POs that have no items (created from failed attempts)
DELETE FROM purchase_orders WHERE id IN (
  'a2fd6348-3c85-4c5b-907c-95fa6c9892bf',
  '4c7e810c-ea71-4234-9ff9-30a2f75eac90',
  'ee67debe-30d1-4cb4-9d00-41db11dddaf2',
  '68af1c6f-51df-44bb-9668-3ce1791a072c',
  '23475e08-c3bb-4da3-ba14-a6ffd50d4ca3',
  '676466fa-e2ae-420a-85ae-918b6f170f1a'
);

-- Also make item_id nullable to properly support medicine-type PO items
ALTER TABLE public.purchase_order_items ALTER COLUMN item_id DROP NOT NULL;