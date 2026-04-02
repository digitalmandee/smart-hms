
-- Fix 1: Link payment methods to their proper GL accounts (Bank Account - Current = 1010)

-- Org a0: credit_card → Bank Account - Current
UPDATE public.payment_methods 
SET ledger_account_id = '0e476dc0-a992-45db-896a-e1159dba95fb'
WHERE id = '12eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Org b1: Bank Transfer → Bank Account - Current
UPDATE public.payment_methods 
SET ledger_account_id = '280997ad-4971-4e03-a032-cae3077106b0'
WHERE id = 'f4a44444-4444-4444-4444-444444444444';

-- Org b1: Credit Card → Bank Account - Current
UPDATE public.payment_methods 
SET ledger_account_id = '280997ad-4971-4e03-a032-cae3077106b0'
WHERE id = 'f5a55555-5555-5555-5555-555555555555';

-- Org b1: EasyPaisa → Bank Account - Current
UPDATE public.payment_methods 
SET ledger_account_id = '280997ad-4971-4e03-a032-cae3077106b0'
WHERE id = 'f3a33333-3333-3333-3333-333333333333';

-- Org b2: Credit Card → Bank Account - Current
UPDATE public.payment_methods 
SET ledger_account_id = '6ace12c8-15d0-4778-b38d-1ef4ff83fffd'
WHERE id = 'f9a99999-9999-9999-9999-999999999999';

-- Org b2: EasyPaisa → Bank Account - Current
UPDATE public.payment_methods 
SET ledger_account_id = '6ace12c8-15d0-4778-b38d-1ef4ff83fffd'
WHERE id = 'f8a88888-8888-8888-8888-888888888888';

-- Fix 2: Backfill journal entries for 6 seed invoices (org b1, total Rs. 30,830)
-- All are OPD invoices (INV- prefix) → DR AR-001, CR REV-001

-- INV-260116-0001 (Rs. 550)
INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, reference_type, reference_id, description, is_posted, created_by)
VALUES ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'JE-INV-BACKFILL-0001', CURRENT_DATE, 'invoice', 'cf345b27-3c1a-4998-bef2-c0c48fc3331a', 'Backfill: Invoice INV-260116-0001 - Rs. 550', true, NULL);

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, 'bae4c6e9-1bd2-422a-b53b-ed13ca635070', 550, 0, 'AR - Invoice INV-260116-0001'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = 'cf345b27-3c1a-4998-bef2-c0c48fc3331a';

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, '85848bd7-dfe5-444b-a313-86a1427d6ec0', 0, 550, 'Revenue - Invoice INV-260116-0001'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = 'cf345b27-3c1a-4998-bef2-c0c48fc3331a';

-- INV-260116-0002 (Rs. 1,550)
INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, reference_type, reference_id, description, is_posted, created_by)
VALUES ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'JE-INV-BACKFILL-0002', CURRENT_DATE, 'invoice', '8207732f-32f1-417c-966f-9fc0830c7fb8', 'Backfill: Invoice INV-260116-0002 - Rs. 1,550', true, NULL);

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, 'bae4c6e9-1bd2-422a-b53b-ed13ca635070', 1550, 0, 'AR - Invoice INV-260116-0002'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = '8207732f-32f1-417c-966f-9fc0830c7fb8';

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, '85848bd7-dfe5-444b-a313-86a1427d6ec0', 0, 1550, 'Revenue - Invoice INV-260116-0002'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = '8207732f-32f1-417c-966f-9fc0830c7fb8';

-- INV-260116-0003 (Rs. 880)
INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, reference_type, reference_id, description, is_posted, created_by)
VALUES ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'JE-INV-BACKFILL-0003', CURRENT_DATE, 'invoice', 'b4d28310-2aec-4951-b0bc-460007807f95', 'Backfill: Invoice INV-260116-0003 - Rs. 880', true, NULL);

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, 'bae4c6e9-1bd2-422a-b53b-ed13ca635070', 880, 0, 'AR - Invoice INV-260116-0003'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = 'b4d28310-2aec-4951-b0bc-460007807f95';

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, '85848bd7-dfe5-444b-a313-86a1427d6ec0', 0, 880, 'Revenue - Invoice INV-260116-0003'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = 'b4d28310-2aec-4951-b0bc-460007807f95';

-- INV-260116-0004 (Rs. 2,550)
INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, reference_type, reference_id, description, is_posted, created_by)
VALUES ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'JE-INV-BACKFILL-0004', CURRENT_DATE, 'invoice', '12881184-49e3-43ee-aa8b-25502d2f61c0', 'Backfill: Invoice INV-260116-0004 - Rs. 2,550', true, NULL);

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, 'bae4c6e9-1bd2-422a-b53b-ed13ca635070', 2550, 0, 'AR - Invoice INV-260116-0004'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = '12881184-49e3-43ee-aa8b-25502d2f61c0';

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, '85848bd7-dfe5-444b-a313-86a1427d6ec0', 0, 2550, 'Revenue - Invoice INV-260116-0004'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = '12881184-49e3-43ee-aa8b-25502d2f61c0';

-- INV-260116-0005 (Rs. 16,500)
INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, reference_type, reference_id, description, is_posted, created_by)
VALUES ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'JE-INV-BACKFILL-0005', CURRENT_DATE, 'invoice', '6377e8dd-99e5-4e56-a87b-7ed7a63e8ec9', 'Backfill: Invoice INV-260116-0005 - Rs. 16,500', true, NULL);

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, 'bae4c6e9-1bd2-422a-b53b-ed13ca635070', 16500, 0, 'AR - Invoice INV-260116-0005'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = '6377e8dd-99e5-4e56-a87b-7ed7a63e8ec9';

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, '85848bd7-dfe5-444b-a313-86a1427d6ec0', 0, 16500, 'Revenue - Invoice INV-260116-0005'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = '6377e8dd-99e5-4e56-a87b-7ed7a63e8ec9';

-- INV-260116-0006 (Rs. 8,800)
INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, reference_type, reference_id, description, is_posted, created_by)
VALUES ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'JE-INV-BACKFILL-0006', CURRENT_DATE, 'invoice', 'e7f61101-2311-4033-80af-b4ce02ef30fc', 'Backfill: Invoice INV-260116-0006 - Rs. 8,800', true, NULL);

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, 'bae4c6e9-1bd2-422a-b53b-ed13ca635070', 8800, 0, 'AR - Invoice INV-260116-0006'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = 'e7f61101-2311-4033-80af-b4ce02ef30fc';

INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
SELECT je.id, '85848bd7-dfe5-444b-a313-86a1427d6ec0', 0, 8800, 'Revenue - Invoice INV-260116-0006'
FROM public.journal_entries je WHERE je.reference_type = 'invoice' AND je.reference_id = 'e7f61101-2311-4033-80af-b4ce02ef30fc';
