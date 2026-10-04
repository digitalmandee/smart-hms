# Blood Camps: cost and profit per bag

Add a new **Expenses** section and money figures to each camp's Report tab, in English, Urdu and Arabic (right-to-left for Urdu and Arabic).

## What staff will see
1. **Expenses list** on the camp's Report tab: add, edit or remove a line by type, with an amount and a note. Types: Transport/vehicle, Staff allowance, Refreshments for donors, Bags and kits, Tent/venue, Publicity, Other.
2. **Money summary cards**:
   - Total camp expenses
   - Cost per bag collected (expenses ÷ bags collected)
   - Cost per usable bag (expenses ÷ bags that passed receiving and testing)
   - Income from issued bags (billed to patients from this camp's bags)
   - Profit or loss overall, and per bag issued (shown green for profit, red for loss)
3. A breakdown of expenses by type.
4. Amounts use the hospital's currency. If no bags were collected yet, per-bag figures show "–" instead of zero.

## Rules
- Only blood bank staff and the hospital admin can add or change expenses, same as the rest of the camp.
- Expenses can't be changed once the camp is marked Received, unless an admin reopens them (keeps the report fixed after closing).
- Camp expenses are recorded for the report only; they don't post to the accounts ledger in this step.

## Technical details
- New table `blood_camp_expenses` (camp_id, organization_id, category, amount, notes, created_by, timestamps) with grants, row security limited to the user's own hospital, and an updated_at trigger; a trigger blocks changes when the camp status is `received` for non-admins.
- Income: sum of `invoice_items` / invoice totals linked through `blood_inventory.invoice_id` for units with this `camp_id` (per-unit share when one invoice covers several bags).
- `useBloodCamp` also loads expenses and income; new `useCampExpense` mutation in `useBloodCamps.ts`.
- UI in the Report tab of `CampDetailPage.tsx` using `useCurrencyFormatter`; new labels in `camp-i18n.ts`.
