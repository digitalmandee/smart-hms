

# Update Presentation PDF Download to Match Pharmacy Standard

## What's Already Good
The presentation content is comprehensive with all 32 slides covering every module:
- Clinical: Patients, Appointments, OPD, Emergency, OT, IPD, Nursing
- Diagnostics: Laboratory, Radiology, Blood Bank
- Pharmacy & Retail: Pharmacy, POS
- Finance: Billing, Doctor Wallet, Compensation, Accounts
- Operations: Procurement, Inventory, HR, Reports
- Special slides: Title, Features Overview, OT Dashboard, Workflow, Procurement, Warehouse, Case Studies, Lab Network, Integration, Compliance, Timeline, CTA

No content changes needed -- all modules are covered in detail.

## What Needs Fixing
The PDF download in `/presentation` still uses the old `html2canvas` library and `pdf.save()` method, both of which have been identified as problematic:
- `html2canvas` causes layout distortions (bullets shift, text moves)
- `pdf.save()` doesn't trigger downloads in the preview iframe

## Technical Changes

### File: `src/pages/Presentation.tsx`

1. **Replace import**: Swap `html2canvas` for `toPng` from `html-to-image`
2. **Update capture logic**: Replace `html2canvas()` call with `toPng()` using browser-native rendering
3. **Fix download method**: Replace `pdf.save()` with blob-based download (createObjectURL + anchor click)
4. **Add error handling**: Per-slide try/catch with fallback page on failure
5. **Optimize timing**: Add proper delays for font loading and page rendering

Key capture settings (landscape A4):
- Pixel dimensions: 1123x794 (landscape)
- pixelRatio: 1.5 for sharp output without excessive memory use
- backgroundColor: '#ffffff'
- Output format: PNG (lossless) instead of JPEG

This mirrors the exact pattern already working in the Pharmacy Documentation page.

