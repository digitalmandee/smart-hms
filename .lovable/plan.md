

# Fix: Imaging Report Missing Organization Branding & Images

## Problems Found

1. **No organization branding passed**: All 4 places that render `PrintableImagingReport` do NOT pass the `organization` prop — so it always shows "Hospital Name" with no logo, address, phone, or email.
   - `ReportEntryPage.tsx` line 210
   - `ReportVerificationPage.tsx` line 258
   - `PatientImagingHistory.tsx` line 291
   - `ImagingOrderDetailPage.tsx` line 342

2. **No image output in report**: The `ImagingResult` has an `images` array but `PrintableImagingReport` never renders attached images. The lab report includes result data inline; the imaging report should show attached images (X-rays, CT scans, etc.).

3. **PrintableImagingReport design is basic**: Plain serif font, no professional styling. Lab report uses a polished A4 layout with proper styles, QR codes, colored headers. Imaging report should match that quality.

---

## Plan

### 1. Pass branding to all PrintableImagingReport usages (4 files)

Add `useOrganizationBranding()` import and pass `organization={branding}` to each:

- **`ReportEntryPage.tsx`** — already has hooks setup, add branding query + pass to component
- **`ReportVerificationPage.tsx`** — same pattern
- **`ImagingOrderDetailPage.tsx`** — same pattern
- **`PatientImagingHistory.tsx`** — same pattern

### 2. Add images section to PrintableImagingReport

- Render `result.images` array (if present and non-empty) in an "IMAGES" section
- Display each image in a grid layout with appropriate sizing for print
- Add image captions if available

### 3. Upgrade PrintableImagingReport design to match lab report quality

Restyle using inline styles (same approach as `PrintableLabReport`):
- Professional A4 layout with proper margins
- Organization header with logo, name, address, contact in a structured layout
- Blue accent color header bar matching lab report
- Patient info in bordered box
- Proper typography (Segoe UI, consistent font sizes)
- QR code if organization slug is available
- Registration/tax ID display
- Professional footer with "electronically generated" notice

### 4. No i18n changes needed

The printable report uses static English labels (standard for medical reports). Existing i18n keys are already in place for the page chrome.

## Files Changed

- `src/components/radiology/PrintableImagingReport.tsx` — Full redesign with branding, images, professional styling
- `src/pages/app/radiology/ReportEntryPage.tsx` — Add branding prop
- `src/pages/app/radiology/ReportVerificationPage.tsx` — Add branding prop
- `src/pages/app/radiology/ImagingOrderDetailPage.tsx` — Add branding prop
- `src/components/patients/PatientImagingHistory.tsx` — Add branding prop

