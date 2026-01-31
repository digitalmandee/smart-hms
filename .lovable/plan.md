
# Multi-Device PACS & Lab Analyzer Integration Plan

## Executive Summary

The user requests multi-device support for both **PACS servers** (radiology) and **Lab Analyzers** with proper device-to-test linking. Currently:

- **PACS**: Single server per organization (stored in `organization_settings`)
- **Lab**: No device/analyzer support - manual result entry only
- **Sidebar Icons**: 17 icons used in database are missing from the `iconMap`

This plan implements a comprehensive device management system for both radiology and laboratory modules.

---

## Current State Analysis

### PACS (Radiology)
| Aspect | Current | Required |
|--------|---------|----------|
| Server Count | 1 per org | Multiple per org/branch |
| Modality Linking | None | Link modalities to specific PACS |
| Storage | `organization_settings` | Dedicated `pacs_servers` table |

### Lab Analyzers
| Aspect | Current | Required |
|--------|---------|----------|
| Device Support | None | Multiple analyzers per branch |
| Test Linking | None | Link tests to specific analyzers |
| Storage | N/A | New `lab_analyzers` table |

### Sidebar Icons Missing (17 total)
```
ArrowRightLeft, Banknote, BarChart, Bell, FileCode, FolderOpen, 
Footprints, HeartHandshake, Layers, LayoutGrid, Megaphone, 
MessageSquare, Network, PackagePlus, Radio, Server, Tv
```

---

## Solution Architecture

### Database Schema

**New Tables:**

