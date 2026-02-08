
# Multi-OPD Department Management System

## Current State Analysis

| Component | Current Implementation | Gap for Multi-OPD |
|-----------|----------------------|-------------------|
| **Appointments** | Single shared queue | No OPD department filtering |
| **Token Generation** | Per-doctor per day | Not department-aware |
| **Queue Display** | Shows all patients | Cannot show department-specific TV displays |
| **Nurse Station** | Single dashboard | No department assignment for nurses |
| **Billing Sessions** | Counter types: reception, ipd, pharmacy, opd, er | Single "opd" counter type |
| **Reports** | Service category-based | No OPD department breakdown |
| **TV Display** | Organization-wide | Cannot run multiple displays per department |

### How Hospitals Use Multi-OPD

A typical hospital may have **multiple OPD clinics** under one roof:

```text
Hospital OPD Wing
├── Medicine OPD (Room 1-5)
│   ├── General Medicine
│   ├── Cardiology
│   └── Gastro
├── Surgical OPD (Room 6-10)
│   ├── General Surgery
│   ├── Orthopedics
│   └── ENT
├── Pediatric OPD (Room 11-15)
│   └── All pediatric specialties
└── Eye & Dental OPD (Room 16-20)
    ├── Ophthalmology
    └── Dental
```

**Each OPD department needs:**
- Its own token sequence (MED-001, SURG-001, etc.)
- Dedicated TV queue display
- Separate nurse station view
- Individual billing counter tracking
- Department-wise collection reports

---

## Solution Overview

Create an **OPD Departments** system that groups specializations and enables:

1. **Department-based token generation** - Tokens start from 001 per department per day
2. **Separate queue displays** - TV screens for each OPD department
3. **Department-filtered nurse stations** - Nurses see only their assigned department
4. **Department billing sessions** - Track collections by OPD department
5. **Comprehensive reporting** - Revenue and patient count by OPD department

---

## Database Schema

### New Table: `opd_departments`

```sql
CREATE TABLE opd_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name VARCHAR(100) NOT NULL,           -- "Medicine OPD"
  code VARCHAR(10) NOT NULL,            -- "MED"
  description TEXT,
  location VARCHAR(255),                -- "Ground Floor, East Wing"
  rooms VARCHAR(100),                   -- "Rooms 1-5"
  color VARCHAR(10),                    -- For UI display
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  head_doctor_id UUID REFERENCES doctors(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, branch_id, code)
);
```

### New Junction Table: `opd_department_specializations`

Links specializations to OPD departments:

```sql
CREATE TABLE opd_department_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opd_department_id UUID NOT NULL REFERENCES opd_departments(id) ON DELETE CASCADE,
  specialization_id UUID NOT NULL REFERENCES specializations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(opd_department_id, specialization_id)
);
```

### Modify `appointments` Table

```sql
ALTER TABLE appointments ADD COLUMN opd_department_id UUID REFERENCES opd_departments(id);
```

### Modify `billing_sessions` Counter Types

Update the `counter_type` enum or add department-specific tracking:

```sql
ALTER TABLE billing_sessions 
  ADD COLUMN opd_department_id UUID REFERENCES opd_departments(id);
```

---

## Token Generation Logic

### Current Flow
```text
Token = Next sequential number for (doctor_id + date)
Format: 001, 002, 003...
```

### New Flow
```text
Token = Next sequential number for (opd_department_id + date)
Format: MED-001, SURG-001, PEDI-001...
```

**Implementation:**

```typescript
// src/lib/opd-token.ts
async function generateOPDToken(appointmentData: {
  opd_department_id: string;
  appointment_date: string;
  branch_id: string;
}): Promise<{ token_number: number; token_display: string }> {
  // Get department code
  const { data: dept } = await supabase
    .from('opd_departments')
    .select('code')
    .eq('id', appointmentData.opd_department_id)
    .single();
  
  // Get next token for this department + date
  const { data: lastToken } = await supabase
    .from('appointments')
    .select('token_number')
    .eq('opd_department_id', appointmentData.opd_department_id)
    .eq('appointment_date', appointmentData.appointment_date)
    .order('token_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const nextToken = (lastToken?.token_number || 0) + 1;
  
  return {
    token_number: nextToken,
    token_display: `${dept.code}-${String(nextToken).padStart(3, '0')}`
  };
}
```

