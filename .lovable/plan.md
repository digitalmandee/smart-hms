

# Transform AI Chat into "Your Personal AI Doctor"

## Overview

Rebrand the AI chat from a generic assistant into a warm, personal "AI Doctor" experience. Add server-side guardrails to reject non-medical questions, and improve the UI with a doctor persona, suggested medical topics, and a disclaimer.

---

## 1. Server-Side Medical Topic Guardrail

**File: `supabase/functions/ai-assistant/index.ts`**

Update ALL system prompts (patient_intake, doctor_assist, general) to include a strict instruction:

```
IMPORTANT: You are STRICTLY a medical assistant. If the user asks about anything 
unrelated to health, medicine, symptoms, treatments, medications, or hospital 
procedures, politely decline and redirect them to discuss their health concerns. 
Never answer questions about politics, entertainment, coding, weather, sports, 
or any non-medical topic.
```

This is the most reliable guardrail since it's enforced at the AI level regardless of which client calls it.

## 2. Rebrand UI as "Your AI Doctor"

**File: `src/components/ai/PatientAIChat.tsx`**

- Change title from "AI Medical Intake" to "Dr. AI" or "Your AI Doctor" (AR: "طبيبك الذكي")
- Replace Bot icon with Stethoscope icon for a medical feel
- Update welcome message to feel personal:
  - EN: "Hello! I'm Dr. AI, your personal medical assistant. Tell me what's bothering you, and I'll help gather the right information for your doctor."
  - AR: "مرحباً! أنا الدكتور الذكي، مساعدك الطبي الشخصي. أخبرني بما يزعجك وسأساعدك في جمع المعلومات المناسبة لطبيبك."
- Add a small medical disclaimer at the bottom: "For informational purposes only. Not a substitute for professional medical advice."
- Add suggested medical topic chips (quick-start buttons) when chat is empty:
  - "I have a headache"
  - "Stomach pain"
  - "Fever and chills"
  - "Follow-up on my condition"
- Add a subtle gradient/pulse animation on the doctor avatar to feel more "alive"

## 3. Update AIChatPage with Doctor Persona

**File: `src/pages/app/ai/AIChatPage.tsx`**

- Change page title to "Your AI Doctor"
- Add a brief intro card above the chat: "Get preliminary medical guidance. Dr. AI will ask about your symptoms and prepare a summary for your physician."
- Add breadcrumb: OPD > AI Doctor

## 4. Update DoctorAIPanel Branding

**File: `src/components/ai/DoctorAIPanel.tsx`**

- Rename from "AI Clinical Assistant" to "Clinical AI Copilot" to differentiate from the patient-facing "Dr. AI"
- Keep the Stethoscope-based branding consistent

## 5. Enhance Welcome Screen

**File: `src/components/ai/PatientAIChat.tsx`**

Replace the single welcome message with a richer empty state:
- Large Stethoscope icon with subtle animation
- "Dr. AI" name prominently displayed
- Tagline: "Your personal medical intake assistant"
- 3-4 suggested topic chips the user can tap to start
- Medical disclaimer text

---

## Files Changed Summary

| File | Change | Purpose |
|------|--------|---------|
| `supabase/functions/ai-assistant/index.ts` | Modify | Add medical-only guardrail to all system prompts |
| `src/components/ai/PatientAIChat.tsx` | Modify | Rebrand as "Dr. AI", add topic chips, disclaimer |
| `src/pages/app/ai/AIChatPage.tsx` | Modify | Update page title, add intro card |
| `src/components/ai/DoctorAIPanel.tsx` | Modify | Rename to "Clinical AI Copilot" |

## Access Points (No Changes Needed)

The AI chat is already accessible from:
- OPD sidebar menu: "AI Assistant" (doctors only)
- Reception Quick Actions: "AI Patient Intake"
- Consultation sidebar: DoctorAIPanel
- Appointment dialogs: PatientIntakeButton

No new routes or modules are created.

