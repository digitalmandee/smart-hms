

# Donor ID Card Printing Feature

## Overview
Add a dedicated page for printing donor ID cards (credit card sized, 85.6mm x 53.98mm) with photo placeholder, donor number, blood group, name, QR code, and full trilingual support (EN/UR/AR). Follows the exact same pattern as the existing `PrintablePatientCard` and `BloodBagLabelsPage`.

---

## New Files

### 1. `src/components/blood-bank/PrintableDonorCard.tsx`
A credit-card-sized printable donor ID card component:

**Front of Card:**
- Header bar with organization name + "BLOOD DONOR CARD" title (red gradient, matching blood bank theme)
- Photo placeholder (18mm x 22mm)
- Donor name (bold, large)
- Donor number (mono font, prominent)
- Blood group (large, color-coded, using `BloodGroupBadge`)
- Info grid: Gender, Age, Phone, Total Donations
- QR code (bottom-right) generated via existing `generateQRCodeUrl()` from `src/lib/qrcode.ts`, encoding a donor lookup URL

**Back of Card:**
- Blood group (large, prominent)
- Donation history summary (total donations, last donation date)
- Organization contact info (name, address, phone)
- "This card certifies the holder as a registered blood donor" text

All field labels use `useTranslation()` with RTL support via `useDirection()`.

### 2. `src/pages/app/blood-bank/DonorCardPrintPage.tsx`
Full page with:
- Left panel: searchable/filterable donor list with checkboxes (reuses `useBloodDonors` hook with search, blood group, and status filters via `ListFilterBar`)
- Right panel: live card preview of selected donors
- Actions: Print (via `react-to-print`), Download PNG (via `html-to-image`), Download PDF (via `jsPDF`)
- Same dual-panel layout pattern as `BloodBagLabelsPage`

---

## Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add route: `blood-bank/donor-cards` pointing to `DonorCardPrintPage` |
| `src/config/role-sidebars.ts` | Add "Donor Cards" item under the "Donors" children group (line ~612) with `CreditCard` icon |
| `src/lib/i18n/translations/en.ts` | Add ~10 keys: `bb.donorCard`, `bb.donorIdCard`, `bb.totalDonations`, `bb.lastDonation`, `bb.registeredDonor`, `bb.selectDonors`, `bb.cardPreview` |
| `src/lib/i18n/translations/ur.ts` | Urdu equivalents |
| `src/lib/i18n/translations/ar.ts` | Arabic equivalents |
| `src/lib/qrcode.ts` | Add `getDonorVerificationUrl(donorNumber, orgSlug)` helper |

---

## Translation Keys

```text
English:
  "bb.donorCard": "Donor Cards"
  "bb.donorIdCard": "BLOOD DONOR CARD"
  "bb.totalDonations": "Total Donations"
  "bb.lastDonation": "Last Donation"
  "bb.registeredDonor": "This card certifies the holder as a registered blood donor"
  "bb.selectDonors": "Select donors to print cards"
  "bb.cardPreview": "Card Preview"
  "bb.downloadPng": "Download PNG"

Urdu:
  "bb.donorCard": "ڈونر کارڈز"
  "bb.donorIdCard": "بلڈ ڈونر کارڈ"
  "bb.totalDonations": "کل عطیات"
  "bb.lastDonation": "آخری عطیہ"
  "bb.registeredDonor": "یہ کارڈ حامل کی رجسٹرڈ بلڈ ڈونر کی حیثیت کی تصدیق کرتا ہے"
  "bb.selectDonors": "کارڈ پرنٹ کرنے کے لیے ڈونرز منتخب کریں"
  "bb.cardPreview": "کارڈ پیش نظارہ"

Arabic:
  "bb.donorCard": "بطاقات المتبرعين"
  "bb.donorIdCard": "بطاقة متبرع بالدم"
  "bb.totalDonations": "إجمالي التبرعات"
  "bb.lastDonation": "آخر تبرع"
  "bb.registeredDonor": "تشهد هذه البطاقة بأن حاملها متبرع مسجل بالدم"
  "bb.selectDonors": "اختر المتبرعين لطباعة البطاقات"
  "bb.cardPreview": "معاينة البطاقة"
```

---

## Technical Details

- QR code uses the existing `generateQRCodeUrl()` utility (QR Server API, no library needed)
- Print uses `react-to-print`, PNG uses `html-to-image`, PDF uses `jsPDF` -- all already installed
- Card dimensions: 85.6mm x 53.98mm (ISO/IEC 7810 ID-1, standard credit card size)
- RTL layout flips photo/info positions and text alignment for Urdu/Arabic
- Reuses `BloodGroupBadge` component for consistent blood group display
- Follows exact patterns from `PrintablePatientCard` (card layout) and `BloodBagLabelsPage` (page structure)

