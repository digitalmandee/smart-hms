

# AI Medicine Alternatives in Pharmacy POS

## What This Does

Adds a small AI-powered panel in the POS terminal where pharmacists can quickly look up medicine alternatives. Two modes:

1. **Quick Mode (default)**: Type a medicine name (e.g., "Panadol") -- get a concise list of alternative brand names
2. **Salt/Details Mode**: Toggle to see the generic salt composition and alternatives grouped by salt

## UI Placement

The panel will be added as a collapsible section in the **left panel** of the POS terminal (below the product search area, above recent products). It stays compact -- a single input with a toggle, expanding only when results appear.

```text
+------------------------------------------+------------------+
| [Product Search Bar]                     |   Cart Panel     |
| [Category Filters]                       |                  |
| [Search Results Grid]                    |                  |
|                                          |                  |
| [AI Alternatives] (collapsible)         |                  |
|   [Medicine name input] [Search] [Salt?] |                  |
|   - Brand A                              |                  |
|   - Brand B (recommended)                |                  |
|   - Brand C                              |                  |
|                                          |                  |
| [Recent Products]                        |                  |
| [Patient Search]                         |                  |
+------------------------------------------+------------------+
```

## How It Works

### Default (Brand Alternatives)
- Pharmacist types "Panadol" and hits Enter/Search
- AI returns: `["Panadol", "Calpol", "Tylenol", "Adol", "Fevadol"]` -- just names, nothing else
- Displayed as a simple vertical list of clickable chips

### Salt Toggle ON
- Pharmacist types "Panadol" and enables "Show Salt" toggle
- AI returns: salt name + alternative brands
- Example: `{ salt: "Paracetamol (Acetaminophen) 500mg", alternatives: ["Calpol", "Tylenol", "Adol", "Fevadol"] }`
- Salt shown as a highlighted badge above the list

## Technical Details

### New Component: `src/components/pharmacy/POSMedicineAlternatives.tsx`

- Compact collapsible card with Sparkles icon
- Input field + Search button + "Salt" toggle switch
- Uses `useAIChat` hook with `mode: "doctor_assist"` (same as existing MedicineAlternatives)
- Two different prompts based on toggle state:
  - **Names only**: `"List 5 alternative brand names for '{medicine}' available in Pakistan. Return ONLY a JSON array of strings. No explanation."`
  - **With salt**: `"For medicine '{medicine}': return JSON {\"salt\":\"generic/salt composition\", \"alternatives\":[\"Brand1\",\"Brand2\",...]}. Include 5 alternatives available in Pakistan. No other text."`
- Results parsed from AI JSON response
- Reset button to clear and search again

### Integration in `src/pages/app/pharmacy/POSTerminalPage.tsx`

- Import and add `POSMedicineAlternatives` in the left panel ScrollArea, between POSProductSearch and POSRecentProducts
- No cart interaction needed -- this is purely informational for the pharmacist

### File Changes

| File | Change |
|------|--------|
| `src/components/pharmacy/POSMedicineAlternatives.tsx` | New compact AI alternatives panel for POS |
| `src/pages/app/pharmacy/POSTerminalPage.tsx` | Add the component in left panel |

