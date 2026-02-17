

# Tabeebi Branding for Pharmacy POS + AI Components Polish

## Problem
The Pharmacy POS "AI Medicine Alternatives" panel has no Tabeebi branding -- it uses a generic Sparkles icon and plain text. Every other AI surface in the app (Patient Chat, Doctor Panel, Consultation) is branded as "Tabeebi." This inconsistency needs fixing.

## Changes

### 1. Rebrand POSMedicineAlternatives with Tabeebi Identity

**File: `src/components/pharmacy/POSMedicineAlternatives.tsx`**

- Replace `Sparkles` icon with `DoctorAvatar` (size "xs") in the collapsible trigger
- Rename label from "AI Medicine Alternatives" to "Tabeebi Medicine Check"
- Add a subtle teal-tinted border/background to the collapsible panel (`border-primary/20 bg-primary/5`) matching the Tabeebi card style used in `AIChatPage.tsx`
- Change "Finding alternatives..." loader text to "Tabeebi is checking..."
- Add a small "Powered by Tabeebi" footer text below results
- Improve results display:
  - Salt badge gets a teal color scheme (`bg-primary/10 text-primary border-primary/20`)
  - Alternative badges get numbered labels (1, 2, 3...) for quick reference
  - Add a subtle divider between salt info and alternatives

### 2. Improve Pharmacy POS Panel UI/UX

**File: `src/components/pharmacy/POSMedicineAlternatives.tsx`**

- Wrap the entire component in a `Card` with `border-primary/20` instead of a bare Collapsible
- Use `CardHeader` for the trigger (consistent with `DoctorAIPanel` pattern)
- Better spacing: search input gets proper padding, results get a clean list layout instead of scattered badges
- Salt toggle gets a label update: "Show Salt Composition" to "Include Salt/Generic Info"
- Empty state: Show a one-liner hint "Type a medicine name to find alternatives" when not searched

### 3. Ensure Tabeebi Branding on Doctor Consultation MedicineAlternatives

**File: `src/components/ai/MedicineAlternatives.tsx`**

- Replace `Pill` icon in CardTitle with `DoctorAvatar` (size "xs")
- Rename title from "Medicine Alternatives" to "Tabeebi Medicine Alternatives"
- Add "Powered by Tabeebi" hint in empty state text

## Technical Summary

| File | Change |
|------|--------|
| `src/components/pharmacy/POSMedicineAlternatives.tsx` | Full Tabeebi rebrand: DoctorAvatar, teal theming, Card wrapper, improved results UI |
| `src/components/ai/MedicineAlternatives.tsx` | Add DoctorAvatar icon and Tabeebi naming |

No new dependencies or edge function changes needed -- this is purely UI/branding work using existing components.

