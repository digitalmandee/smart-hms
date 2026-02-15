

# Build Remaining AI Clinical Intelligence Features

## Overview

Wire the DoctorAIPanel quick action buttons to send structured prompts, and create four new components: AISuggestionCard, SOAPNoteGenerator, PrescriptionSuggester, and PatientIntakeSummary. All integrate into existing consultation and intake workflows.

---

## 1. Wire DoctorAIPanel Quick Action Buttons

**File: `src/components/ai/DoctorAIPanel.tsx`**

Currently the QuickPromptButton components are non-functional -- they render buttons but clicking does nothing. The fix:

- Add a `ref` to the `PatientAIChat` component or lift the `useAIChat` hook into DoctorAIPanel directly
- Instead of embedding PatientAIChat, use `useAIChat` directly in DoctorAIPanel and build a minimal chat display
- Each quick action button sends a pre-defined prompt:
  - **Suggest Diagnosis**: "Based on the patient context provided (symptoms, vitals, chief complaint), suggest a differential diagnosis with confidence levels and ICD-10 codes."
  - **SOAP Note**: "Generate a SOAP note based on the patient context provided."
  - **Suggest Labs**: "Based on the symptoms and vitals, recommend appropriate laboratory tests with reasoning."
- Add callback props: `onSuggestDiagnosis(text)` and `onSuggestNotes(text)` are already defined but unused -- these will be wired to populate the consultation form fields

## 2. AISuggestionCard Component

**New file: `src/components/ai/AISuggestionCard.tsx`**

A card that displays an AI suggestion with Accept/Reject actions. Used by DoctorAIPanel to present actionable suggestions.

- Props: `type` (diagnosis | prescription | lab_order | soap_note), `content` (string), `confidence` (optional string), `onAccept`, `onReject`, `isAccepted`
- Visual: Card with colored left border (blue for diagnosis, green for prescription, orange for labs, purple for SOAP)
- Accept button auto-fills the relevant consultation field via callbacks
- Reject button dismisses the suggestion
- Logs acceptance to `ai_suggestions_log` table via a mutation

## 3. SOAPNoteGenerator Component

**New file: `src/components/ai/SOAPNoteGenerator.tsx`**

One-click SOAP note generation from current consultation data.

- Props: `patientContext` (vitals, symptoms, diagnosis, chief complaint), `onGenerate(soapNote: string)`, `onAccept(soapNote: string)`
- Calls `useAIChat` in non-streaming mode (or streaming) with a specific SOAP prompt
- Displays generated SOAP note in a formatted preview
- "Apply to Notes" button fills the clinical notes field in the consultation
- Sections: Subjective, Objective, Assessment, Plan -- each editable before acceptance

## 4. PrescriptionSuggester Component

**New file: `src/components/ai/PrescriptionSuggester.tsx`**

AI-powered prescription suggestions based on diagnosis.

- Props: `diagnosis`, `patientContext` (allergies, current medications, vitals), `onAcceptPrescription(items: PrescriptionItemInput[])`
- Sends prompt asking DeepSeek to suggest medications in structured JSON format
- Displays each suggested medication as a card with: drug name, dosage, frequency, duration, route
- Drug interaction warnings highlighted in red
- Allergy cross-reference warnings
- Doctor can accept individual items or all at once
- Accepted items get added to the PrescriptionBuilder in the consultation form

## 5. PatientIntakeSummary Component

**New file: `src/components/ai/PatientIntakeSummary.tsx`**

Displays structured AI intake summary for the doctor to review.

- Props: `conversationId` (fetches conversation from ai_conversations table), `onApplySymptoms(symptoms: string[])`, `onApplyChiefComplaint(text: string)`
- Fetches the AI conversation and parses the structured summary from the last assistant message
- Displays in a formatted card: Chief Complaint, Duration, Severity, Associated Symptoms, History, Medications, Allergies
- "Apply to Consultation" button pre-fills consultation form fields
- Shown in the consultation sidebar when an AI pre-visit conversation exists for the appointment

## 6. Update ConsultationPage Integration

**File: `src/pages/app/opd/ConsultationPage.tsx`**

- Pass `onSuggestDiagnosis` and `onSuggestNotes` callbacks to DoctorAIPanel that set `diagnosis` and `clinicalNotes` state
- Add PatientIntakeSummary to sidebar (if AI pre-visit conversation exists for this appointment)

## 7. useAISuggestion Hook

**New file: `src/hooks/useAISuggestion.ts`**

Small hook to log AI suggestion acceptance/rejection to the `ai_suggestions_log` table.

- `logSuggestion({ conversationId, type, data, accepted, acceptedBy })`
- Uses `supabase.from('ai_suggestions_log').insert(...)` mutation

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/ai/DoctorAIPanel.tsx` | Rewrite | Wire quick actions, use useAIChat directly, show suggestions |
| `src/components/ai/AISuggestionCard.tsx` | Create | Accept/reject suggestion card |
| `src/components/ai/SOAPNoteGenerator.tsx` | Create | One-click SOAP note generation |
| `src/components/ai/PrescriptionSuggester.tsx` | Create | AI prescription suggestions |
| `src/components/ai/PatientIntakeSummary.tsx` | Create | Structured intake summary display |
| `src/hooks/useAISuggestion.ts` | Create | Log suggestion acceptance to DB |
| `src/pages/app/opd/ConsultationPage.tsx` | Modify | Wire callbacks, add intake summary |

## No Database Changes Required

The `ai_conversations` and `ai_suggestions_log` tables already exist with the correct schema.

