
# Pharmacy UX Fixes -- Sidebar, PO Form, Vendor Access, and Report Branding

## Issues Identified

1. **Procurement group has no icon** -- Actually it does have `ShoppingCart` icon in the config, but user reports it's missing visually. Will verify and ensure it renders.
2. **PO form asks for Branch** -- Independent pharmacies have only one branch. The form should auto-select the user's branch from `profile.branch_id` instead of showing a dropdown.
3. **No way to add vendors from pharmacy** -- The sidebar has "Suppliers" link to `/app/inventory/vendors` (list page), but there's no "Add Vendor" link. Pharmacists need quick access to create new vendors.
4. **"My Work" section with Attendance/Leaves/Payslips** -- Not relevant for an independent pharmacy owner-operator. These are HR/employee features for hospital staff. Remove from the pharmacist sidebar for standalone pharmacies.
5. **AI-generated icons in reports** -- The report cards use generic Lucide icons with colored backgrounds. Replace with a cleaner, professional look that uses subtle monochrome icons without the colorful badge backgrounds.

---

## Changes

### 1. Pharmacist Sidebar Cleanup (`src/config/role-sidebars.ts`)

- Add "Add Vendor" link (`/app/inventory/vendors/new`) under the Inventory group alongside existing "Suppliers"
- Remove "My Work" group entirely from the pharmacist sidebar (Schedule, Attendance, Leaves, Payslips are hospital HR features -- not needed for independent pharmacy operators)
- Verify Procurement icon renders correctly (it's set to `ShoppingCart` which is valid)

### 2. PO Form Auto-Select Branch (`src/pages/app/inventory/POFormPage.tsx`)

- Use `profile.branch_id` from `useAuth()` to auto-select the branch
- If the user only has one branch (independent pharmacy), hide the branch dropdown entirely and use it automatically
- If multiple branches exist, still show the selector but pre-fill with the user's assigned branch

### 3. Professional Report Card Styling (`src/pages/app/pharmacy/PharmacyReportsPage.tsx`)

Remove the colored icon badges (e.g., `bg-emerald-100 text-emerald-700`) from report cards. Replace with:
- Clean monochrome icon (muted foreground color, no background badge)
- Subtle left border accent per category instead of icon backgrounds
- Professional typography without flashy colors
- Category headers use simple text styling instead of colored badges

This gives a corporate/professional feel matching healthcare software standards rather than looking like a consumer app with colorful bubbles.

---

## Files Modified

| File | Change |
|---|---|
| `src/config/role-sidebars.ts` | Add "Add Vendor" to pharmacist Inventory group; remove "My Work" group |
| `src/pages/app/inventory/POFormPage.tsx` | Auto-select branch from `profile.branch_id`; hide branch dropdown for single-branch orgs |
| `src/pages/app/pharmacy/PharmacyReportsPage.tsx` | Replace colored icon badges with clean monochrome professional styling; remove per-report color properties |
