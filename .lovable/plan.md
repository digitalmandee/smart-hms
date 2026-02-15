

# Apply "Tabeebi" (طبيبي) Branding Across AI Chat

## Overview

Rebrand the AI assistant from "Dr. AI" to **Tabeebi** (طبيبي), meaning "My Doctor" in Arabic. Update all patient-facing and doctor-facing components, plus the server-side system prompts.

**Tagline:** "طبيبك الشخصي - Your Personal Doctor"

---

## Changes

### 1. PatientAIChat.tsx (Patient-facing chat)

- Title: "Dr. AI" --> "Tabeebi" (EN), "طبيبي" (AR)
- Subtitle: "Your Personal AI Doctor" --> "Your Personal Doctor" (EN), "طبيبك الشخصي" (AR)
- Welcome heading: "Dr. AI" --> "Tabeebi" / "طبيبي"
- Welcome message updated:
  - EN: "Hello! I'm Tabeebi, your personal medical assistant. Tell me what's bothering you, and I'll help gather the right information for your doctor."
  - AR: "مرحبا! أنا طبيبي، مساعدك الطبي الشخصي. أخبرني بما يزعجك وسأساعدك في جمع المعلومات المناسبة لطبيبك."
- Language toggle label stays the same

### 2. DoctorAIPanel.tsx (Doctor-facing clinical panel)

- Title: "Clinical AI Copilot" --> "Tabeebi Clinical" 
- Empty state text updated to reference Tabeebi branding

### 3. AIChatPage.tsx (Full-page chat)

- Page title: "Your AI Doctor" --> "Tabeebi - Your Personal Doctor"
- Breadcrumb: "AI Doctor" --> "Tabeebi"
- Intro card text: Updated to reference Tabeebi by name

### 4. Edge Function: ai-assistant/index.ts (System prompts)

All system prompts updated to use "Tabeebi" identity:

- **patient_intake (EN):** "You are Tabeebi, a warm and empathetic personal medical intake assistant..."
- **patient_intake (AR):** "أنت طبيبي، مساعد استقبال طبي شخصي ودود ومتعاطف..."
- **doctor_assist (EN):** "You are Tabeebi Clinical, a clinical decision support assistant..."
- **doctor_assist (AR):** "أنت طبيبي السريري، مساعد دعم القرار السريري..."
- **general (EN):** "You are Tabeebi, a helpful and professional personal medical assistant..."
- **general (AR):** "أنت طبيبي، مساعد طبي شخصي مفيد ومحترف..."
- Medical guardrail messages also updated to say "I'm Tabeebi" instead of "I'm Dr. AI"

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/components/ai/PatientAIChat.tsx` | Replace all "Dr. AI" / "الدكتور الذكي" references with "Tabeebi" / "طبيبي". Update welcome message text. |
| `src/components/ai/DoctorAIPanel.tsx` | Rename "Clinical AI Copilot" to "Tabeebi Clinical". Update empty state text. |
| `src/pages/app/ai/AIChatPage.tsx` | Update page title, breadcrumb label, and intro card text. |
| `supabase/functions/ai-assistant/index.ts` | Update all system prompt strings and guardrail messages to use Tabeebi identity. |

### No structural or logic changes -- purely text/branding updates.

