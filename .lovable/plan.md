

# Plan: Medical Coding Support (ICD-10 + CPT Searchable Lookup)

## Overview
Create a `medical_codes` database table seeded with common ICD-10 and CPT codes, a reusable `MedicalCodeSearch` combobox component, and replace all free-text ICD/CPT inputs in the claim form and denial resubmit dialog.

## Changes

### 1. Database: `medical_codes` table
New migration creating:
- Enum `medical_code_type` with values: `icd10`, `cpt`, `drg`
- Table `medical_codes`: `id` (uuid PK), `organization_id` (nullable — null = global/system codes), `code_type` (enum), `code` (text), `description` (text), `description_ar` (text), `category` (text), `is_active` (boolean default true), `created_at`
- RLS: allow authenticated users to read all codes (global + their org)
- Seed ~40 common ICD-10 codes (e.g., J18.9 Pneumonia, I10 Hypertension, E11 Type 2 DM, K35 Appendicitis, etc.) and ~20 common CPT codes (consultation, lab, imaging, surgery codes) used in Saudi healthcare

### 2. New Component: `MedicalCodeSearch.tsx`
`src/components/insurance/MedicalCodeSearch.tsx` — a multi-select combobox:
- Props: `codeType` (icd10 | cpt), `selectedCodes: string[]`, `onCodesChange: (codes: string[]) => void`, `placeholder?`, `disabled?`
- Uses Popover + Command pattern (like existing `MedicineSearchCombobox`)
- Searches `medical_codes` table by code or description with debounce
- Shows code + description in dropdown, selected codes as removable badges
- Supports both selecting from DB and typing custom codes (for codes not yet in system)
- Trilingual: shows `description_ar` when language is Arabic

### 3. New Hook: `useMedicalCodes.ts`
`src/hooks/useMedicalCodes.ts`:
- `useSearchMedicalCodes(query: string, codeType: 'icd10' | 'cpt')` — debounced search against `medical_codes` table using `.ilike()` on code and description

### 4. Update ClaimFormPage
Replace the free-text ICD-10 input (line 284-289) with `MedicalCodeSearch` component for multi-select ICD-10 codes. Replace the service_code free-text input in claim items (line 349-354) with `MedicalCodeSearch` for CPT codes. Update form data handling to work with string arrays instead of comma-separated text.

### 5. Update DenialManagementPanel
Replace the free-text ICD codes input in the edit-and-resubmit dialog with `MedicalCodeSearch` component.

### 6. Translations
Add EN/AR/UR keys for: medical code search labels, "Search ICD-10 codes", "Search CPT codes", "Add custom code", "No codes found".

## Files

| File | Action |
|------|--------|
| SQL migration | Create `medical_codes` table + seed data |
| `src/hooks/useMedicalCodes.ts` | **New** — search hook |
| `src/components/insurance/MedicalCodeSearch.tsx` | **New** — searchable multi-select combobox |
| `src/pages/app/billing/ClaimFormPage.tsx` | Replace ICD + service_code free-text with MedicalCodeSearch |
| `src/components/insurance/DenialManagementPanel.tsx` | Replace ICD free-text in edit dialog |
| `src/lib/i18n/translations/{en,ar,ur}.ts` | Add medical coding translations |

