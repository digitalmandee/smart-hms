

# Batch 4 Implementation: Apply Translations to Radiology (19 pages) + OT Pages (17 remaining)

## Overview

Translation keys for Radiology and OT already exist in en.ts/ar.ts/ur.ts. This batch applies the `useTranslation` hook to all 36 untranslated pages, replacing hardcoded English strings with `t()` calls and `getTranslatedString()` for toast messages.

## Scope

### Radiology Pages (19 files -- none currently translated)
1. `RadiologyDashboard.tsx` -- page titles, stats labels, quick actions, tab labels, empty states
2. `ImagingOrdersListPage.tsx` -- title, description, filter placeholders, empty state
3. `ImagingOrderFormPage.tsx` -- form labels, placeholders, toast messages
4. `ImagingOrderDetailPage.tsx` -- section headers, labels
5. `ImagingSchedulePage.tsx` -- title, description, filter labels
6. `TechnicianWorklistPage.tsx` -- title, description, priority labels, empty states
7. `ReportingWorklistPage.tsx` -- title, description, view toggles, empty states
8. `ReportEntryPage.tsx` -- title, section headers, buttons, toast messages
9. `ReportVerificationPage.tsx` -- title, buttons, labels, toast messages
10. `ImageCapturePage.tsx` -- title, section headers, buttons, toast messages
11. `PACSStudiesPage.tsx` -- title, subtitle, search placeholder, labels, empty states
12. `PACSSettingsPage.tsx` -- title, subtitle, status labels, section headers
13. `PACSServersPage.tsx` -- title, subtitle, buttons, status labels, dialog text
14. `PACSSetupGuidePage.tsx` -- title, subtitle, section headers (static guide content stays English)
15. `ModalitiesListPage.tsx` -- title, description, table headers, dialog, toast messages
16. `ProceduresListPage.tsx` -- title, description, table headers, dialog, toast messages
17. `ImagingReportTemplatesPage.tsx` -- title, description, table headers, dialog, toast messages
18. `RadiologyReportsPage.tsx` -- title, description, stats labels, tab labels, table headers
19. `RadiologyArchivePage.tsx` -- title, description, table headers, empty state

### OT Pages (17 files -- OTDashboard already done)
1. `OTRoomsPage.tsx`
2. `OTRoomFormPage.tsx`
3. `OTSchedulePage.tsx`
4. `SurgeriesListPage.tsx`
5. `SurgeryFormPage.tsx`
6. `SurgeryDetailPage.tsx`
7. `SurgeryRequestsPage.tsx`
8. `LiveSurgeryPage.tsx`
9. `PreOpAssessmentPage.tsx`
10. `IntraOpNotesPage.tsx`
11. `OTNursingNotesPage.tsx`
12. `OTInstrumentCountPage.tsx`
13. `PACUPage.tsx`
14. `AnesthesiaDashboard.tsx`
15. `AnesthesiaRecordPage.tsx`
16. `PreAnesthesiaAssessmentPage.tsx`
17. `OTReportsPage.tsx`

## Technical Approach

For each page file:

1. Add import: `import { useTranslation } from "@/lib/i18n";` (and `getTranslatedString` if toasts exist)
2. Add hook: `const { t } = useTranslation();` inside the component
3. Replace hardcoded strings:
   - `title="Radiology & Imaging"` becomes `title={t('radiology.radiologyImaging' as any)}`
   - `description="..."` becomes `description={t('radiology.radiologyImagingDesc' as any)}`
   - Breadcrumb labels: `{ label: t('nav.radiology' as any), href: "..." }`
   - Button text: `{t('radiology.newOrder' as any)}`
   - Empty states: `{t('radiology.worklistEmpty' as any)}`
   - Placeholders: `placeholder={t('radiology.searchByNameMRN' as any)}`
4. Toast messages use `getTranslatedString()`:
   - `toast.success('Study started')` becomes `toast.success(getTranslatedString('radiology.studyStarted'))`

## New Translation Keys Needed

Approximately 60 additional keys for OT pages that don't exist yet:

- OT rooms: `ot.addRoom`, `ot.editRoom`, `ot.roomName`, `ot.roomStatus`, `ot.roomType`
- OT surgery forms: `ot.surgeryType`, `ot.estimatedDuration`, `ot.anesthesiaType`
- OT reports: `ot.reportsDesc`, `ot.surgerySummary`, `ot.anesthesiaReport`
- Pre-op/Intra-op: `ot.preOpAssessment`, `ot.intraOpNotes`, `ot.nursingNotes`
- PACU: `ot.pacuMonitoring`, `ot.recoveryScore`, `ot.dischargeReady`
- Toast messages: `ot.surgeryStarted`, `ot.surgeryCompleted`, `ot.roomSaved`

## Execution Order

1. Add missing OT translation keys to en.ts, ar.ts, ur.ts (merged into existing `ot.` namespace)
2. Apply `useTranslation` to all 19 Radiology pages (parallel edits where possible)
3. Apply `useTranslation` to all 17 OT pages
4. Verify no duplicate keys introduced

## Risk Mitigation

- All new keys merged into existing namespace blocks (not appended) to prevent TS1117 errors
- Each file change is isolated -- no cross-file dependencies
- Dynamic/user data (patient names, order numbers) remains untranslated per project convention
