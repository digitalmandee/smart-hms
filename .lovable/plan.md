

# Fix: Radiology Report View + Patient Profile Integration

## Two Problems

1. **ReportEntryPage** always shows an editable form — even for completed/verified reports. When clicking from the "Completed" tab, it should show a **read-only formatted report** with print capability.
2. **PatientImagingHistory** on the patient profile lacks **Print Report** and **View Report** buttons (unlike lab which has both). The imaging detail dialog exists but there's no quick print from the list.

---

## Plan

### 1. Make ReportEntryPage show read-only view for finalized reports

**File**: `src/pages/app/radiology/ReportEntryPage.tsx`

- Import `useImagingResult`, `PrintableImagingReport`, `usePrint`, `Badge`, `Separator`, `Printer`, `format`
- Fetch existing result with `useImagingResult(id)`
- If `order.status` is `reported`, `verified`, or `delivered`:
  - Show read-only report view (same layout as ReportVerificationPage but without verify/reject buttons)
  - Display: findings, impression, recommendations in `bg-muted` blocks
  - Show finding status badge, reported/verified timestamps
  - Add Print button in header
  - Include hidden `PrintableImagingReport` for printing
- If status is `completed` or earlier: show existing editable form (pre-populate from result if available)

### 2. Add Print Report button to PatientImagingHistory

**File**: `src/components/patients/PatientImagingHistory.tsx`

- Import `useImagingOrder`, `useImagingResult`, `PrintableImagingReport`, `useOrganizationBranding`, `usePrint`
- Add print state tracking (like PatientLabHistory pattern: `selectedOrderId` + `shouldPrint`)
- For orders with status `verified` or `reported`:
  - Add **Print Report** button (printer icon)
  - Add **View Report** link opening `/app/radiology/report/{id}` in new tab
- Render hidden `PrintableImagingReport` off-screen for the selected order
- Use `useEffect` to trigger print when data loads (same pattern as lab)

### 3. Add i18n keys (all 3 languages)

Add keys for: "Finalized Report", "View Report", "Print Report" in English, Urdu, Arabic

## Files Changed

- `src/pages/app/radiology/ReportEntryPage.tsx` — read-only view for finalized reports
- `src/components/patients/PatientImagingHistory.tsx` — add print/view buttons
- `src/lib/i18n/` — i18n keys (3 language files)

