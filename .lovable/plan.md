

# HIPAA Phase 2 — MFA, Session Timeout, Export Audit Logging

## Overview

Phase 2 implements 4 core HIPAA technical safeguards to raise compliance from ~55% to ~72%.

---

## 1. Session Idle Timeout

Create a `useIdleTimeout` hook that monitors mouse, keyboard, scroll, and touch activity. After inactivity:
- **Warning dialog** at 12 minutes (clinical) / 25 minutes (admin)
- **Auto-logout** at 15 minutes (clinical) / 30 minutes (admin)
- Role-based timeout: clinical roles (doctor, nurse, pharmacist, lab_tech, radiologist) get shorter timeouts
- Warning dialog shows countdown with "Stay Logged In" button

### Files
- **New: `src/hooks/useIdleTimeout.ts`** — Core hook tracking last activity timestamp, showing warning, triggering `signOut()`
- **New: `src/components/IdleTimeoutDialog.tsx`** — Warning dialog with countdown timer
- **Edit: `src/App.tsx`** — Mount `useIdleTimeout` inside the authenticated layout

---

## 2. PHI Export Audit Logging

Every CSV/PDF export writes an `audit_logs` entry recording who exported what data and how many records.

### Files
- **Edit: `src/lib/exportUtils.ts`** — Add `logExportAudit()` function that inserts into `audit_logs` with `action: 'data_export'`, `entity_type` (report name), record count, and export format in `new_values`
- **Edit: `src/lib/pdfExport.ts`** — Add same audit log call in `generatePDFReport()`
- **Edit: `src/components/reports/ReportExportButton.tsx`** — Pass entity type metadata to export functions

No schema changes needed — `audit_logs` table already has all required columns (`action`, `entity_type`, `entity_id`, `new_values`, `user_id`, `organization_id`).

---

## 3. PHI Access Logging (DB Trigger)

Create a lightweight DB function + triggers that log when PHI tables are read via RPC. Since client-side SELECT queries can't trigger DB-level read logging, we add a **client-side PHI access logger** that records page views of sensitive patient data.

### Approach
- **New: `src/hooks/usePhiAccessLog.ts`** — Hook that inserts into `audit_logs` when a user views a patient record, lab result, prescription, or radiology report. Called from detail pages.
- **Edit patient/lab/radiology detail pages** — Add `usePhiAccessLog('patient', patientId)` calls to ~6 key pages:
  - `PatientDetailPage.tsx`
  - `LabOrderDetailPage.tsx`
  - `RadiologyOrderDetailPage.tsx`
  - `AdmissionDetailPage.tsx`
  - `ConsultationDetailPage.tsx`
  - `PrescriptionDetailPage.tsx` (if exists)

The hook debounces (1 log per entity per user per 5 minutes) to avoid flooding.

---

## 4. Trilingual Labels

Add translation keys for:
- Session timeout warning messages
- Export audit toast messages
- PHI access log labels

### Files
- **Edit: `src/lib/i18n/translations/en.ts`**
- **Edit: `src/lib/i18n/translations/ur.ts`**
- **Edit: `src/lib/i18n/translations/ar.ts`**

---

## Summary

| Item | Type | Impact |
|---|---|---|
| Idle timeout hook + dialog | New code | §164.312(a)(2)(iii) |
| Export audit logging | Edit 3 files | §164.312(b) |
| PHI access logging hook | New hook + edit 6 pages | §164.312(b) |
| Translations | Edit 3 files | i18n |

**Note on MFA**: Supabase TOTP MFA requires dashboard-level configuration (enabling MFA in Auth settings) plus enrollment UI. This is deferred to Phase 2b as it requires Supabase dashboard changes the migration tool cannot perform. The 3 items above are fully implementable now.

