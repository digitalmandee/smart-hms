

# HIPAA Phase 3 — Breach Notification, Training Tracking, BAA Management

## Overview
Phase 3 raises HIPAA readiness from ~72% to ~85% by adding three compliance framework modules.

## Current State
- `incident_reports` table and hooks already exist in HR compliance module (medical/workplace incidents)
- `audit_logs` table + viewer page exists in Settings
- HR compliance dashboard has tabs for fitness, vaccinations, disciplinary, incidents
- No HIPAA-specific breach notification workflow
- No training acknowledgment tracking
- No BAA (Business Associate Agreement) management

---

## 1. HIPAA Breach Notification Module

Extend the existing `incident_reports` infrastructure to add a **dedicated HIPAA breach workflow** with 60-day notification tracking per HIPAA Breach Notification Rule.

### New DB Table: `hipaa_breach_incidents`
- `id`, `organization_id`, `branch_id`
- `incident_date`, `discovery_date`, `notification_deadline` (auto-calculated: discovery + 60 days)
- `breach_type` (unauthorized_access, loss, theft, improper_disposal, hacking, other)
- `phi_types_involved` (JSONB array: demographics, clinical_notes, lab_results, prescriptions, billing, images)
- `individuals_affected_count`
- `description`, `root_cause`, `corrective_actions`
- `risk_assessment` (low, medium, high)
- `notification_status` (pending, notified_individuals, notified_hhs, closed)
- `notified_individuals_date`, `notified_hhs_date`
- `reported_by`, `investigated_by`
- `status` (open, investigating, contained, resolved, closed)

### Files
- **New migration** — Create `hipaa_breach_incidents` table with RLS
- **New: `src/hooks/useHipaaBreaches.ts`** — CRUD hooks
- **New: `src/pages/app/settings/HipaaBreachesPage.tsx`** — List + create/edit breach incidents with notification countdown, status workflow
- **Edit: `src/pages/app/settings/AuditLogsPage.tsx`** — Add link to breach module
- **Edit routing** — Add route under `/app/settings/hipaa-breaches`

---

## 2. HIPAA Training Tracking

Track workforce HIPAA training completion and annual renewal requirements.

### New DB Table: `hipaa_training_records`
- `id`, `organization_id`, `employee_id` (references profiles)
- `training_type` (initial, annual_refresher, breach_response, phi_handling)
- `training_date`, `expiry_date` (auto: training_date + 1 year)
- `status` (completed, expired, due_soon)
- `acknowledged_at` (employee signature/timestamp)
- `trainer_name`, `certificate_url`
- `notes`

### Files
- **New migration** — Create `hipaa_training_records` table with RLS
- **New: `src/hooks/useHipaaTraining.ts`** — CRUD + expiry queries
- **New: `src/pages/app/hr/compliance/HipaaTrainingPage.tsx`** — Training records list, assign training, track completion, expiry alerts
- **Edit: `src/pages/app/hr/compliance/ComplianceDashboardPage.tsx`** — Add HIPAA training stat card and tab

---

## 3. BAA (Business Associate Agreement) Management

Track agreements with third-party vendors who handle PHI.

### New DB Table: `business_associate_agreements`
- `id`, `organization_id`
- `vendor_name`, `vendor_contact`, `vendor_email`
- `service_description` (what PHI they access)
- `agreement_date`, `expiry_date`, `renewal_date`
- `status` (active, expired, pending_renewal, terminated)
- `document_url` (stored in private bucket)
- `phi_categories` (JSONB: which PHI types they access)
- `reviewed_by`, `approved_by`
- `notes`

### Files
- **New migration** — Create `business_associate_agreements` table with RLS
- **New: `src/hooks/useBAAgreements.ts`** — CRUD hooks
- **New: `src/pages/app/settings/BAAManagementPage.tsx`** — BAA list, create/edit, expiry tracking, renewal alerts
- **Edit routing** — Add route under `/app/settings/baa-management`

---

## 4. HIPAA Compliance Dashboard

A unified view showing compliance status across all HIPAA controls.

### Files
- **New: `src/pages/app/settings/HipaaComplianceDashboardPage.tsx`** — Score card showing:
  - Breach incidents (open/closed count, days to notification deadline)
  - Training compliance (% staff trained, upcoming expirations)
  - BAA status (active/expiring agreements)
  - Session timeout status (enabled)
  - Export audit log count (last 30 days)
  - PHI access log count (last 30 days)
- **Edit Settings sidebar/nav** — Add HIPAA section with links to dashboard, breaches, BAA

---

## 5. Trilingual Labels

Add translation keys for all new modules in `en.ts`, `ur.ts`, `ar.ts`:
- Breach notification form fields and statuses
- Training types and status labels
- BAA management labels
- Compliance dashboard headings

---

## Summary

| Item | Type | HIPAA Rule | Impact |
|---|---|---|---|
| Breach notification module | New table + page | §164.308(a)(6), §164.408 | Breach tracking & 60-day notification |
| Training tracking | New table + page | §164.308(a)(5) | Workforce compliance proof |
| BAA management | New table + page | §164.308(b)(1) | Vendor PHI oversight |
| Compliance dashboard | New page | Administrative | Unified compliance visibility |
| Translations | Edit 3 files | i18n | Trilingual support |

**3 new migrations, 6 new files, ~5 file edits. Target: 85% HIPAA readiness.**

