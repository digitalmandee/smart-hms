
-- Seed data for MediCare Pharmacy (org: c0d9b317-110d-4f2d-a13b-e79dbc056787, branch: c0d9b317-aaaa-aaaa-aaaa-aaaaaaaaaaaa)
-- This ONLY inserts data for MediCare. Hospital data is untouched.

DO $$
DECLARE
  v_org_id UUID := 'c0d9b317-110d-4f2d-a13b-e79dbc056787';
  v_branch_id UUID := 'c0d9b317-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  v_user_id UUID := 'c0d9b317-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  
  -- Category IDs
  v_cat_tablets UUID := gen_random_uuid();
  v_cat_syrups UUID := gen_random_uuid();
  v_cat_injections UUID := gen_random_uuid();
  v_cat_topical UUID := gen_random_uuid();
  v_cat_supplements UUID := gen_random_uuid();
  
  -- Medicine IDs (25 medicines)
  v_med UUID[];
  v_inv UUID[];
  v_tx UUID[];
  
  v_i INT;
  v_day INT;
  v_hour INT;
  v_tx_id UUID;
  v_inv_id UUID;
  v_med_id UUID;
  v_qty INT;
  v_price NUMERIC;
  v_cost NUMERIC;
  v_discount NUMERIC;
  v_subtotal NUMERIC;
  v_total NUMERIC;
  v_tx_date TIMESTAMPTZ;
  v_payment_method TEXT;
  v_batch TEXT;
  v_stock INT;
  
