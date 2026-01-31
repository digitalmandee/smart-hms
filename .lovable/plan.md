
# Comprehensive Lab & Radiology Device Integration System

## Overview

This plan implements:
1. **HL7/ASTM Lab Results Edge Function** - Receive and auto-import lab results from analyzers
2. **Device Catalog System** - Pre-populated list of common machines with their default configurations
3. **Enhanced Registration** - When adding a device, show available configurations to auto-fill settings
4. **Separate Lists** - Dedicated views for Radiology machines vs Lab machines

---

## Database Schema Changes

### 1. Device Catalog Tables (Pre-populated Reference Data)

```text
┌─────────────────────────────────────────────────────────────┐
│                 lab_analyzer_catalog                        │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ manufacturer (text) - e.g., "Sysmex", "Roche", "Beckman"    │
│ model (text) - e.g., "XN-1000", "Cobas 6000"                │
│ analyzer_type (text) - hematology, chemistry, etc.          │
│ connection_protocol (text) - HL7, ASTM, API                 │
│ default_port (int) - Default communication port             │
│ hl7_version (text) - e.g., "2.3", "2.5.1"                   │
│ message_format (text) - Frame structure details             │
│ result_segment (text) - OBX, OBR patterns                   │
│ notes (text) - Configuration notes                          │
│ is_active (boolean)                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               radiology_device_catalog                      │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ manufacturer (text) - e.g., "Siemens", "GE", "Philips"      │
│ model (text) - e.g., "MAGNETOM Vida", "Optima CT660"        │
│ device_type (text) - ct, mri, xray, ultrasound, etc.        │
│ modality_code (text) - CT, MR, CR, US, etc. (DICOM codes)   │
│ dicom_ae_title (text) - Default AE Title                    │
│ default_port (int) - Default DICOM port                     │
│ supports_dicomweb (boolean)                                 │
│ supports_worklist (boolean)                                 │
│ notes (text)                                                │
│ is_active (boolean)                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   lab_result_imports                        │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ organization_id (uuid, FK)                                  │
│ analyzer_id (uuid, FK → lab_analyzers)                      │
│ message_type (text) - HL7, ASTM                             │
│ raw_message (text) - Original message content               │
│ parsed_data (jsonb) - Parsed result data                    │
│ patient_id_from_message (text)                              │
│ matched_patient_id (uuid, nullable)                         │
│ matched_order_id (uuid, nullable)                           │
│ status (text) - pending, matched, imported, error           │
│ error_message (text, nullable)                              │
│ processed_at (timestamptz, nullable)                        │
│ created_at (timestamptz)                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Pre-Populated Device Catalogs

### Lab Analyzer Catalog (Common Models)

| Manufacturer | Model | Type | Protocol | Port |
|-------------|-------|------|----------|------|
| **Sysmex** | XN-1000 | Hematology | HL7 2.3.1 | 2575 |
| **Sysmex** | XN-2000 | Hematology | HL7 2.3.1 | 2575 |
| **Sysmex** | XN-3000 | Hematology | HL7 2.3.1 | 2575 |
| **Sysmex** | CS-5100 | Coagulation | HL7 2.3.1 | 2575 |
| **Roche** | Cobas 6000 | Chemistry | ASTM | 4000 |
| **Roche** | Cobas c311 | Chemistry | ASTM | 4000 |
| **Roche** | Cobas e411 | Immunology | ASTM | 4000 |
| **Roche** | Cobas c501 | Chemistry | ASTM | 4000 |
| **Beckman Coulter** | DxH 800 | Hematology | HL7 2.5.1 | 2575 |
| **Beckman Coulter** | AU5800 | Chemistry | HL7 2.5 | 2575 |
| **Beckman Coulter** | DxI 800 | Immunoassay | HL7 2.5 | 2575 |
| **Abbott** | Alinity ci | Chemistry/Immuno | HL7 2.5.1 | 2575 |
| **Abbott** | Architect c8000 | Chemistry | HL7 2.3.1 | 2575 |
| **Abbott** | Cell-Dyn Ruby | Hematology | HL7 2.3 | 2575 |
| **Siemens** | Atellica CH | Chemistry | HL7 2.5.1 | 2575 |
| **Siemens** | ADVIA 2120i | Hematology | HL7 2.5.1 | 2575 |
| **Mindray** | BC-6800 | Hematology | HL7 2.3.1 | 5555 |
| **Mindray** | BS-800M | Chemistry | HL7 2.3.1 | 5555 |
| **Horiba** | Yumizen H500 | Hematology | ASTM | 4000 |
| **Urit** | UA-600 | Urinalysis | ASTM | 4000 |
| **Dirui** | CS-T300 | Urinalysis | HL7 2.3 | 2575 |

### Radiology Device Catalog (Common Models)

| Manufacturer | Model | Type | Modality | Port |
|-------------|-------|------|----------|------|
| **Siemens** | MAGNETOM Vida | MRI | MR | 104 |
| **Siemens** | SOMATOM go.Top | CT | CT | 104 |
| **Siemens** | Ysio Max | X-Ray | DX | 104 |
| **GE Healthcare** | SIGNA Artist | MRI | MR | 104 |
| **GE Healthcare** | Optima CT660 | CT | CT | 104 |
| **GE Healthcare** | Discovery XR656 | X-Ray | DX | 104 |
| **GE Healthcare** | LOGIQ E10 | Ultrasound | US | 104 |
| **Philips** | Ingenia Ambition | MRI | MR | 104 |
| **Philips** | Incisive CT | CT | CT | 104 |
| **Philips** | EPIQ Elite | Ultrasound | US | 104 |
| **Canon** | Aquilion ONE | CT | CT | 104 |
| **Canon** | Vantage Titan | MRI | MR | 104 |
| **Fujifilm** | FDR D-EVO II | X-Ray | CR | 104 |
| **Carestream** | DRX-Evolution | X-Ray | CR | 104 |
| **Samsung** | RS85 Prestige | Ultrasound | US | 104 |
| **Mindray** | Resona 7 | Ultrasound | US | 104 |
| **Orthanc** | Open Source PACS | PACS Server | - | 8042 |
| **DCM4CHEE** | Open Source PACS | PACS Server | - | 8080 |
| **Horos** | Open Source Viewer | Workstation | - | 11112 |

---

## Edge Function: HL7/ASTM Lab Result Receiver

**File:** `supabase/functions/lab-result-receiver/index.ts`

### Functionality

1. **Receive HL7/ASTM Messages** via HTTP POST
2. **Parse Message** - Extract patient ID, test codes, results
3. **Match to Patient** - Find patient by MRN/ID
4. **Match to Order** - Find pending lab order
5. **Auto-Import Results** - Update lab_order_items with result values
6. **Log Import** - Store in lab_result_imports for audit

### HL7 Message Structure (OBR/OBX segments)

```text
MSH|^~\&|ANALYZER|LAB|HMS|HOSPITAL|20260131120000||ORU^R01|MSG001|P|2.3.1
PID|1||PAT001^^^HMS^MR||DOE^JOHN||19800101|M
OBR|1|ORD001||CBC^Complete Blood Count
OBX|1|NM|WBC^WBC||7.5|10*9/L|4.0-10.0|N|||F
OBX|2|NM|RBC^RBC||4.8|10*12/L|4.0-5.5|N|||F
OBX|3|NM|HGB^Hemoglobin||14.2|g/dL|12.0-16.0|N|||F
```

### ASTM Message Structure

```text
H|\^&|||Analyzer^1.0|||||||P|1|20260131
P|1||PAT001
O|1|ORD001||CBC
R|1|^^^WBC|7.5|10*9/L||N||F||||20260131
R|2|^^^RBC|4.8|10*12/L||N||F||||20260131
L|1|N
```

---

## Implementation Plan

### Phase 1: Database Migration

Create tables:
- `lab_analyzer_catalog` - Pre-populated lab device catalog
- `radiology_device_catalog` - Pre-populated radiology device catalog  
- `lab_result_imports` - Import log/queue table

Insert seed data for 20+ lab analyzers and 15+ radiology devices.

### Phase 2: Edge Function - Lab Result Receiver

**File:** `supabase/functions/lab-result-receiver/index.ts`

Features:
- Accept HL7 or ASTM messages via POST
- Parse messages using segment-based logic
- Match patient by MRN
- Match order by order number or patient + pending tests
- Update lab_order_items with results
- Return confirmation/error response

### Phase 3: Enhanced Lab Analyzer Form

**Modify:** `src/pages/app/lab/LabAnalyzerFormPage.tsx`

Add:
- "Select from Catalog" dropdown at top
- When catalog item selected, auto-fill: manufacturer, model, type, protocol, port
- Show configuration notes from catalog

### Phase 4: Enhanced PACS Server Form

**Modify:** `src/components/radiology/PACSServerFormDialog.tsx`

Add:
- "Select from Catalog" dropdown
- Auto-fill device settings when selected
- Show DICOM modality codes

### Phase 5: Device Catalog Pages

**New Files:**
- `src/pages/app/settings/LabDeviceCatalogPage.tsx` - View/manage lab device catalog
- `src/pages/app/settings/RadiologyDeviceCatalogPage.tsx` - View/manage radiology device catalog

### Phase 6: Hooks for Catalogs

**New Files:**
- `src/hooks/useLabAnalyzerCatalog.ts` - Fetch lab device catalog
- `src/hooks/useRadiologyDeviceCatalog.ts` - Fetch radiology device catalog

---

## Technical Details

### Edge Function Structure

```typescript
// supabase/functions/lab-result-receiver/index.ts

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LabResult {
  testCode: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: string;
}

