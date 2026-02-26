

# OPD Menu Assessment

## Current OPD Menu Items (Active)

| # | Menu Item | Path | Status |
|---|-----------|------|--------|
| 1 | OPD Dashboard | `/app/opd/admin-dashboard` | Active |
| 2 | Walk-in Registration | `/app/opd/walk-in` | Active |
| 3 | Doctor Dashboard | `/app/opd` | Active |
| 4 | Nurse Station | `/app/opd/nursing` | Active |
| 5 | History | `/app/opd/history` | Active |
| 6 | OPD Orders | `/app/opd/orders` | Active |
| 7 | OPD Checkout | `/app/opd/checkout` | Active |
| 8 | Doctor Reports | `/app/opd/reports` | Active |
| 9 | AI Assistant | `/app/ai-chat` | Active |

## Pages That Exist But Have No Menu Entry

| Page | Route | Notes |
|------|-------|-------|
| **OPD Vitals** | `/app/opd/vitals` | Nurses record vitals -- accessed from queue, but no direct menu link |
| **Pending Checkout** | `/app/opd/pending-checkout` | Lists patients needing checkout after consultation -- no menu shortcut |
| **Gynecology Dashboard** | `/app/opd/gynecology` | Specialized OPD view -- no menu entry at all |

## Disabled Menu Items (in DB but `is_active = false`)

| Item | Path | Notes |
|------|------|-------|
| Token Queue | `/app/appointments/queue` | Old token display, replaced by kiosk setup |
| Nurse Station (duplicate) | `/app/opd/nursing` | Duplicate entry, correctly disabled |

## Token Display Items (Under Appointments, Not OPD)

These exist under the **Appointments** parent menu, not OPD:
- **Token Display Setup** → `/app/appointments/token-display`
- **Token Kiosk** → `/app/appointments/kiosk-setup`

## Proposed Changes

Add 3 missing menu items to the `menu_items` table:

1. **Vitals** → `/app/opd/vitals` (sort_order: 3.5, between Nurse Station and History) -- useful for nurses to jump directly to vitals recording
2. **Pending Checkout** → `/app/opd/pending-checkout` (sort_order: 7.5, before OPD Checkout) -- staff need quick access to see who is waiting for checkout
3. **Gynecology** → `/app/opd/gynecology` (sort_order: 6, between History and Orders) -- specialized department dashboard deserves its own entry

Also add the corresponding trilingual translation keys for these 3 items and insert the rows into the `menu_items` table via SQL.

### Files to Edit

| File | Action |
|------|--------|
| Database (`menu_items` table) | **INSERT** 3 new rows for Vitals, Pending Checkout, Gynecology |
| `src/lib/i18n/translations/en.ts` | **EDIT** -- Add keys if not already present |
| `src/lib/i18n/translations/ar.ts` | **EDIT** -- Add keys |
| `src/lib/i18n/translations/ur.ts` | **EDIT** -- Add keys |

No routing changes needed -- all 3 routes already exist in `App.tsx`.

