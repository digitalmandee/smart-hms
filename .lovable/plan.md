

# Tax Slabs — HR Income Tax + Billing Sales Tax

## Current State

### HR Income Tax Slabs — Already Built ✅
- Table `tax_slabs` exists with: fiscal_year, min_income, max_income, fixed_tax, tax_percentage
- Page at `/app/hr/setup/tax-slabs` with full CRUD
- Used in payroll processing

### Billing Sales Tax Slabs — Missing ❌
- `invoice_items` has no `tax_percent` or `tax_amount` column
- `invoices` has a `tax_amount` column but it's manually set, not derived from line items
- Tax Settings page only stores a single default rate in `organization_settings`
- No way to assign different tax rates to different service categories (e.g., Medicines 0%, Consultation 17%, Lab 5%)

## Plan

### 1. New Database Table: `billing_tax_slabs`

```sql
CREATE TABLE public.billing_tax_slabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,            -- e.g., "Standard Rate", "Zero Rated", "Reduced Rate"
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  applies_to TEXT DEFAULT 'all', -- 'all', 'services', 'medicines', 'lab', 'custom'
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Add `tax_percent` and `tax_amount` columns to `invoice_items`:
```sql
ALTER TABLE invoice_items 
  ADD COLUMN tax_percent NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN tax_amount NUMERIC(12,2) DEFAULT 0;
```

### 2. New Page: Billing Tax Slabs Setup
- Route: `/app/settings/billing-tax-slabs`
- CRUD interface to create tax categories (Zero Rated, Standard 17%, Reduced 5%, etc.)
- Mark one as default
- Link from Tax Settings page

### 3. Update Tax Settings Page
- Add a section showing billing tax slabs with "Manage Tax Slabs" button
- Keep existing default rate as fallback

### 4. Update Invoice Form
- When adding invoice line items, auto-apply the default tax slab rate
- Allow overriding tax rate per line item via dropdown of active slabs
- Recalculate `tax_amount` per line and invoice total tax

### 5. Translations (en, ur, ar)
- New keys for billing tax slab labels, column headers, form fields

## Files to Change
- **New migration** — `billing_tax_slabs` table + `invoice_items` tax columns
- **New file**: `src/pages/app/settings/BillingTaxSlabsPage.tsx` — CRUD page
- **`src/pages/app/settings/TaxSettingsPage.tsx`** — add link to billing tax slabs
- **`src/App.tsx`** — add route for billing tax slabs
- **Invoice form components** — add tax slab selector per line item
- **`en.ts`, `ur.ts`, `ar.ts`** — translation keys