```text
┌─────────────────────────────────────────────────────────────┐
│                      pacs_servers                           │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ organization_id (uuid, FK → organizations)                  │
│ branch_id (uuid, FK → branches, nullable)                   │
│ name (text) - e.g., "Main PACS", "CT Scanner PACS"          │
│ server_url (text) - DICOMweb endpoint                       │
│ ae_title (text) - Application Entity Title                  │
│ username (text, nullable)                                   │
│ password (text, encrypted, nullable)                        │
│ modality_types (text[]) - ['ct_scan', 'mri']                │
│ is_default (boolean) - Default server for unmapped tests   │
│ is_active (boolean)                                         │
│ last_connection_check (timestamptz)                         │
│ connection_status (text) - 'connected'/'error'/'unknown'    │
│ created_at, updated_at                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      lab_analyzers                          │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ organization_id (uuid, FK → organizations)                  │
│ branch_id (uuid, FK → branches, nullable)                   │
│ name (text) - e.g., "Sysmex XN-1000", "Roche Cobas"         │
│ manufacturer (text) - e.g., "Sysmex", "Roche", "Beckman"    │
│ model (text) - e.g., "XN-1000", "Cobas 6000"                │
│ serial_number (text, nullable)                              │
│ analyzer_type (text) - 'hematology', 'chemistry', 'urine'   │
│ connection_type (text) - 'hl7', 'astm', 'api', 'manual'     │
│ ip_address (text, nullable)                                 │
│ port (integer, nullable)                                    │
│ location (text) - Physical location in lab                  │
│ is_active (boolean)                                         │
│ last_sync_at (timestamptz, nullable)                        │
│ connection_status (text) - 'online'/'offline'/'unknown'     │
│ created_at, updated_at                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  lab_analyzer_test_mappings                 │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ analyzer_id (uuid, FK → lab_analyzers)                      │
│ lab_test_template_id (uuid, FK → lab_test_templates)        │
│ analyzer_test_code (text) - Code used by analyzer           │
│ analyzer_test_name (text, nullable) - Name on analyzer      │
│ is_active (boolean)                                         │
│ created_at                                                  │
│ UNIQUE(analyzer_id, lab_test_template_id)                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                imaging_modality_pacs_mappings               │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ modality_id (uuid, FK → imaging_modalities)                 │
│ pacs_server_id (uuid, FK → pacs_servers)                    │
│ is_primary (boolean) - Primary PACS for this modality       │
│ created_at                                                  │
│ UNIQUE(modality_id, pacs_server_id)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Fix Missing Sidebar Icons (Quick Win)

**File:** `src/components/DynamicSidebar.tsx`

Add 17 missing icons to imports and iconMap:
- `ArrowRightLeft`, `Banknote`, `BarChart`, `Bell`, `FileCode`
- `FolderOpen`, `Footprints`, `HeartHandshake`, `Layers`, `LayoutGrid`
- `Megaphone`, `MessageSquare`, `Network`, `PackagePlus`, `Radio`
- `Server`, `Tv`

---

### Phase 2: Database Schema (Migration)

Create new tables for multi-device support:

1. **`pacs_servers`** - Multiple PACS server configurations
2. **`lab_analyzers`** - Lab analyzer device registry
3. **`lab_analyzer_test_mappings`** - Link tests to analyzers
4. **`imaging_modality_pacs_mappings`** - Link modalities to PACS servers

Add RLS policies for organization-level access control.

---

### Phase 3: PACS Multi-Server UI

**New/Modified Files:**

| File | Purpose |
|------|---------|
| `src/pages/app/radiology/PACSServersPage.tsx` | List/manage PACS servers |
| `src/hooks/usePACSServers.ts` | CRUD for pacs_servers table |
| `src/components/radiology/PACSServerForm.tsx` | Add/edit PACS server |
| `src/components/radiology/ModalityPACSMapping.tsx` | Map modalities to PACS |

**Features:**
- Add multiple PACS servers per organization/branch
- Configure server credentials (URL, AE Title, auth)
- Link specific modalities (CT, MRI, X-Ray) to specific PACS
- Test connection for each server
- Set default PACS for unmapped modalities
- Show connection status indicators

---

### Phase 4: Lab Analyzer Management UI

**New Files:**

| File | Purpose |
|------|---------|
| `src/pages/app/lab/LabAnalyzersPage.tsx` | List/manage lab analyzers |
| `src/pages/app/lab/LabAnalyzerFormPage.tsx` | Add/edit analyzer details |
| `src/pages/app/lab/LabAnalyzerMappingPage.tsx` | Map tests to analyzer |
| `src/hooks/useLabAnalyzers.ts` | CRUD for lab_analyzers table |
| `src/hooks/useLabAnalyzerMappings.ts` | CRUD for test mappings |

**Features:**
- Register lab analyzers (name, manufacturer, model, serial)
- Configure connection details (IP, port, protocol)
- Map multiple tests to each analyzer
- Specify analyzer-specific test codes for each mapping
- Show connection status (online/offline/unknown)
- Filter tests by category when mapping

---

### Phase 5: Update pacs-gateway Edge Function

**File:** `supabase/functions/pacs-gateway/index.ts`

Modify to:
1. Accept `pacs_server_id` parameter in requests
2. Look up server credentials from `pacs_servers` table
3. Route requests to appropriate PACS based on modality mapping
4. Fall back to default PACS if no specific mapping exists

---

### Phase 6: Menu & Navigation Updates

Add new menu items to database:
- "PACS Servers" under Radiology → Settings
- "Lab Analyzers" under Laboratory → Setup
- "Analyzer Mapping" under Laboratory → Setup

---

## UI Mockups

### PACS Servers List
```text
┌────────────────────────────────────────────────────────────┐
│  PACS Servers                           [+ Add Server]     │
├────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ● Main PACS (Default)                    ✓ Connected   │ │
│ │   https://pacs.hospital.com:8042                       │ │
│ │   Modalities: All                                      │ │
│ │   [Edit] [Test Connection]                             │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ● CT/MRI PACS                            ✓ Connected   │ │
│ │   https://imaging.hospital.com:8042                    │ │
│ │   Modalities: CT Scan, MRI, PET-CT                     │ │
│ │   [Edit] [Test Connection]                             │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Lab Analyzers List
```text
┌────────────────────────────────────────────────────────────┐
│  Lab Analyzers                          [+ Add Analyzer]   │
├────────────────────────────────────────────────────────────┤
│ Name            │ Type       │ Model        │ Status       │
│─────────────────┼────────────┼──────────────┼──────────────│
│ Sysmex XN-1000  │ Hematology │ XN-1000      │ ● Online     │
│ Roche Cobas 6000│ Chemistry  │ Cobas 6000   │ ● Online     │
│ Urisys 1100     │ Urinalysis │ Urisys 1100  │ ○ Offline    │
└────────────────────────────────────────────────────────────┘
```