---

## Implementation Plan

### Phase 1: Database & Backend

**Files to Create:**
| File | Purpose |
|------|---------|
| `supabase/migrations/xxx_opd_departments.sql` | Create tables and functions |
| `src/hooks/useOPDDepartments.ts` | CRUD operations for OPD departments |
| `src/lib/opd-token.ts` | Token generation with department prefix |

**Migration SQL:**
- Create `opd_departments` table with RLS
- Create `opd_department_specializations` junction table
- Add `opd_department_id` to `appointments`
- Add `opd_department_id` to `billing_sessions`
- Create function `generate_opd_token(dept_id, date)` for consistent token generation
- Add indexes for performance

### Phase 2: OPD Department Management UI

**Files to Create:**
| File | Purpose |
|------|---------|
| `src/pages/app/settings/OPDDepartmentsPage.tsx` | List/manage OPD departments |
| `src/components/opd/OPDDepartmentForm.tsx` | Create/edit department form |
| `src/components/opd/OPDDepartmentSpecializations.tsx` | Assign specializations to department |

**Features:**
- CRUD for OPD departments
- Drag-and-drop to assign specializations
- Set department head doctor
- Configure display order and color

### Phase 3: Appointment Flow Updates

**Files to Modify:**
| File | Changes |
|------|---------|
| `src/hooks/useAppointments.ts` | Auto-assign `opd_department_id` based on doctor's specialization |
| `src/pages/app/appointments/AppointmentFormPage.tsx` | Show OPD department selection (optional override) |
| `src/lib/visit-id.ts` | Update to use department code in visit ID |

**Logic:**
1. When doctor is selected, auto-detect their specialization
2. Look up which OPD department contains that specialization
3. Auto-assign `opd_department_id` to appointment
4. Generate department-prefixed token

### Phase 4: Queue Display Updates

**Files to Modify:**
| File | Changes |
|------|---------|
| `src/pages/app/appointments/QueueDisplayPage.tsx` | Add department filter, show department name |
| `src/pages/app/appointments/QueueControlPage.tsx` | Filter by department |
| `src/hooks/useAppointments.ts` | Add `opdDepartmentId` filter to queue hooks |

**New Features:**
- Department selector on TV display page
- Different TV screens can show different OPD departments
- Token format shows department code (MED-015)
- Department name/color in queue cards

### Phase 5: Nurse Station Updates

**Files to Modify:**
| File | Changes |
|------|---------|
| `src/pages/app/opd/NurseDashboard.tsx` | Add department filter/assignment |
| `src/hooks/useAppointments.ts` | Filter nursing queue by department |
| `src/components/nursing/*` | Show department badge on patient cards |

**Logic:**
- Nurses can be assigned to specific OPD departments
- Dashboard shows only their department's patients
- Cross-department view for supervisors

### Phase 6: Billing Session Updates

**Files to Modify:**
| File | Changes |
|------|---------|
| `src/hooks/useBillingSessions.ts` | Add `opd_department_id` to session creation |
| `src/components/billing/OpenSessionDialog.tsx` | Allow selecting OPD department for session |
| `src/hooks/useDayEndSummary.ts` | Group collections by OPD department |

**Features:**
- When opening a session with counter_type = "opd", optionally specify department
- Day-end summary shows breakdown by OPD department
- Reconciliation per department

### Phase 7: Reporting Updates

**Files to Create:**
| File | Purpose |
|------|---------|
| `src/pages/app/reports/OPDDepartmentReport.tsx` | Dedicated OPD department analytics |
| `src/hooks/useOPDDepartmentStats.ts` | Query patient counts, revenue by OPD department |

**Files to Modify:**
| File | Changes |
|------|---------|
| `src/pages/app/reports/DepartmentRevenueReport.tsx` | Add OPD department filter |
| `src/pages/app/reports/ShiftWiseCollectionReport.tsx` | Add OPD department breakdown |
| `src/pages/app/reports/DayEndSummaryReport.tsx` | Show OPD department sections |
| `src/lib/pdfExport.ts` | Include OPD department in exports |

