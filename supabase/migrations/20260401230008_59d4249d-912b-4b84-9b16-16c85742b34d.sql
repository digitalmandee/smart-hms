
-- Backfill missing medicine_inventory rows for posted GRNs whose stock insert failed

-- GRN-20260401-0001: medicine 0003, qty 1, batch "21", unit_cost 0, selling 23
INSERT INTO medicine_inventory (branch_id, medicine_id, batch_number, quantity, unit_price, selling_price, expiry_date, vendor_id, store_id)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'a1111111-0001-4001-8001-000000000003',
  '21',
  1,
  0.00,
  23.00,
  NULL,
  'ab29767c-faa1-4fb5-9583-8190ee3b5b03',
  NULL
);

-- GRN-20260401-0002: medicine 0003, qty 40, batch "2", unit_cost 20, selling 30
INSERT INTO medicine_inventory (branch_id, medicine_id, batch_number, quantity, unit_price, selling_price, expiry_date, vendor_id, store_id)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'a1111111-0001-4001-8001-000000000003',
  '2',
  40,
  20.00,
  30.00,
  '2026-04-30',
  '98911f4e-2d3e-44b2-aa08-7937a1fc26d1',
  NULL
);

-- GRN-20260401-0002: medicine 0006, qty 10, batch "2", unit_cost 20, selling 30
INSERT INTO medicine_inventory (branch_id, medicine_id, batch_number, quantity, unit_price, selling_price, expiry_date, vendor_id, store_id)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'a1111111-0001-4001-8001-000000000006',
  '2',
  10,
  20.00,
  30.00,
  '2026-04-30',
  '98911f4e-2d3e-44b2-aa08-7937a1fc26d1',
  NULL
);