BEGIN
  -- ============ CATEGORIES ============
  INSERT INTO medicine_categories (id, organization_id, name, description, is_active) VALUES
    (v_cat_tablets, v_org_id, 'Tablets & Capsules', 'Oral solid dosage forms', true),
    (v_cat_syrups, v_org_id, 'Syrups & Liquids', 'Oral liquid formulations', true),
    (v_cat_injections, v_org_id, 'Injections', 'Injectable medications', true),
    (v_cat_topical, v_org_id, 'Topical & External', 'Creams, ointments, and gels', true),
    (v_cat_supplements, v_org_id, 'Vitamins & Supplements', 'Nutritional supplements', true);

  -- ============ MEDICINES (25) ============
  v_med := ARRAY[]::UUID[];
  FOR v_i IN 1..25 LOOP
    v_med := v_med || gen_random_uuid();
  END LOOP;

  INSERT INTO medicines (id, organization_id, category_id, name, generic_name, manufacturer, unit, strength, is_active) VALUES
    (v_med[1],  v_org_id, v_cat_tablets, 'Panadol Extra', 'Paracetamol + Caffeine', 'GSK', 'tablet', '500mg/65mg', true),
    (v_med[2],  v_org_id, v_cat_tablets, 'Augmentin 625', 'Amoxicillin + Clavulanate', 'GSK', 'tablet', '625mg', true),
    (v_med[3],  v_org_id, v_cat_tablets, 'Brufen 400', 'Ibuprofen', 'Abbott', 'tablet', '400mg', true),
    (v_med[4],  v_org_id, v_cat_tablets, 'Risek 20', 'Omeprazole', 'Getz Pharma', 'capsule', '20mg', true),
    (v_med[5],  v_org_id, v_cat_tablets, 'Azomax 500', 'Azithromycin', 'Searle', 'tablet', '500mg', true),
    (v_med[6],  v_org_id, v_cat_tablets, 'Disprin', 'Aspirin', 'Reckitt', 'tablet', '300mg', true),
    (v_med[7],  v_org_id, v_cat_tablets, 'Flagyl 400', 'Metronidazole', 'Sanofi', 'tablet', '400mg', true),
    (v_med[8],  v_org_id, v_cat_tablets, 'Lexotanil 3mg', 'Bromazepam', 'Roche', 'tablet', '3mg', true),
    (v_med[9],  v_org_id, v_cat_tablets, 'Novaclav 1g', 'Amoxicillin + Clavulanate', 'Novartis', 'tablet', '1000mg', true),
    (v_med[10], v_org_id, v_cat_tablets, 'Glucophage 500', 'Metformin', 'Merck', 'tablet', '500mg', true),
    (v_med[11], v_org_id, v_cat_syrups, 'Calpol Syrup', 'Paracetamol', 'GSK', 'syrup', '120mg/5ml', true),
    (v_med[12], v_org_id, v_cat_syrups, 'Phenergan Syrup', 'Promethazine', 'Sanofi', 'syrup', '5mg/5ml', true),
    (v_med[13], v_org_id, v_cat_syrups, 'Motilium Suspension', 'Domperidone', 'Janssen', 'syrup', '5mg/5ml', true),
    (v_med[14], v_org_id, v_cat_syrups, 'Ventolin Syrup', 'Salbutamol', 'GSK', 'syrup', '2mg/5ml', true),
    (v_med[15], v_org_id, v_cat_injections, 'Inj Ceftriaxone 1g', 'Ceftriaxone', 'Roche', 'injection', '1g', true),
    (v_med[16], v_org_id, v_cat_injections, 'Inj Diclofenac', 'Diclofenac', 'Novartis', 'injection', '75mg/3ml', true),
    (v_med[17], v_org_id, v_cat_injections, 'Inj Ranitidine', 'Ranitidine', 'GSK', 'injection', '50mg/2ml', true),
    (v_med[18], v_org_id, v_cat_topical, 'Polyfax Skin Ointment', 'Polymyxin B + Bacitracin', 'GSK', 'ointment', '20g', true),
    (v_med[19], v_org_id, v_cat_topical, 'Fucidin Cream', 'Fusidic Acid', 'Leo Pharma', 'cream', '2%', true),
    (v_med[20], v_org_id, v_cat_topical, 'Voltaren Gel', 'Diclofenac', 'Novartis', 'gel', '1%', true),
    (v_med[21], v_org_id, v_cat_topical, 'Dettol Antiseptic', 'Chloroxylenol', 'Reckitt', 'cream', '100ml', true),
    (v_med[22], v_org_id, v_cat_supplements, 'Centrum Multivitamin', 'Multivitamin', 'Pfizer', 'tablet', '30 tabs', true),
    (v_med[23], v_org_id, v_cat_supplements, 'Caltrate 600+D', 'Calcium + Vitamin D', 'Pfizer', 'tablet', '600mg', true),
    (v_med[24], v_org_id, v_cat_supplements, 'Neurobion Forte', 'Vitamin B Complex', 'Merck', 'tablet', 'B1+B6+B12', true),
    (v_med[25], v_org_id, v_cat_supplements, 'Ferrous Sulfate', 'Iron', 'Various', 'tablet', '325mg', true);

  -- ============ INVENTORY (35+ batches) ============
  v_inv := ARRAY[]::UUID[];
  FOR v_i IN 1..35 LOOP
    v_inv := v_inv || gen_random_uuid();
  END LOOP;

  INSERT INTO medicine_inventory (id, branch_id, medicine_id, batch_number, quantity, unit_price, selling_price, expiry_date, reorder_level) VALUES
    -- Tablets batches
    (v_inv[1],  v_branch_id, v_med[1],  'PAN-2025-A', 500, 8.50, 12.00, '2026-12-31', 50),
    (v_inv[2],  v_branch_id, v_med[2],  'AUG-2025-A', 200, 45.00, 65.00, '2026-06-30', 30),
    (v_inv[3],  v_branch_id, v_med[3],  'BRU-2025-A', 300, 12.00, 18.00, '2026-09-30', 40),
    (v_inv[4],  v_branch_id, v_med[4],  'RIS-2025-A', 150, 25.00, 38.00, '2026-08-31', 20),
    (v_inv[5],  v_branch_id, v_med[5],  'AZO-2025-A', 100, 55.00, 80.00, '2026-03-31', 15),
    (v_inv[6],  v_branch_id, v_med[6],  'DSP-2025-A', 400, 5.00, 8.00, '2027-01-31', 50),
    (v_inv[7],  v_branch_id, v_med[7],  'FLG-2025-A', 250, 10.00, 15.00, '2026-07-31', 30),
    (v_inv[8],  v_branch_id, v_med[8],  'LEX-2025-A', 80, 30.00, 48.00, '2026-11-30', 10),
    (v_inv[9],  v_branch_id, v_med[9],  'NOV-2025-A', 120, 60.00, 90.00, '2026-05-31', 20),
    (v_inv[10], v_branch_id, v_med[10], 'GLU-2025-A', 350, 15.00, 22.00, '2026-10-31', 40),
    -- Syrups
    (v_inv[11], v_branch_id, v_med[11], 'CAL-2025-A', 60, 80.00, 120.00, '2026-04-30', 10),
    (v_inv[12], v_branch_id, v_med[12], 'PHE-2025-A', 40, 70.00, 105.00, '2026-06-30', 8),
    (v_inv[13], v_branch_id, v_med[13], 'MOT-2025-A', 45, 90.00, 135.00, '2026-08-31', 10),
    (v_inv[14], v_branch_id, v_med[14], 'VEN-2025-A', 35, 65.00, 95.00, '2026-05-31', 8),
    -- Injections
    (v_inv[15], v_branch_id, v_med[15], 'CEF-2025-A', 100, 120.00, 180.00, '2026-09-30', 15),
    (v_inv[16], v_branch_id, v_med[16], 'DIC-2025-A', 80, 35.00, 55.00, '2026-07-31', 10),
    (v_inv[17], v_branch_id, v_med[17], 'RAN-2025-A', 60, 25.00, 40.00, '2026-06-30', 10),
    -- Topical
    (v_inv[18], v_branch_id, v_med[18], 'POL-2025-A', 50, 85.00, 130.00, '2026-12-31', 8),
    (v_inv[19], v_branch_id, v_med[19], 'FUC-2025-A', 40, 110.00, 165.00, '2026-08-31', 5),
    (v_inv[20], v_branch_id, v_med[20], 'VOL-2025-A', 55, 95.00, 145.00, '2026-10-31', 8),
    (v_inv[21], v_branch_id, v_med[21], 'DET-2025-A', 70, 60.00, 90.00, '2027-03-31', 10),
    -- Supplements
    (v_inv[22], v_branch_id, v_med[22], 'CEN-2025-A', 30, 350.00, 520.00, '2026-11-30', 5),
    (v_inv[23], v_branch_id, v_med[23], 'CLT-2025-A', 45, 200.00, 300.00, '2026-09-30', 8),
    (v_inv[24], v_branch_id, v_med[24], 'NEU-2025-A', 60, 180.00, 270.00, '2026-07-31', 10),
    (v_inv[25], v_branch_id, v_med[25], 'FER-2025-A', 100, 20.00, 32.00, '2026-12-31', 15),
    -- EXPIRING SOON batches (for expiry report)
    (v_inv[26], v_branch_id, v_med[1],  'PAN-2024-B', 25, 8.00, 12.00, '2026-03-15', 50),
    (v_inv[27], v_branch_id, v_med[3],  'BRU-2024-B', 15, 11.00, 18.00, '2026-03-01', 40),
    (v_inv[28], v_branch_id, v_med[7],  'FLG-2024-B', 10, 9.50, 15.00, '2026-04-10', 30),
    -- LOW STOCK batches (for reorder report)
    (v_inv[29], v_branch_id, v_med[5],  'AZO-2024-C', 3, 52.00, 80.00, '2026-06-30', 15),
    (v_inv[30], v_branch_id, v_med[8],  'LEX-2024-C', 2, 28.00, 48.00, '2026-09-30', 10),
    -- DEAD STOCK (old batches, no movement expected)
    (v_inv[31], v_branch_id, v_med[21], 'DET-2024-D', 20, 55.00, 90.00, '2027-01-31', 10),
    (v_inv[32], v_branch_id, v_med[6],  'DSP-2024-D', 50, 4.50, 8.00, '2026-12-31', 50),
    -- Extra batches for variety
    (v_inv[33], v_branch_id, v_med[10], 'GLU-2024-E', 100, 14.00, 22.00, '2026-08-31', 40),
    (v_inv[34], v_branch_id, v_med[22], 'CEN-2024-E', 10, 340.00, 520.00, '2026-05-31', 5),
    (v_inv[35], v_branch_id, v_med[24], 'NEU-2024-E', 20, 175.00, 270.00, '2026-04-30', 10);

  -- ============ POS TRANSACTIONS (50 across 30 days) ============
  -- We'll create them with explicit timestamps spread across days and hours
  v_tx := ARRAY[]::UUID[];
  FOR v_i IN 1..50 LOOP
    v_tx := v_tx || gen_random_uuid();
  END LOOP;

  -- Insert 50 transactions spread over 30 days with varying hours
  FOR v_i IN 1..50 LOOP
    v_day := (v_i * 30 / 50); -- spread across 30 days
    v_hour := 8 + (v_i % 12); -- hours 8-19
    v_tx_date := (CURRENT_DATE - v_day * INTERVAL '1 day') + (v_hour * INTERVAL '1 hour') + ((v_i * 17) % 60 * INTERVAL '1 minute');
    
    -- Varying amounts
    v_subtotal := 50 + (v_i * 37 % 1500);
    v_discount := CASE WHEN v_i % 4 = 0 THEN ROUND(v_subtotal * 0.05, 2) ELSE 0 END;
    v_total := v_subtotal - v_discount;
    
    v_payment_method := CASE 
      WHEN v_i % 5 = 0 THEN 'jazzcash'
      WHEN v_i % 3 = 0 THEN 'card'
      ELSE 'cash'
    END;

    INSERT INTO pharmacy_pos_transactions (
      id, organization_id, branch_id, transaction_number,
      customer_name, customer_phone, subtotal, discount_amount, discount_percent,
      tax_amount, total_amount, amount_paid, change_amount, status,
      created_by, created_at, updated_at
    ) VALUES (
      v_tx[v_i], v_org_id, v_branch_id,
      'POS-SEED-' || LPAD(v_i::TEXT, 4, '0'),
      CASE 
        WHEN v_i % 5 = 0 THEN 'Ahmed Khan'
        WHEN v_i % 5 = 1 THEN 'Sara Ali'
        WHEN v_i % 5 = 2 THEN 'Usman Malik'
        WHEN v_i % 5 = 3 THEN 'Fatima Noor'
        ELSE 'Walk-in Customer'
      END,
      CASE WHEN v_i % 3 = 0 THEN '0300-' || LPAD((1000000 + v_i * 1234)::TEXT, 7, '0') ELSE NULL END,
      v_subtotal, v_discount, 
      CASE WHEN v_discount > 0 THEN 5 ELSE 0 END,
      0, v_total, v_total + CASE WHEN v_payment_method = 'cash' THEN (v_i % 3) * 10 ELSE 0 END,
      CASE WHEN v_payment_method = 'cash' THEN (v_i % 3) * 10 ELSE 0 END,
      'completed', v_user_id, v_tx_date, v_tx_date
    );

    -- Payment
    INSERT INTO pharmacy_pos_payments (transaction_id, payment_method, amount, created_at) VALUES
      (v_tx[v_i], v_payment_method, v_total, v_tx_date);

    -- 2-3 items per transaction
    FOR v_qty IN 1..LEAST(3, 2 + (v_i % 2)) LOOP
      v_med_id := v_med[1 + ((v_i + v_qty) % 25)];
      v_inv_id := v_inv[1 + ((v_i + v_qty) % 25)];
      v_price := 12 + ((v_i + v_qty) * 7 % 200);
      v_cost := v_price * 0.65;
      
      INSERT INTO pharmacy_pos_items (
        transaction_id, medicine_id, inventory_id, batch_number,
        quantity, unit_price, discount_amount, total_price,
        discount_percent, tax_percent, tax_amount, line_total, medicine_name
      ) VALUES (
        v_tx[v_i], v_med_id, v_inv_id,
        'SEED-' || LPAD(((v_i + v_qty) % 35 + 1)::TEXT, 3, '0'),
        1 + (v_qty % 3),
        v_price, 0, v_price * (1 + (v_qty % 3)),
        0, 0, 0, v_price * (1 + (v_qty % 3)),
        (SELECT name FROM medicines WHERE id = v_med_id)
      );
    END LOOP;
  END LOOP;

  -- ============ STOCK MOVEMENTS (GRN + sales, 60+) ============
  -- GRN movements for initial stock
  FOR v_i IN 1..25 LOOP
    INSERT INTO pharmacy_stock_movements (
      organization_id, branch_id, medicine_id, inventory_id,
      movement_type, quantity, previous_stock, new_stock,
      reference_type, reference_number, batch_number,
      unit_cost, total_value, notes, created_by, created_at
    ) VALUES (
      v_org_id, v_branch_id, v_med[v_i], v_inv[v_i],
      'grn', 
      CASE WHEN v_i <= 10 THEN 500 WHEN v_i <= 14 THEN 60 WHEN v_i <= 17 THEN 100 WHEN v_i <= 21 THEN 55 ELSE 50 END,
      0,
      CASE WHEN v_i <= 10 THEN 500 WHEN v_i <= 14 THEN 60 WHEN v_i <= 17 THEN 100 WHEN v_i <= 21 THEN 55 ELSE 50 END,
      'manual', 'GRN-SEED-' || LPAD(v_i::TEXT, 3, '0'),
      'SEED-' || LPAD(v_i::TEXT, 3, '0'),
      CASE WHEN v_i <= 10 THEN 15 WHEN v_i <= 14 THEN 80 WHEN v_i <= 17 THEN 60 WHEN v_i <= 21 THEN 80 ELSE 200 END,
      CASE WHEN v_i <= 10 THEN 7500 WHEN v_i <= 14 THEN 4800 WHEN v_i <= 17 THEN 6000 WHEN v_i <= 21 THEN 4400 ELSE 10000 END,
      'Opening stock - GRN receipt', v_user_id,
      CURRENT_DATE - INTERVAL '35 days'
    );
  END LOOP;

  -- Sale movements
  FOR v_i IN 1..35 LOOP
    INSERT INTO pharmacy_stock_movements (
      organization_id, branch_id, medicine_id, inventory_id,
      movement_type, quantity, previous_stock, new_stock,
      reference_type, reference_number, batch_number,
      unit_cost, total_value, notes, created_by, created_at
    ) VALUES (
      v_org_id, v_branch_id, v_med[1 + (v_i % 25)], v_inv[1 + (v_i % 25)],
      'sale', -(1 + (v_i % 5)),
      100 + v_i, 100 + v_i - (1 + (v_i % 5)),
      'pos_transaction', 'POS-SEED-' || LPAD(v_i::TEXT, 4, '0'),
      'SEED-' || LPAD((1 + (v_i % 25))::TEXT, 3, '0'),
      12 + (v_i * 3 % 50), (1 + (v_i % 5)) * (12 + (v_i * 3 % 50)),
      'POS retail sale', v_user_id,
      CURRENT_DATE - (v_i % 30) * INTERVAL '1 day'
    );
  END LOOP;

  -- Adjustment movements  
  FOR v_i IN 1..5 LOOP
    INSERT INTO pharmacy_stock_movements (
      organization_id, branch_id, medicine_id, inventory_id,
      movement_type, quantity, previous_stock, new_stock,
      reference_type, reference_number, batch_number,
      unit_cost, total_value, notes, created_by, created_at
    ) VALUES (
      v_org_id, v_branch_id, v_med[v_i * 5], v_inv[v_i * 5],
      'adjustment', CASE WHEN v_i % 2 = 0 THEN -2 ELSE 5 END,
      50, 50 + CASE WHEN v_i % 2 = 0 THEN -2 ELSE 5 END,
      'manual', 'ADJ-SEED-' || LPAD(v_i::TEXT, 3, '0'),
      'SEED-' || LPAD((v_i * 5)::TEXT, 3, '0'),
      20, 20 * ABS(CASE WHEN v_i % 2 = 0 THEN -2 ELSE 5 END),
      'Stock count adjustment', v_user_id,
      CURRENT_DATE - (v_i * 6) * INTERVAL '1 day'
    );
  END LOOP;

END $$;