interface ParsedMessage {
  messageType: 'HL7' | 'ASTM';
  patientId: string;
  orderNumber: string;
  results: LabResult[];
  timestamp: string;
}

function parseHL7Message(message: string): ParsedMessage { ... }
function parseASTMMessage(message: string): ParsedMessage { ... }

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 1. Receive message
  // 2. Detect format (HL7 vs ASTM)
  // 3. Parse message
  // 4. Match patient and order
  // 5. Import results
  // 6. Log import
  // 7. Return response
});
```

### Catalog Selection UI

```text
┌────────────────────────────────────────────────────────────────┐
│  Add Lab Analyzer                                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Quick Setup: Select from Catalog                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [Search devices...]                              ▼       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ ● Sysmex XN-1000 (Hematology) - HL7 2.3.1               │  │
│  │ ● Sysmex XN-2000 (Hematology) - HL7 2.3.1               │  │
│  │ ● Roche Cobas 6000 (Chemistry) - ASTM                   │  │
│  │ ● Roche Cobas c311 (Chemistry) - ASTM                   │  │
│  │ ● Beckman DxH 800 (Hematology) - HL7 2.5.1              │  │
│  │ ...                                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ─────────────── or enter manually ───────────────            │
│                                                                │
│  Analyzer Name *        [Sysmex XN-1000 (auto-filled)    ]    │
│  Analyzer Type *        [Hematology ▼] (auto-selected)        │
│  Manufacturer           [Sysmex (auto-filled)            ]    │
│  Model                  [XN-1000 (auto-filled)           ]    │
│  Connection Type        [HL7 ▼] (auto-selected)               │
│  Port                   [2575 (auto-filled)              ]    │
│                                                                │
│  💡 This analyzer uses HL7 v2.3.1 protocol. Results will be   │
│     sent as ORU^R01 messages with OBX segments.               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| **Create** | `supabase/migrations/XXXX_device_catalogs.sql` | Device catalog tables + seed data |
| **Create** | `supabase/functions/lab-result-receiver/index.ts` | HL7/ASTM message receiver |
| **Create** | `src/hooks/useLabAnalyzerCatalog.ts` | Fetch lab device catalog |
| **Create** | `src/hooks/useRadiologyDeviceCatalog.ts` | Fetch radiology device catalog |
| **Modify** | `src/pages/app/lab/LabAnalyzerFormPage.tsx` | Add catalog selection |
| **Modify** | `src/components/radiology/PACSServerFormDialog.tsx` | Add catalog selection |
| **Modify** | `supabase/config.toml` | Add lab-result-receiver function |

---

## Security Considerations

1. **Edge Function Authentication**
   - Support API key auth for analyzer communication
   - Log all incoming messages
   - Rate limiting on message endpoint

2. **Result Validation**
   - Validate result values are numeric where expected
   - Flag out-of-range values
   - Prevent duplicate imports

3. **Audit Trail**
   - All imports logged in `lab_result_imports`
   - Track matched vs unmatched results
   - Store raw message for troubleshooting

---

## Summary

| Component | Deliverable |
|-----------|-------------|
| **Device Catalogs** | 20+ lab analyzers, 15+ radiology devices |
| **HL7/ASTM Receiver** | Edge function for auto-importing results |
| **Enhanced Forms** | Catalog selection with auto-fill |
| **Import Logging** | Full audit trail of received results |
| **Separate Views** | Lab and Radiology device lists |

This system provides the foundation for automated lab integration while maintaining manual entry as a fallback.