### Test-to-Analyzer Mapping
```text
┌────────────────────────────────────────────────────────────┐
│  Test Mapping: Sysmex XN-1000                              │
├────────────────────────────────────────────────────────────┤
│ Available Tests (Hematology)      Mapped Tests             │
│ ┌─────────────────────────────┐   ┌─────────────────────┐  │
│ │ [  ] Platelet Count         │   │ Complete Blood Count│  │
│ │ [  ] ESR                    │   │   Code: CBC_01      │  │
│ │ [  ] Reticulocyte Count     │   │ Hemoglobin          │  │
│ │                             │   │   Code: HGB_01      │  │
│ │       [Add Selected →]      │   │ WBC Count           │  │
│ └─────────────────────────────┘   │   Code: WBC_01      │  │
│                                   └─────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| **Modify** | `src/components/DynamicSidebar.tsx` | Add 17 missing icons |
| **Create** | `src/pages/app/radiology/PACSServersPage.tsx` | PACS server list |
| **Create** | `src/components/radiology/PACSServerForm.tsx` | Add/edit PACS server |
| **Create** | `src/hooks/usePACSServers.ts` | PACS servers CRUD hook |
| **Create** | `src/pages/app/lab/LabAnalyzersPage.tsx` | Analyzer list page |
| **Create** | `src/pages/app/lab/LabAnalyzerFormPage.tsx` | Add/edit analyzer |
| **Create** | `src/pages/app/lab/LabAnalyzerMappingPage.tsx` | Map tests to analyzer |
| **Create** | `src/hooks/useLabAnalyzers.ts` | Analyzer CRUD hook |
| **Create** | `src/hooks/useLabAnalyzerMappings.ts` | Test mapping CRUD |
| **Modify** | `supabase/functions/pacs-gateway/index.ts` | Multi-PACS routing |
| **Modify** | `src/App.tsx` | Add new routes |

---

## Database Migration Summary

```sql
-- 1. PACS Servers table
CREATE TABLE pacs_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID REFERENCES branches(id),
  name TEXT NOT NULL,
  server_url TEXT NOT NULL,
  ae_title TEXT DEFAULT 'LOVABLE_HMS',
  username TEXT,
  password TEXT,
  modality_types TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_connection_check TIMESTAMPTZ,
  connection_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Lab Analyzers table
CREATE TABLE lab_analyzers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID REFERENCES branches(id),
  name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  analyzer_type TEXT NOT NULL,
  connection_type TEXT DEFAULT 'manual',
  ip_address TEXT,
  port INTEGER,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  connection_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Lab Analyzer Test Mappings
CREATE TABLE lab_analyzer_test_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analyzer_id UUID NOT NULL REFERENCES lab_analyzers(id) ON DELETE CASCADE,
  lab_test_template_id UUID NOT NULL REFERENCES lab_test_templates(id) ON DELETE CASCADE,
  analyzer_test_code TEXT NOT NULL,
  analyzer_test_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(analyzer_id, lab_test_template_id)
);

-- 4. Modality to PACS Mappings
CREATE TABLE imaging_modality_pacs_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modality_id UUID NOT NULL REFERENCES imaging_modalities(id) ON DELETE CASCADE,
  pacs_server_id UUID NOT NULL REFERENCES pacs_servers(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(modality_id, pacs_server_id)
);
```

---

## Note on Integration

This plan creates the **infrastructure and UI** for multi-device management. Actual HL7/ASTM/FHIR integration for real-time analyzer communication is a separate, larger project requiring:

- HL7 message parsing service
- Bi-directional interface (orders out, results in)
- Device-specific protocol handling
- Queue management for result imports

The current implementation provides:
- Device registration and management
- Test-to-device mapping configuration  
- Manual result entry with device selection
- Foundation for future automated integration

---

## Summary

| Component | Deliverable |
|-----------|-------------|
| **Sidebar Icons** | Add 17 missing icons to iconMap |
| **PACS Multi-Server** | Full CRUD + modality mapping UI |
| **Lab Analyzers** | Device registry + test mapping UI |
| **Database** | 4 new tables with RLS |
| **Edge Function** | Multi-PACS routing support |

This architecture supports multiple devices per organization with proper test-to-device linking, preparing the system for future automated integration.
