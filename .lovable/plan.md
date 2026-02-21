

# Integrate Barcode Scanner into Pick, Pack, and GRN Workflows

## Current Situation

- A standalone barcode scanner page exists at `/app/inventory/integrations/barcode-scanner` -- it only does item lookup
- The **Pick List Detail** page requires manual clicking of "Pick" buttons for each item -- no scan-to-pick
- The **Packing Slip Detail** page has no scanning at all -- items are verified manually
- The **GRN Detail** page has no scanning for receiving items
- On mobile (Capacitor app), warehouse staff should be able to scan barcodes hands-free while walking through aisles

## Where Scanners Are Needed

```text
+---------------------------+------------------------------------------+
| Workflow                  | Scanner Use Case                         |
+---------------------------+------------------------------------------+
| Pick List (Picking)       | Scan item barcode to auto-pick that row  |
| Packing Slip (Packing)    | Scan item to confirm it is packed        |
| GRN (Receiving)           | Scan item to match against PO line       |
| Bin Assignment (Put-Away) | Scan bin code + item to assign location  |
+---------------------------+------------------------------------------+
```

## Plan

### 1. Create Reusable Scanner Component

**New file: `src/components/inventory/InlineBarcodeScannerInput.tsx`**

A compact, inline barcode input component that can be dropped into any page:
- Text input field with a camera icon button
- Clicking the camera icon opens a small camera viewfinder overlay (not full page)
- On mobile: uses rear camera via `getUserMedia`
- Manual entry always available (type or paste barcode)
- Fires an `onScan(code: string)` callback when a barcode is entered/scanned
- Includes haptic feedback on successful scan (Capacitor Haptics)
- Small footprint -- designed to sit at the top of a table or card

### 2. Integrate into Pick List Detail Page

**File: `src/pages/app/inventory/PickListDetailPage.tsx`**

- Add `InlineBarcodeScannerInput` above the items table
- When a barcode is scanned:
  - Match against `item_code` or `barcode` of pending pick items
  - If found, auto-fill the quantity and mark as "picked" with a success toast
  - If not found in this pick list, show an error toast
  - Haptic feedback on match/mismatch
- Visual: scanned row briefly highlights green
- Focus stays on scanner input for continuous scanning

### 3. Integrate into Packing Slip Detail Page

**File: `src/pages/app/inventory/PackingSlipDetailPage.tsx`**

- Add `InlineBarcodeScannerInput` above the packed items table
- When scanned:
  - Match against items in the packing slip
  - Show a checkmark confirmation next to the matched item
  - Track scan count vs expected quantity
  - Toast: "Item confirmed: [name] (3/5 scanned)"
- Add a "Scanned" column to the items table showing scan progress

### 4. Integrate into GRN Detail Page

**File: `src/pages/app/inventory/GRNDetailPage.tsx`**

- Add `InlineBarcodeScannerInput` in the items section
- When scanned:
  - Match barcode against PO line items
  - Highlight the matched row
  - Auto-focus the received quantity input for that item
  - Toast showing item name and expected quantity

### 5. Update Translations

Add scanner-related text in all 3 languages (English, Urdu, Arabic):
- "Scan barcode to pick item"
- "Scan barcode to verify packed item"
- "Scan barcode to receive item"
- "Item matched", "Item not found in this list"
- "Scanned successfully"

## Technical Details

| File | Action |
|------|--------|
| `src/components/inventory/InlineBarcodeScannerInput.tsx` | Create -- reusable scan input with camera toggle |
| `src/pages/app/inventory/PickListDetailPage.tsx` | Update -- add scanner, auto-pick on scan |
| `src/pages/app/inventory/PackingSlipDetailPage.tsx` | Update -- add scanner, scan-to-verify items |
| `src/pages/app/inventory/GRNDetailPage.tsx` | Update -- add scanner, scan-to-match PO items |
| `src/lib/i18n/translations/en.ts` | Update -- add scanner integration keys |
| `src/lib/i18n/translations/ur.ts` | Update -- add Urdu translations |
| `src/lib/i18n/translations/ar.ts` | Update -- add Arabic translations |

### Scanner Component Props
- `onScan: (code: string) => void` -- callback with scanned/entered code
- `placeholder?: string` -- input placeholder text
- `autoFocus?: boolean` -- focus on mount for continuous scanning
- `disabled?: boolean` -- disable during processing

### Mobile Considerations
- Camera uses `facingMode: "environment"` (rear camera)
- Touch targets are 48px minimum
- Haptic feedback via `@capacitor/haptics` (already installed)
- Input font size 16px+ to prevent iOS zoom