**New Reports:**
- Patient count by OPD department (daily, weekly, monthly)
- Revenue by OPD department
- Wait time analysis by department
- Doctor performance within department

---

## Data Flow

```text
Appointment Creation Flow:
┌─────────────────┐
│ Select Doctor   │
└───────┬─────────┘
        ↓
┌─────────────────────────────────┐
│ Get Doctor's Specialization     │
└───────┬─────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ Find OPD Department containing  │
│ this specialization             │
└───────┬─────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ Auto-assign opd_department_id   │
└───────┬─────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ Generate Token:                 │
│ MED-001 (dept_code + sequence)  │
└───────┬─────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ Appointment Created with:       │
│ - opd_department_id             │
│ - token_number (sequential)     │
│ - token_display (MED-001)       │
└─────────────────────────────────┘
```

```text
Queue Display Flow:
┌─────────────────────────────────┐
│ TV Screen: Medicine OPD         │
│ Filter: opd_department_id = X   │
└───────┬─────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ Shows only Medicine OPD tokens  │
│ MED-012, MED-013, MED-014...    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ TV Screen: Surgery OPD          │
│ Filter: opd_department_id = Y   │
└───────┬─────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ Shows only Surgery OPD tokens   │
│ SURG-008, SURG-009, SURG-010... │
└─────────────────────────────────┘
```

---

## Files Summary

### Files to Create (12 files)

| File | Purpose |
|------|---------|
| `supabase/migrations/xxx_opd_departments.sql` | Database schema |
| `src/hooks/useOPDDepartments.ts` | OPD department CRUD |
| `src/lib/opd-token.ts` | Token generation logic |
| `src/pages/app/settings/OPDDepartmentsPage.tsx` | Management page |
| `src/components/opd/OPDDepartmentForm.tsx` | Create/edit form |
| `src/components/opd/OPDDepartmentSpecializations.tsx` | Assign specializations |
| `src/components/opd/OPDDepartmentSelector.tsx` | Dropdown selector |
| `src/components/opd/OPDDepartmentBadge.tsx` | Display badge with color |
| `src/pages/app/reports/OPDDepartmentReport.tsx` | Department analytics |
| `src/hooks/useOPDDepartmentStats.ts` | Stats queries |

### Files to Modify (15+ files)

| File | Changes |
|------|---------|
| `src/hooks/useAppointments.ts` | Add department filter, auto-assignment |
| `src/pages/app/appointments/AppointmentFormPage.tsx` | Show department |
| `src/pages/app/appointments/QueueDisplayPage.tsx` | Department filter |
| `src/pages/app/appointments/QueueControlPage.tsx` | Department filter |
| `src/pages/app/opd/NurseDashboard.tsx` | Department filter |
| `src/pages/app/opd/DoctorDashboard.tsx` | Show department context |
| `src/lib/visit-id.ts` | Use department code |
| `src/hooks/useBillingSessions.ts` | Add department to sessions |
| `src/hooks/useDayEndSummary.ts` | Group by department |
| `src/pages/app/reports/DepartmentRevenueReport.tsx` | OPD department filter |
| `src/pages/app/reports/ShiftWiseCollectionReport.tsx` | Department breakdown |
| `src/pages/app/reports/DayEndSummaryReport.tsx` | Department sections |
| `src/lib/pdfExport.ts` | Include department in exports |
| `src/config/role-sidebars.ts` | Add OPD Departments menu item |

---

## Expected Outcome

After implementation:

1. **Organized OPD Management** - Each specialty clinic operates independently
2. **Department-specific Tokens** - Clear identification (MED-001, SURG-001)
3. **Multiple TV Displays** - Each OPD department has its own queue screen
4. **Nurse Assignment** - Nurses see only their department's patients
5. **Accurate Billing** - Collections tracked per OPD department
6. **Comprehensive Reports** - Revenue, patient count, wait times by department
7. **No Data Gaps** - All existing reports continue to work, with additional department filtering

---

## Migration Strategy

1. **Backward Compatible** - `opd_department_id` is nullable initially
2. **Gradual Rollout** - Admins create OPD departments and assign specializations
3. **Auto-Assignment** - New appointments auto-detect department from doctor
4. **Historical Data** - Backfill script can assign department to past appointments based on doctor specialization
