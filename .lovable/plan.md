
# Tabeebi Smart Pharmacy AI - Stock-Aware Recommendations + One-Click Add

## What We're Building

When a pharmacist searches for a medicine alternative via "Tabeebi Medicine Check," the system will automatically cross-reference the AI results with your actual inventory. Alternatives that are **in stock** get a green "In Stock" badge and a one-click "Add to Cart" button. Out-of-stock alternatives are grayed out. This turns Tabeebi from a lookup tool into a direct sales assistant.

Additionally, we'll add a **Tabeebi Smart Suggest** widget that proactively recommends commonly paired medicines (e.g., "You added Augmentin -- consider adding a probiotic") based on what's already in the cart.

## Changes

### 1. Stock-Aware Alternative Results with One-Click Add

**File: `src/components/pharmacy/POSMedicineAlternatives.tsx`**

Current state: Results show alternative names as plain text. No connection to inventory.

New behavior:
- After AI returns alternatives, fuzzy-match each name against `medicine_inventory` (via the existing `useInventory` hook with a search query)
- For each alternative, show stock status:
  - **In Stock**: Green badge with quantity + "Add" button
  - **Out of Stock**: Dimmed text, no button
- Clicking "Add" instantly adds the matched inventory item to the POS cart (same as `POSProductSearch` does)
- The component now receives `onAddToCart` prop (same `CartItem` callback as `POSProductSearch`)

Implementation approach:
- After results are parsed in the existing `useEffect`, trigger a batch inventory lookup using `supabase.from('medicine_inventory')` with `.or()` filter matching each alternative name
- Store matched inventory in local state
- Render each result card with stock info and an "Add" button when matched

### 2. Pass `onAddToCart` to POSMedicineAlternatives

**File: `src/pages/app/pharmacy/POSTerminalPage.tsx`**

- Change `<POSMedicineAlternatives />` to `<POSMedicineAlternatives onAddToCart={handleAddToCart} />`

### 3. Tabeebi Cart Companion - "Frequently Bought Together" Suggestions

**File: `src/components/pharmacy/POSCartCompanion.tsx` (new)**

A small Tabeebi-branded widget placed above or below the cart that watches what's in the cart and suggests complementary medicines:

- When a medicine is added to cart, call the `pharmacy_lookup` mode with a prompt like: "For a patient buying [medicine names], suggest 2-3 complementary OTC medicines commonly recommended together. Return JSON array of names."
- Cross-reference results with inventory (same pattern as above)
- Show as small pill-shaped suggestion chips with "Add" buttons
- Debounced: only triggers 1.5s after the last cart change, and only if cart has items
- Collapsible, branded with DoctorAvatar (xs)

### 4. Tabeebi Expiry Intelligence

**File: `src/components/pharmacy/ExpiryAlert.tsx`**

- Add Tabeebi branding (DoctorAvatar xs icon)
- When clicked, show a Tabeebi-powered suggestion: "These items are expiring soon. Consider running a discount promotion or bundling them."
- Small enhancement, mostly branding alignment

## Technical Summary

| File | Change |
|------|--------|
| `src/components/pharmacy/POSMedicineAlternatives.tsx` | Add `onAddToCart` prop, inventory lookup after AI results, stock badges, one-click "Add" buttons |
| `src/pages/app/pharmacy/POSTerminalPage.tsx` | Pass `onAddToCart={handleAddToCart}` to `POSMedicineAlternatives` |
| `src/components/pharmacy/POSCartCompanion.tsx` | New component: AI-powered "frequently bought together" suggestions with stock check and one-click add |
| `src/components/pharmacy/ExpiryAlert.tsx` | Minor Tabeebi branding update |

### Inventory Matching Strategy

```text
AI returns: ["Calpol", "Tylenol", "Febrol", "Provas", "Panadol CF"]
                    |
         Query medicine_inventory
         .or('medicine.name.ilike.%Calpol%,...')
         .gt('quantity', 0)
                    |
         Match results by fuzzy name comparison
                    |
         Render: [Calpol - In Stock (45) [+ Add]] [Tylenol - Out of Stock]
```

### Data Flow for Cart Companion

```text
Cart changes -> debounce 1.5s -> AI prompt with cart items
     -> parse JSON array -> inventory lookup
     -> show suggestion chips with [+ Add] buttons
```

No database migrations needed. No new edge function modes needed (reuses `pharmacy_lookup`). No new secrets required.
