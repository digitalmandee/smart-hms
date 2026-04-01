

# Add/Update Medicines with Pricing from Vendor Price List

## What We're Doing
Adding 8 medicines from the uploaded vendor price list into the pharmacy catalog. If any already exist (matched by name), their cost and sale prices will be updated. All medicines get ~15% profit margin as shown in the image.

## Medicines to Add/Update

| Medicine | Strength | Unit | Cost Price (Net Rate) | Sale Price | Margin |
|----------|----------|------|-----------------------|------------|--------|
| AIRTAL 100MG TAB | 100mg | tablet | 308.55 | 363.00 | 15% |
| COMBIVAIR 400MG CAP | 400mg | capsule | 408.00 | 480.00 | 15% |
| HERBESSER TAB 30MG | 30mg | tablet | 334.90 | 394.00 | 15% |
| KESTINE 10MG | 10mg | tablet | 252.71 | 297.30 | 15% |
| LOPRIN 75MG TAB | 75mg | tablet | 60.61 | 71.31 | 15% |
| NEBIX 2.5MG | 2.5mg | tablet | 274.55 | 323.00 | 15% |
| SKILAX DROPS 30ML | 30ml | drops | 110.50 | 130.00 | 15% |
| PULMONOL LOZENGES | - | tablet | 88.15 | 118.00 | 25% |

## Technical Approach

**Migration SQL** — single migration file that:
1. Looks up the user's `organization_id` from `profiles` (first org found)
2. Uses `INSERT ... ON CONFLICT` pattern — but since `medicines` has no unique constraint on `name+org`, we'll use a two-step approach:
   - For each medicine, check if it exists by name (case-insensitive) + organization
   - If exists → UPDATE `cost_price`, `sale_price`
   - If not → INSERT with name, strength, unit, cost_price, sale_price

The migration will use a PL/pgSQL `DO` block with `INSERT INTO medicines ... ON CONFLICT` or an upsert-style loop.

## Files Changed
- **1 migration file** — SQL to insert/update 8 medicines with correct pricing

