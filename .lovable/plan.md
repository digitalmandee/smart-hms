

# Fix Barcode Features and Build Integration Pages

## Problems Identified

1. **Barcode Label Page** (`/app/inventory/barcode-labels`) exists but only supports browser print -- no download as PDF or image
2. **Item Form** shows a barcode text field but no visual barcode preview or download on individual items
3. **Integrations Page** has "Barcode/QR Scanning" and "API Keys" marked as "Coming Soon" with disabled buttons -- these should be functional

## Changes

### 1. Enhance Barcode Label Page -- Add Download Options

**File: `src/pages/app/inventory/BarcodeLabelPage.tsx`**

- Add "Download PDF" button next to Print button (using jsPDF + html-to-image to capture the label grid as a downloadable PDF)
- Add "Download PNG" button to download labels as an image file
- Add per-label download: each BarcodeLabel gets a small download icon to save a single label as PNG

**File: `src/components/inventory/BarcodeLabelPrinter.tsx`**

- Add a download button on each individual BarcodeLabel card
- Use `html-to-image` (already installed) to convert the label div to a PNG blob and trigger browser download
- Add quantity selector per label (how many copies of each label to print)

### 2. Add Barcode Preview to Item Detail

**File: `src/pages/app/inventory/ItemFormPage.tsx`**

- Below the barcode text input field, render a live barcode preview using JsBarcode (same as the label component)
- Add a "Download Barcode" button next to the preview
- If no barcode value is entered, show the item_code as fallback with a note

### 3. Build Barcode/QR Scanning Integration Page

**File: `src/pages/app/inventory/integrations/BarcodeScannerSetup.tsx`** (NEW)

- Camera-based barcode scanning using the device camera (no external hardware needed)
- Scan a barcode to look up the item in inventory_items by barcode or item_code
- Display the found item details (name, stock, location)
- Quick actions after scan: View Item, Adjust Stock, Print Label
- Works on mobile and desktop (uses navigator.mediaDevices.getUserMedia)
- Note: Uses a lightweight approach -- capture frames from camera and decode using a JS barcode reader library or manual lookup

### 4. Build API Keys Management Page

**File: `src/pages/app/inventory/integrations/ApiKeysPage.tsx`** (NEW)

- Display existing API keys (masked) with created date and last used
- "Generate New Key" button that creates a UUID-based key
- Store keys in a new approach: use Supabase table or local display-once pattern
- Copy to clipboard functionality
- Revoke/delete keys
- Note: Since this is a demo/MVP, keys will be generated client-side and shown for reference; actual API gateway integration is out of scope

### 5. Update Integrations Page -- Remove "Coming Soon"

**File: `src/pages/app/inventory/WarehouseIntegrationsPage.tsx`**

- Change "Barcode/QR Scanning" status from "Coming Soon" to "Available"
- Change "API Keys" status from "Coming Soon" to "Available"  
- Add navigation: clicking "Setup" goes to `/app/inventory/integrations/barcode-scanner`
- Add navigation: clicking "Manage Keys" goes to `/app/inventory/integrations/api-keys`
- All 4 integration cards now show "Available" with working buttons

### 6. Add Routes

**File: `src/App.tsx`**

- Add route `/app/inventory/integrations/barcode-scanner` for BarcodeScannerSetup
- Add route `/app/inventory/integrations/api-keys` for ApiKeysPage

### 7. Multi-language Support

All new UI text will use the translation system (`useTranslation`) with keys added for English, Urdu, and Arabic in the respective translation files.

## Technical Details

| File | Action |
|------|--------|
| `src/pages/app/inventory/BarcodeLabelPage.tsx` | Update -- add PDF/PNG download buttons |
| `src/components/inventory/BarcodeLabelPrinter.tsx` | Update -- add per-label download button, quantity selector |
| `src/pages/app/inventory/ItemFormPage.tsx` | Update -- add barcode preview below input |
| `src/pages/app/inventory/integrations/BarcodeScannerSetup.tsx` | Create -- camera-based barcode scanner with item lookup |
| `src/pages/app/inventory/integrations/ApiKeysPage.tsx` | Create -- API key generation and management |
| `src/pages/app/inventory/WarehouseIntegrationsPage.tsx` | Update -- remove Coming Soon, add navigation |
| `src/App.tsx` | Update -- add 2 new routes |
| `src/lib/i18n/translations/en.ts` | Update -- add new translation keys |
| `src/lib/i18n/translations/ur.ts` | Update -- add Urdu translations |
| `src/lib/i18n/translations/ar.ts` | Update -- add Arabic translations |

### Libraries Used (all already installed)
- `html-to-image` -- convert DOM to PNG for download
- `jspdf` -- generate PDF from labels
- `jsbarcode` -- render barcodes in SVG
- `react-to-print` -- existing print functionality

