
INSERT INTO public.menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_module)
SELECT 'expense_management', 'Expense Management', '/app/accounts/expenses', 'Receipt', mi.id, 55, true, 'accounts'
FROM public.menu_items mi WHERE mi.name = 'Accounts & Finance' AND mi.parent_id IS NULL
AND NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'expense_management')
LIMIT 1;
