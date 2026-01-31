# Lab Analyzer Mapping Page & System Completion Plan

## Summary of Tasks

This plan addresses four items:
1. ✅ Create the missing Lab Analyzer Mapping Page (`/app/lab/analyzers/:id/mapping`)
2. Test PACS Servers page functionality
3. Test Lab Analyzers page functionality  
4. ✅ Add menu items to sidebar for PACS Servers and Lab Analyzers

---

## Current State

| Item | Status |
|------|--------|
| PACS Servers Page | Created at `/app/radiology/pacs/servers` |
| Lab Analyzers Page | Created at `/app/lab/analyzers` |
| Lab Analyzer Form | Created at `/app/lab/analyzers/new` and `/:id/edit` |
| Lab Analyzer Mapping Page | **MISSING** - route `/app/lab/analyzers/:id/mapping` not defined |
| PACS Servers Menu Item | Not in database |
| Lab Analyzers Menu Item | Not in database |

---

## Implementation Plan

### Phase 1: Create Lab Analyzer Mapping Page

**New File**: `src/pages/app/lab/LabAnalyzerMappingPage.tsx`

This page will allow users to:
- View all tests currently mapped to a specific analyzer
- Add new test mappings with analyzer-specific codes
- Edit existing mappings (change analyzer code/name)
- Remove test mappings
- Filter available tests by category

**Key Features**:
- Two-panel layout: Available tests (left) and Mapped tests (right)
- Search/filter for available tests
- Inline editing for analyzer test codes
- Bulk add capability for multiple tests

**Component Structure**:
```
LabAnalyzerMappingPage
├── ModernPageHeader (with analyzer name)
├── Card: Available Tests
│   ├── Search/Filter controls
│   └── Checkbox list of unmapped tests
├── Card: Mapped Tests
│   └── Table with test name, analyzer code, actions
└── AddMappingDialog
    ├── Test selector
    ├── Analyzer code input
    └── Analyzer name input (optional)
```

**Data Flow**:
- Uses `useLabAnalyzer(id)` to get analyzer details
- Uses `useLabTestTemplates()` to get all available tests
- Uses `useLabAnalyzerMappings(id)` to get current mappings
- Uses `useCreateTestMapping()` and `useDeleteTestMapping()` for CRUD

### Phase 2: Add Route to App.tsx

**File**: `src/App.tsx`

Add the following route after line 695:
```typescript
<Route path="lab/analyzers/:id/mapping" element={<LabAnalyzerMappingPage />} />
```

Add import at the top:
```typescript
import LabAnalyzerMappingPage from "./pages/app/lab/LabAnalyzerMappingPage";
```

### Phase 3: Add Menu Items to Database

Add two new menu items for sidebar navigation:

**1. Lab Analyzers** (under Laboratory parent)
| Field | Value |
|-------|-------|
| name | Lab Analyzers |
| icon | FlaskConical |
| path | /app/lab/analyzers |
| parent_id | 3417b2f5-93dd-4408-9f1c-8dfac19ce161 (Laboratory) |
| required_module | lab |
| sort_order | 60 |
| is_active | true |

**2. PACS Servers** (under Radiology parent)
| Field | Value |
|-------|-------|
| name | PACS Servers |
| icon | Server |
| path | /app/radiology/pacs/servers |
| parent_id | 9ff1827f-4689-40dd-96e4-4378dfefa3bc (Radiology) |
| required_module | radiology |
| sort_order | 80 |
| is_active | true |

---

## Technical Details

### LabAnalyzerMappingPage Component

```typescript
// Key state and hooks
const { id } = useParams();
const { data: analyzer } = useLabAnalyzer(id);
const { data: mappings } = useLabAnalyzerMappings(id);
const { data: allTests } = useLabTestTemplates();
const createMapping = useCreateTestMapping();
const deleteMapping = useDeleteTestMapping();

// Filter to get unmapped tests
const mappedTestIds = mappings?.map(m => m.lab_test_template_id) || [];
const availableTests = allTests?.filter(t => !mappedTestIds.includes(t.id));

// Add mapping handler
const handleAddMapping = async (testId: string, code: string) => {
  await createMapping.mutateAsync({
    analyzer_id: id,
    lab_test_template_id: testId,
    analyzer_test_code: code,
  });
};
```

### UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Test Mapping: Sysmex XN-1000                    [← Back]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐│
│  │ Available Tests         │  │ Mapped Tests                ││
│  │ ┌─────────────────────┐ │  │                             ││
│  │ │ 🔍 Search tests...  │ │  │ Test Name    │ Code │ ✕    ││
│  │ └─────────────────────┘ │  │ ────────────────────────────││
│  │ Category: [All ▼]       │  │ CBC          │ HEM01 │ ✕    ││
│  │ ────────────────────────│  │ Hemoglobin   │ HEM02 │ ✕    ││
│  │ [ ] Platelet Count      │  │ WBC Count    │ HEM03 │ ✕    ││
│  │ [ ] ESR                 │  │                             ││
│  │ [ ] Reticulocyte Count  │  │                             ││
│  │ [ ] Blood Group         │  │                             ││
│  │                         │  │                             ││
│  │    [Add Selected →]     │  │                             ││
│  └─────────────────────────┘  └─────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| **Create** | `src/pages/app/lab/LabAnalyzerMappingPage.tsx` | Test-to-analyzer mapping UI |
| **Modify** | `src/App.tsx` | Add route for mapping page |
| **Insert** | Database `menu_items` | Add Lab Analyzers and PACS Servers menu entries |

---

## Testing Notes

After implementation, the following should be verified:

1. **Lab Analyzer Mapping Page**:
   - Navigate to `/app/lab/analyzers/:id/mapping`
   - Add a test mapping with code
   - Verify mapping appears in list
   - Delete a mapping and verify removal
   - Check that duplicate mappings are prevented

2. **PACS Servers Page** (`/app/radiology/pacs/servers`):
   - Add a new PACS server
   - Edit server details
   - Test connection (will fail without real PACS, but button should work)
   - Set default server
   - Delete a server

3. **Lab Analyzers Page** (`/app/lab/analyzers`):
   - Add a new analyzer
   - Edit analyzer details
   - Navigate to mapping page via Settings icon
   - Delete an analyzer

4. **Menu Navigation**:
   - Lab Analyzers appears under Laboratory menu
   - PACS Servers appears under Radiology menu
