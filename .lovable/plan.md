

# Fix: Empty String SelectItem Value Crash

## Problem
The app crashes on `/app/accounts/journal-entries/new` because Radix UI `<Select.Item>` does not allow empty string (`""`) as a value. This error is thrown in 3 files across 4 locations.

## Root Cause
Using `<SelectItem value="">` as a "clear/none" option. Radix explicitly prohibits this because empty string is reserved for the placeholder state.

## Fix
Replace all `value=""` with `value="__none__"` (a sentinel value), and update the corresponding state handlers to treat `"__none__"` as empty string when reading the value.

### File 1: `src/pages/app/accounts/JournalEntryFormPage.tsx`
- **Line 457**: Change `<SelectItem value="">—</SelectItem>` to `<SelectItem value="__none__">—</SelectItem>`
- **Line 592**: Same change for line-level cost center
- Update `setCostCenterId` handler (line 454) to convert `"__none__"` → `""`
- Update `updateLine` call (line 589) to convert `"__none__"` → `""`

### File 2: `src/pages/app/accounts/VendorPaymentFormPage.tsx`
- **Line 168**: Change `<SelectItem value="">General Payment</SelectItem>` to `<SelectItem value="__none__">General Payment</SelectItem>`
- Update the corresponding `onValueChange` to convert `"__none__"` → `""`

### File 3: `src/pages/app/accounts/DepartmentPnLPage.tsx`
- **Line 282**: Change `<SelectItem value="">` to `<SelectItem value="__none__">`
- Update branch filter handler to convert `"__none__"` → `""`

## No translation changes needed
This is a pure bug fix — no new labels required.

