

# Blood Bank Label Printer + Search/Filter Enhancement

## Part 1: Blood Bag Label Printer

### New Files

**`src/components/blood-bank/BloodBagLabel.tsx`**
A specialized blood bag label component (similar pattern to `BarcodeLabelPrinter` but blood-specific) with:
- Large blood group badge (color-coded, prominent)
- Barcode generated from `unit_number` using JsBarcode (CODE128)
- Fields: Unit Number, Component Type, Blood Group, Volume, Collection Date, Expiry Date, Donor Number, Storage Location, Bag Number
- All field labels translated via `useTranslation()` (EN/UR/AR)
- RTL-aware layout using `useDirection()`
- Download-as-PNG button per label (using `html-to-image`)
- Print-optimized CSS (`print:` classes)

**`src/pages/app/blood-bank/BloodBagLabelsPage.tsx`**
Full page with:
- Left panel: filterable table of blood inventory units (with search by unit number, blood group filter, component type filter, status filter)
- Right panel: live label preview grid
- Action buttons: Print selected, Download PNG, Download PDF
- Uses `useBloodInventory` hook with filters
- Checkbox multi-select (same pattern as `BarcodeLabelPage.tsx`)
- All UI text translated (EN/UR/AR)

### Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add route: `blood-bank/labels` -> `BloodBagLabelsPage` |
| `src/config/role-sidebars.ts` | Add "Bag Labels" under Blood Work children for `blood_bank_technician` |
| `src/lib/i18n/translations/en.ts` | Add ~20 blood bank label keys |
| `src/lib/i18n/translations/ur.ts` | Add corresponding Urdu translations |
| `src/lib/i18n/translations/ar.ts` | Add corresponding Arabic translations |
| `src/components/DynamicSidebar.tsx` | Add sidebar label mapping for "Bag Labels" |

---

## Part 2: Search Filter Enhancement for Blood Bank Pages

Currently, the blood bank pages (Donors, Inventory, Requests, Donations) have basic Select dropdowns but inconsistent search bars. I will add a proper unified search/filter bar using the existing `ListFilterBar` component pattern:

### Modified Files

| File | Change |
|------|--------|
| `src/pages/app/blood-bank/InventoryPage.tsx` | Add text search input (search by unit number, bag number, storage location) above the existing filters |
| `src/pages/app/blood-bank/DonationsPage.tsx` | Add date range filter and text search |
| `src/pages/app/blood-bank/RequestsListPage.tsx` | Add text search (by request number, patient name) |
| `src/pages/app/blood-bank/TransfusionsPage.tsx` | Add text search |

---

## Translation Keys (Sample)

```text
English:
  "bb.bagLabels": "Bag Labels"
  "bb.unitNumber": "Unit Number"
  "bb.bloodGroup": "Blood Group"
  "bb.componentType": "Component Type"
  "bb.collectionDate": "Collection Date"
  "bb.expiryDate": "Expiry Date"
  "bb.donorNumber": "Donor Number"
  "bb.storageLocation": "Storage Location"
  "bb.volume": "Volume"
  "bb.bagNumber": "Bag Number"
  "bb.selectUnits": "Select Units"
  "bb.labelPreview": "Label Preview"
  "bb.printLabels": "Print Labels"
  "bb.searchUnits": "Search by unit number, bag number..."

Urdu:
  "bb.bagLabels": "بیگ لیبل"
  "bb.unitNumber": "یونٹ نمبر"
  "bb.bloodGroup": "خون کا گروپ"
  "bb.componentType": "جز کی قسم"
  "bb.collectionDate": "جمع کرنے کی تاریخ"
  "bb.expiryDate": "میعاد ختم ہونے کی تاریخ"
  "bb.donorNumber": "ڈونر نمبر"
  "bb.storageLocation": "ذخیرہ مقام"

Arabic:
  "bb.bagLabels": "ملصقات الأكياس"
  "bb.unitNumber": "رقم الوحدة"
  "bb.bloodGroup": "فصيلة الدم"
  "bb.componentType": "نوع المكون"
  "bb.collectionDate": "تاريخ الجمع"
  "bb.expiryDate": "تاريخ الانتهاء"
  "bb.donorNumber": "رقم المتبرع"
  "bb.storageLocation": "موقع التخزين"
```

---

## Technical Details

- The label uses JsBarcode (already installed) for barcode generation from `unit_number`
- PNG download uses `html-to-image` (already installed), PDF uses `jsPDF` (already installed)
- Print uses `react-to-print` (already installed)
- RTL support via existing `useDirection()` hook -- labels flip layout for Urdu/Arabic
- Blood group badge reuses existing `BloodGroupBadge` component
- Inventory query reuses existing `useBloodInventory` hook with added search param
- The `useBloodInventory` hook in `useBloodBank.ts` will be extended to accept an optional `search` string parameter for text filtering (`.or()` on unit_number, bag_number, storage_location)

