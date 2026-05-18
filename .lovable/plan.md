## Goal
Make the mobile app respect the same role/permission system as the web app so each user lands on the right dashboard, sees only the menu items they're allowed to use, and is blocked from pages outside their role.

## Problems found

1. **`MobileDashboard` routing is too narrow.** Only `doctor`, `surgeon`, `anesthetist` get the doctor view; `nurse` variants get nurse view; everything else (pharmacist, lab_technician, receptionist, accountant, org_admin, etc.) falls through to a generic `StaffMobileDashboard`. No special case for super_admin/org_admin.
2. **Bottom navigation points to desktop routes** (`/app/dashboard`, `/app/appointments`, `/app/opd/nursing`, `/app/pharmacy`, `/app/lab`, `/app/profile`) instead of the existing `/mobile/*` pages. This is why "after login access" feels broken — taps bounce users out of the mobile shell into the desktop app.
3. **No role guard on individual mobile pages.** `/mobile/pharmacy`, `/mobile/lab`, `/mobile/tasks` are reachable by any logged-in user, including patients.
4. **Patient role has no dedicated landing.** Patients on mobile should land on the portal-style `PatientMobileDashboard` with appointments / prescriptions / invoices only.

## Plan

### 1. Role grouping helper
Extend `src/constants/roles.ts` with:
- `PHARMACY_ROLES` (already there), `LAB_ROLES = ["lab_technician"]`, `RECEPTION_ROLES`, `ADMIN_ROLES = ["super_admin","org_admin","branch_admin"]`, `PATIENT_ROLES = ["patient"]`.
- `resolveMobilePersona(roles)` → `"admin" | "doctor" | "nurse" | "pharmacist" | "lab" | "reception" | "staff" | "patient"`.

### 2. Mobile dashboard router (`MobileDashboard.tsx`)
Switch on `resolveMobilePersona(roles)`:
- admin / staff (accountant, hr, store_manager, receptionist, finance_manager) → `StaffMobileDashboard`
- doctor / surgeon / anesthetist → `DoctorMobileDashboard`
- nurse variants → `NurseMobileDashboard`
- pharmacist → reuse `StaffMobileDashboard` for now but with a pharmacy quick-action card (small tweak)
- lab_technician → same staff dashboard with lab quick-action
- patient (or no roles) → `PatientMobileDashboard`

### 3. Fix bottom navigation (`src/components/mobile/BottomNavigation.tsx`)
- Change every `/app/...` link to its `/mobile/...` equivalent (`/mobile/dashboard`, `/mobile/appointments`, `/mobile/tasks`, `/mobile/pharmacy`, `/mobile/lab`, `/mobile/profile`).
- Re-derive `getHomePath` against `/mobile/*`.
- Filter items using the same role groups (`PHARMACY_ROLES`, `LAB_ROLES`, `CLINICAL_ROLES ∪ NURSING_ROLES` for Tasks).
- Patients see only: Home, Appointments, Profile (hide Tasks / Pharmacy / Lab).

### 4. Per-page role guard
Add a small wrapper `MobileRoleGuard` in `src/components/mobile/MobileRoleGuard.tsx`:
- Accepts `allow: AppRole[]` (super_admin always allowed).
- If user lacks any allowed role, render a friendly "Not available for your role" screen with a button back to `/mobile/dashboard`.

Wrap routes in `src/App.tsx`:
- `/mobile/tasks`     → allow CLINICAL_ROLES ∪ NURSING_ROLES
- `/mobile/pharmacy`  → allow PHARMACY_ROLES
- `/mobile/lab`       → allow LAB_ROLES + doctor (read-only)
Leave `/mobile/dashboard`, `appointments`, `notifications`, `profile`, `more` open to everyone authenticated.

### 5. Login → redirect by persona
In `MobileLoginPage.onSubmit` and biometric paths, after login wait briefly for `roles` to load (`useAuth().isLoading === false`) then `navigate(resolveMobileLanding(persona))` where:
- patient → `/mobile/dashboard` (renders PatientMobileDashboard)
- pharmacist → `/mobile/pharmacy`
- lab_technician → `/mobile/lab`
- everyone else → `/mobile/dashboard`

### 6. i18n
All new strings (role-guard message, nav labels) go through `src/lib/i18n/index.ts` in **English, Urdu, Arabic** per project rule.

### 7. QA checklist update
Add to `scripts/qa-mobile-checklist.md`: log in as admin / doctor / nurse / pharmacist / lab tech / patient, verify (a) correct dashboard, (b) bottom nav stays inside `/mobile/*`, (c) blocked pages show the role-guard screen, (d) all 3 languages render.

## Technical notes
- No database / RLS changes needed — RLS already enforces row access; this work is purely UI gating so users don't hit dead-end pages.
- `super_admin` bypass is handled inside `MobileRoleGuard` via `roles.includes("super_admin")`.
- `MobileLayout` and `ProtectedRoute` stay unchanged; the guard sits between route element and page component.

## Out of scope
- Building new role-specific mobile pages (e.g. dedicated pharmacist POS on mobile). Existing pages are reused.
- Changing desktop `BottomNavigation` behavior on web breakpoints — only the mobile shell navigation is touched.