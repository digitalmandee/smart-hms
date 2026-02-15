

# AI Integration Plan for HealthOS 24
## Inspired by Boston Health AI (Hami) -- Powered by DeepSeek

---

## Boston Health AI Comparison

Boston Health AI's "Hami" is a clinical intelligence companion that covers:
1. **Patient Intake** -- AI chatbot guides patients through symptom collection before visits
2. **Ambient Scribe** -- Real-time clinical documentation during doctor visits
3. **SOAP Notes** -- Automated clinical documentation generation
4. **Care Coordination** -- Post-visit summaries and follow-up

HealthOS 24 already has strong foundations (symptoms input, vitals, prescriptions, diagnosis, lab orders). The AI layer will enhance these existing workflows rather than replace them.

---

## Phase 1: Core Infrastructure (Edge Function + DeepSeek)

### What gets built:
- A single Supabase edge function `ai-assistant` that proxies requests to DeepSeek API
- Supports both patient and doctor contexts via a `mode` parameter
- Bilingual system prompts (English + Arabic) with medical terminology
- Conversation history stored in a new `ai_conversations` table

### Database:

```text
ai_conversations
  - id (uuid, PK)
  - organization_id (uuid, FK)
  - patient_id (uuid, FK, nullable)
  - user_id (uuid, FK, nullable)
  - context_type: 'patient_intake' | 'doctor_assist' | 'general'
  - messages (jsonb array)
  - metadata (jsonb -- symptoms extracted, etc.)
  - language: 'en' | 'ar'
  - created_at, updated_at

ai_suggestions_log
  - id (uuid, PK)
  - conversation_id (uuid, FK)
  - suggestion_type: 'diagnosis' | 'prescription' | 'lab_order' | 'soap_note'
  - suggestion_data (jsonb)
  - accepted (boolean)
  - accepted_by (uuid, FK)
  - created_at
```

### Edge Function: `supabase/functions/ai-assistant/index.ts`
- Accepts `mode`, `messages`, `patient_context`, `language`
- Routes to DeepSeek API (https://api.deepseek.com/v1/chat/completions)
- Uses DeepSeek-V3 for general chat, DeepSeek-R1 for clinical reasoning
- Streaming SSE response for real-time token delivery
- Secret needed: `DEEPSEEK_API_KEY`

---

## Phase 2: Patient-Facing AI Chat (Like Hami Intake)

### What it does:
- Patients access a chat interface (on kiosk, mobile, or patient portal)
- AI guides them through symptom collection using clinical reasoning
- Asks follow-up questions based on responses (not a static form)
- Generates a structured pre-visit summary for the doctor
- Supports English and Arabic with auto-detection

### UI Components:
- `src/components/ai/PatientAIChat.tsx` -- Full chat interface with message bubbles
- `src/components/ai/AIChatMessage.tsx` -- Individual message component with markdown
- `src/components/ai/PatientIntakeSummary.tsx` -- Structured output card

### Integration Points:
- **Kiosk Mode**: Add AI intake option alongside token generation
- **Appointments**: "Start AI Pre-Visit" button on upcoming appointments
- **OPD Check-in**: Doctor sees AI-generated intake summary in consultation view

### DeepSeek System Prompt (Patient Mode):
```text
You are a medical intake assistant for a hospital. Guide the patient through
describing their health concerns. Ask one focused question at a time.
Collect: chief complaint, symptom duration, severity (1-10), associated
symptoms, medical history, current medications, allergies.
Be empathetic and clear. Support English and Arabic.
Do NOT diagnose. Summarize findings for the doctor.
```

---

## Phase 3: Doctor AI Assistant

### 3A: AI-Assisted Consultation
- Floating AI assistant panel in the consultation view
- Doctor can ask: "Suggest diagnosis based on symptoms" or "Generate SOAP note"
- AI receives full patient context (vitals, symptoms, history, lab results)
- Suggestions appear as actionable cards the doctor can accept/modify

### 3B: Automated SOAP Notes
- One-click SOAP note generation from consultation data
- Uses existing vitals, symptoms, diagnosis, and prescription data
- Doctor reviews and edits before saving
- Integrates with existing `PrintableConsultation.tsx`

### 3C: Prescription Suggestions
- Based on diagnosis, suggest common medications with dosages
- Cross-reference with patient allergies and current medications
- Drug interaction warnings
- Doctor must explicitly accept each suggestion

### UI Components:
- `src/components/ai/DoctorAIPanel.tsx` -- Slide-out panel in consultation
- `src/components/ai/AISuggestionCard.tsx` -- Actionable suggestion with Accept/Reject
- `src/components/ai/SOAPNoteGenerator.tsx` -- One-click SOAP generation
- `src/components/ai/PrescriptionSuggester.tsx` -- Drug suggestion cards

### DeepSeek System Prompt (Doctor Mode):
```text
You are a clinical decision support assistant. You assist doctors with:
1. Differential diagnosis suggestions based on symptoms and vitals
2. SOAP note generation from clinical encounter data
3. Prescription suggestions with dosage guidelines
4. Lab test recommendations

Always present suggestions as options, never as definitive decisions.
Include confidence levels. Flag drug interactions and contraindications.
Support ICD-10 coding. Respond in the doctor's preferred language.
```

---

## Phase 4: Future Enhancements (Not in initial build)

- **Ambient Scribe**: Voice-to-text during consultations (requires speech API)
- **Radiology AI**: Image analysis for X-rays/CT scans
- **Predictive Analytics**: Patient readmission risk, no-show prediction
- **Insurance Claim AI**: Auto-generate claim narratives

---

## Technical Architecture

```text
Patient/Doctor (Browser)
        |
        v
  React Chat UI (streaming SSE)
        |
        v
  Supabase Edge Function (ai-assistant)
    - Auth validation
    - Context assembly (patient data, vitals, history)
    - System prompt selection (patient vs doctor mode)
    - Conversation persistence
        |
        v
  DeepSeek API (V3 for chat, R1 for reasoning)
    - Streaming response
    - Tool calling for structured output
```

---

## Implementation Order

| Step | What | Effort |
|------|------|--------|
| 1 | Add `DEEPSEEK_API_KEY` secret, create `ai-assistant` edge function | Small |
| 2 | Create `ai_conversations` + `ai_suggestions_log` tables | Small |
| 3 | Build patient AI chat component with streaming | Medium |
| 4 | Integrate patient intake with kiosk and appointments | Medium |
| 5 | Build doctor AI panel in consultation view | Medium |
| 6 | Add SOAP note generator | Small |
| 7 | Add prescription suggestion engine | Medium |
| 8 | Arabic language support and testing | Small |

---

## DeepSeek API Details

- **Endpoint**: `https://api.deepseek.com/v1/chat/completions`
- **Models**: `deepseek-chat` (V3, fast), `deepseek-reasoner` (R1, clinical reasoning)
- **Pricing**: Very cost-effective (~$0.14/M input tokens, $0.28/M output tokens for V3)
- **Context**: 64K tokens -- sufficient for full patient history
- **Streaming**: Supported via SSE (same format as OpenAI)
- **API Key**: User needs to obtain from https://platform.deepseek.com

---

## Security Considerations

- All AI calls go through the edge function (never direct from client)
- Patient data never leaves the edge function context unnecessarily
- Doctor must explicitly accept all AI suggestions (no auto-application)
- All suggestions logged for audit trail
- RLS policies on conversation tables scoped to organization

