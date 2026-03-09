-- Fix orphaned lab orders: link to their paid invoices
UPDATE public.lab_orders SET invoice_id = 'ffd74c32-fff7-4feb-963e-656f998f9a7f', payment_status = 'paid' WHERE id = 'd7cc9c04-22db-4f4a-9e0e-eae759868aae' AND invoice_id IS NULL;
UPDATE public.lab_orders SET invoice_id = '8f0fccba-f3ef-4090-bc90-8f917fdd8c96', payment_status = 'paid' WHERE id = '80aa1b1d-e2d9-46d4-9342-ceb3c225ba91' AND invoice_id IS NULL;
UPDATE public.lab_orders SET invoice_id = 'da459bce-8722-4a68-9332-0f272e55a8cd', payment_status = 'paid' WHERE id = 'dc5aa71c-3774-49e6-8799-c9c5824ac0b2' AND invoice_id IS NULL;