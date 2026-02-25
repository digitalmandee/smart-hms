-- Clean up duplicate menu items under Accounts & Finance parent
-- Keep items WITH required_permission (proper access control), delete duplicates WITHOUT permissions

-- Delete duplicate Chart of Accounts (keep b4bf01a3 with accounts.view, delete 61e743d6)
DELETE FROM menu_items WHERE id = '61e743d6-ccde-4285-9e03-6fd60ce3c084';

-- Delete duplicate Account Types (keep 53211808 with accounts.settings, delete d91673dd)
DELETE FROM menu_items WHERE id = 'd91673dd-8051-44e6-b418-483cff925dfa';

-- Delete duplicate Journal Entries (keep 25f1a792 with accounts.view, delete a6b0fe20)
DELETE FROM menu_items WHERE id = 'a6b0fe20-6c59-4ddd-bf2d-08bab1fd572c';

-- Delete duplicate General Ledger (keep c510d1a0 with accounts.view, delete 8c743d3c)
DELETE FROM menu_items WHERE id = '8c743d3c-6534-4b9a-becf-8ee6970889e5';

-- Delete duplicate Bank & Cash (keep 274e76d5 with accounts.bank, delete 75d8737d)
DELETE FROM menu_items WHERE id = '75d8737d-dfac-4817-8404-6662c36529f0';

-- Delete duplicate Budgets (keep 7c69a510 with accounts.budgets, delete 5e644ab3)
DELETE FROM menu_items WHERE id = '5e644ab3-322f-4f47-87bb-1e040192cd15';

-- Delete duplicate Financial Reports (keep 33b40ddd with accounts.view, delete e8c1e290)
DELETE FROM menu_items WHERE id = 'e8c1e290-9b83-4630-a5ff-b557558136fa';

-- Now fix sort_order for remaining items to be consistent and ordered properly
UPDATE menu_items SET sort_order = 10 WHERE id = '5262b781-71cb-46c2-ba14-b5750b0030b1'; -- Dashboard
UPDATE menu_items SET sort_order = 20 WHERE id = 'b4bf01a3-d5ee-427b-943a-5f89ba964589'; -- Chart of Accounts
UPDATE menu_items SET sort_order = 25 WHERE id = '53211808-678c-49a4-a3ed-825e46c06b48'; -- Account Types
UPDATE menu_items SET sort_order = 30 WHERE id = '25f1a792-d431-4f5c-beeb-3689b856da40'; -- Journal Entries
UPDATE menu_items SET sort_order = 35 WHERE id = 'c510d1a0-87e4-4f18-9bea-30b1e901be20'; -- General Ledger
UPDATE menu_items SET sort_order = 40 WHERE id = '274e76d5-5c6c-44d5-8e78-ea245739b382'; -- Bank & Cash
UPDATE menu_items SET sort_order = 45 WHERE id = '7c69a510-037e-48a9-9866-e28e1219e806'; -- Budgets & Fiscal Years
UPDATE menu_items SET sort_order = 50 WHERE id = '33b40ddd-6093-4a25-b5d3-bcb41d07206f'; -- Financial Reports
UPDATE menu_items SET sort_order = 55 WHERE id = '5fa54e1a-0b0f-48bf-95a9-d4596981ad73'; -- Expense Management
UPDATE menu_items SET sort_order = 60 WHERE id = '9c1db7f3-b2e5-4d12-a2c3-2bf4f042d3fc'; -- Accounts Receivable
UPDATE menu_items SET sort_order = 65 WHERE id = '9619125b-aeba-4dc7-9979-6e99b39248c9'; -- Vendor Payments
UPDATE menu_items SET sort_order = 70 WHERE id = 'aed08da3-0cfa-469c-b21d-bb5a3c322055'; -- Accounts Payable

-- Add required_permission to items that are missing them for proper access control
UPDATE menu_items SET required_permission = 'accounts.view' WHERE id = '5fa54e1a-0b0f-48bf-95a9-d4596981ad73'; -- Expense Management
UPDATE menu_items SET required_permission = 'accounts.payables' WHERE id = '9619125b-aeba-4dc7-9979-6e99b39248c9'; -- Vendor Payments

-- Remove required_module from Expense Management since permissions handle access
UPDATE menu_items SET required_module = NULL WHERE id = '5fa54e1a-0b0f-48bf-95a9-d4596981ad73';