

# Consultation AI Panel - UX Overhaul

## Problems Identified

1. **AI Assistant tab is cramped**: All AI features (chat, diagnosis, SOAP, labs) are stacked in a single scrollable card with no clear separation
2. **SOAP Note generation exists but doesn't one-click save** to the consultation's clinical notes properly
3. **Medicine Alternatives on doctor side** is buried inside the Prescription tab alongside the prescription builder -- no "Did you mean?" correction like the pharmacy version
4. **No bubble-style chat** in doctor AI -- messages render in a generic scrollarea without clear visual separation
5. **Vitals panel overflows** on the right side (visible in screenshot)
6. **AI tab layout doesn't use space efficiently** -- everything is vertically stacked

## Plan

### 1. Redesign AI Assistant Tab with Vertical Sub-Tabs

**File: `src/pages/app/opd/ConsultationPage.tsx`**

Replace the single `DoctorAIPanel` in the AI tab with a vertical sub-tab layout:

```
+------------------+-----------------------------------+
| [icon] Chat      |                                   |
| [icon] Diagnosis |   (Active sub-tab content)        |
| [icon] SOAP Note |                                   |
| [icon] Labs      |                                   |
| [icon] Medicine  |                                   |
+------------------+-----------------------------------+
```

- Left side: Icon-only vertical pills (Stethoscope, FileText, TestTube, MessageCircle, Pill)
- Right side: Content area for the active sub-tab
- This separates each AI function into its own focused panel instead of one giant scroll

### 2. Refactor DoctorAIPanel into Separate Sub-Components

**File: `src/components/ai/DoctorAIPanel.tsx`**

Split the monolithic panel into focused sub-tabs:

- **Chat sub-tab**: Free-form AI chat with bubble-style messages (already uses `AIChatMessage` with bubble styling)
- **Diagnosis sub-tab**: One-click "Suggest Diagnosis" button + result card with Accept/Edit. On accept, directly sets diagnosis field
- **SOAP Note sub-tab**: Generate button -> editable S/O/A/P fields -> "Apply to Clinical Notes" button that writes to `clinicalNotes` state
- **Labs sub-tab**: Suggest labs button + results
- **Medicine Alternatives sub-tab**: Move `MedicineAlternatives` from the Prescription tab into here, and add the same "Did you mean?" auto-correction that the pharmacy POS version has

### 3. SOAP Note One-Click Apply

**File: `src/components/ai/DoctorAIPanel.tsx` (SOAP sub-tab)**

When doctor clicks "Apply to Clinical Notes":
- Call `onSuggestNotes(fullSOAPNote)` which already maps to `setClinicalNotes`
- Show a toast "SOAP note applied to clinical notes"
- The note is automatically saved when the doctor clicks Save Draft or Complete Consultation

### 4. Add "Did you mean?" to Doctor-Side Medicine Alternatives

**File: `src/components/ai/MedicineAlternatives.tsx`**

Port the two-phase search from `POSMedicineAlternatives.tsx`:
- Phase 1: Correct the medicine name ("pana" -> "Panadol")
- Show "Did you mean **Panadol**?" confirmation strip with DoctorAvatar
- Phase 2: On confirm, fetch alternatives
- Skip confirmation if name matches exactly

### 5. Clean Up Prescription Tab

**File: `src/pages/app/opd/ConsultationPage.tsx`**

- Remove `MedicineAlternatives` and `PrescriptionSuggester` from the Prescription tab
- Prescription tab becomes purely the prescription builder (clean, focused)
- AI suggestions are accessed from the AI Assistant tab's sub-tabs

### 6. Tabeebi Branding Consistency

Across all doctor AI sub-tabs:
- Use `DoctorAvatar` (xs) as the icon in headers
- Teal-tinted cards (`bg-primary/5 border-primary/20`)
- "Powered by Tabeebi" footer text on each sub-tab

## Technical Details

| File | Change |
|------|--------|
| `src/pages/app/opd/ConsultationPage.tsx` | Replace AI tab content with vertical sub-tab layout; remove MedicineAlternatives and PrescriptionSuggester from Prescription tab |
| `src/components/ai/DoctorAIPanel.tsx` | Refactor into vertical sub-tabs: Chat, Diagnosis, SOAP, Labs, Medicine Alt; each with focused UI and one-click actions |
| `src/components/ai/MedicineAlternatives.tsx` | Add "Did you mean?" auto-correction (port from POSMedicineAlternatives) |

### Component Flow

```text
AI Assistant Tab
  |-- Vertical sub-tabs (icon pills on left)
       |-- Chat: Free-form AI conversation (bubble messages)
       |-- Diagnosis: One-click suggest -> Accept sets diagnosis field
       |-- SOAP: Generate -> Edit S/O/A/P -> Apply to Clinical Notes
       |-- Labs: One-click suggest -> Result cards
       |-- Medicine: "Did you mean?" correction -> Alternatives list -> "Use" adds to Rx
```

### SOAP Apply Flow

```text
Click "Generate SOAP" -> AI returns structured SOAP
  -> Doctor edits fields -> Click "Apply"
  -> setClinicalNotes(formatted SOAP string)
  -> Toast: "SOAP note applied"
  -> Auto-saved on Save Draft / Complete
```

No database changes needed. No new edge functions. No new dependencies.
