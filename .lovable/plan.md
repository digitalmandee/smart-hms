

# Advanced Dialysis & Dental Module Upgrade

## Current State Assessment

### Dialysis Module — Gaps Found
| Feature | Status | Issue |
|---------|--------|-------|
| Dashboard | Built | OK — stats + today's sessions |
| Patient Registry | Built | Basic — no EPO protocol tracking UI, no dry weight trend |
| Machines | Built | No disinfection log, no maintenance scheduler |
| Sessions List | Built | List only — **no session detail page with intra-vitals monitoring** |
| Schedule | Built | Read-only view — **no create schedule form** |
| Reports | Placeholder | **Empty cards with descriptions, no actual data/charts** |
| Vitals Hooks | Built | `useDialysisVitals` + `useAddDialysisVitals` exist but **no UI consumes them** |
| Invoice Integration | DB ready | `invoice_id` FK exists but **no auto-billing UI or trigger** |
| BP Alert Automation | Missing | No intra-dialysis hypotension alert |
| Session Create Form | Missing | "New Session" button links to `/sessions/new` — **route doesn't exist** |

### Dental Module — Gaps Found
| Feature | Status | Issue |
|---------|--------|-------|
| Dashboard | Built | OK — stats + recent treatments |
| Tooth Chart | Built | **2D flat grid only** — no visual tooth diagram, no 3D |
| Treatments List | Built | OK but no create form (links to `/treatments/new` — **route doesn't exist**) |
| Procedures Catalog | Built | OK — CRUD works |
| Reports | Placeholder | **Empty cards, no actual data** |
| 3D Dental Visualization | Missing | No 3D tooth model for treatment visualization |
| Surface Mapping UI | Missing | No per-surface (M/O/D/B/L) interactive selector |
| Treatment Plan Builder | Missing | No multi-tooth plan with approval workflow |
| Dental Images | DB ready | Table exists, **no upload/view UI** |
| Invoice Integration | DB ready | `invoice_id` FK exists but **no auto-billing** |

## Implementation Plan

### Phase 1: Dialysis — Full Session Workflow (Critical)

**1. `DialysisSessionDetailPage.tsx`** (NEW — the biggest missing piece)
- Full session view: patient info, machine assignment, pre/post weight entry
- **Live intra-dialysis vitals panel**: table + line chart (BP, pulse, UF rate) at 30-min marks using Recharts
- Add vitals form (minute mark, BP systolic/diastolic, pulse, blood flow rate, UF rate, notes)
- Session status workflow buttons: scheduled → in_progress → completed
- BP drop alert: if systolic drops >20mmHg from previous reading, show red warning banner
- Complications and nursing notes textarea

**2. `DialysisNewSessionPage.tsx`** (NEW — fixes dead link)
- Patient selector (from enrolled dialysis patients)
- Machine/chair assignment
- Date, shift, target UF, duration fields
- Creates session and redirects to detail page

**3. `DialysisCreateSchedulePage.tsx`** (NEW — fixes schedule being read-only)
- Patient selector, pattern (MWF/TTS), shift (morning/afternoon/evening)
- Machine and chair assignment
- Start date picker

**4. `DialysisReportsPage.tsx`** (UPGRADE — replace placeholders with real charts)
- Kt/V adequacy chart from session data (calculated: `Kt/V ≈ -ln(post_urea/pre_urea - 0.008×t) + (4-3.5×post_urea/pre_urea)×UF/post_weight`)
- Vascular access type distribution pie chart
- Session completion rate bar chart (monthly)
- Average UF removal trends

**5. `DialysisMachinesPage.tsx`** (UPGRADE)
- Add disinfection log (last disinfected timestamp, next due)
- Status change buttons (available ↔ maintenance ↔ in_use)

**6. Auto-billing trigger** (DB migration)
- When `dialysis_sessions.status` changes to `completed`, auto-create invoice line item for the session charge

### Phase 2: Dental — 3D Visualization & Full Workflow

**7. `Dental3DChart.tsx`** (NEW — React Three Fiber 3D tooth model)
- 3D jaw model using `@react-three/fiber` + `@react-three/drei` (already installed)
- 32 individual tooth meshes (procedurally generated from parametric shapes — no external model needed)
- Each tooth clickable — highlights and opens condition/treatment panel
- Color-coded by condition (green=healthy, red=decayed, gray=missing, blue=restored, yellow=crown, purple=implant)
- Orbit controls for rotation/zoom
- Surface selector overlay (M/O/D/B/L) when tooth selected — 5-surface diagram per tooth
- Treatment overlay: shows planned/completed procedures on the selected tooth

**8. `DentalChartPage.tsx`** (UPGRADE)
- Replace flat grid with the 3D chart component
- Keep 2D fallback toggle for accessibility
- Patient search dropdown (not raw UUID input)
- Side panel: selected tooth details, condition history, treatment records

**9. `DentalNewTreatmentPage.tsx`** (NEW — fixes dead link)
- Patient selector + tooth chart mini-view
- Tooth number + surface selector (M/O/D/B/L checkboxes)
- Procedure selector from catalog
- Doctor assignment, cost, planned date
- Multi-tooth treatment plan: add multiple tooth-procedure rows

**10. `DentalTreatmentDetailPage.tsx`** (NEW)
- View treatment with 3D tooth highlight
- Status workflow: planned → in_progress → completed
- On completion → auto-generate invoice line item
- Notes, before/after imaging slots

**11. `DentalImagesPage.tsx`** (NEW — uses existing table)
- Upload periapical/OPG/CBCT images per patient
- Image viewer with tooth number tagging
- Link to Supabase storage bucket

**12. `DentalReportsPage.tsx`** (UPGRADE — real charts)
- Revenue by procedure type (bar chart)
- Treatment completion funnel (planned → in_progress → completed)
- Procedures per dentist (bar chart)

### Phase 3: Shared Infrastructure

**13. Routes** — Add all new routes to `App.tsx`:
- `/app/dialysis/sessions/new`
- `/app/dialysis/sessions/:id`
- `/app/dialysis/schedule/new`
- `/app/dental/treatments/new`
- `/app/dental/treatments/:id`
- `/app/dental/images`

**14. Sidebar** — Add missing nav items in `role-sidebars.ts`:
- Dental → "Images" link

**15. DB Migration** — New fields/triggers:
- `dialysis_machines`: add `last_disinfected_at`, `next_disinfection_due`
- Auto-invoice trigger for both dialysis sessions and dental treatments on completion
- `dental_images` storage bucket

## Files Summary

| Action | File |
|--------|------|
| CREATE | `src/pages/app/dialysis/DialysisSessionDetailPage.tsx` |
| CREATE | `src/pages/app/dialysis/DialysisNewSessionPage.tsx` |
| CREATE | `src/pages/app/dialysis/DialysisCreateSchedulePage.tsx` |
| CREATE | `src/components/dental/Dental3DChart.tsx` |
| CREATE | `src/components/dental/ToothSurfaceSelector.tsx` |
| CREATE | `src/pages/app/dental/DentalNewTreatmentPage.tsx` |
| CREATE | `src/pages/app/dental/DentalTreatmentDetailPage.tsx` |
| CREATE | `src/pages/app/dental/DentalImagesPage.tsx` |
| EDIT | `src/pages/app/dialysis/DialysisReportsPage.tsx` |
| EDIT | `src/pages/app/dialysis/DialysisMachinesPage.tsx` |
| EDIT | `src/pages/app/dental/DentalChartPage.tsx` |
| EDIT | `src/pages/app/dental/DentalReportsPage.tsx` |
| EDIT | `src/App.tsx` |
| EDIT | `src/config/role-sidebars.ts` |
| CREATE | DB migration (disinfection fields, auto-invoice triggers, storage bucket) |

This is a large implementation. Due to message size limits, I will build it across 2-3 implementation rounds — starting with Phase 1 (Dialysis complete workflow) and the 3D dental chart.

