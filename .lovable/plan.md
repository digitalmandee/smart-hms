

# Make Tabeebi a Conversational Doctor

## Problem

Currently, Tabeebi gives long explanations immediately after a patient says something like "I have a headache." A real doctor would ask follow-up questions first -- "Where exactly?", "How long?", "Any other symptoms?" -- before giving any assessment.

## Solution

Rewrite the system prompts to enforce a strict **conversational, question-driven flow** where Tabeebi behaves like a real doctor in a clinic consultation. It must ask short, focused questions one at a time, never jump to conclusions, and only summarize after collecting enough information.

---

## Changes

### 1. Edge Function: `supabase/functions/ai-assistant/index.ts`

Rewrite the `patient_intake` system prompts (EN + AR) with strict conversational rules:

**English prompt -- new behavior:**
- Respond in 1-3 short sentences maximum per message
- Ask only ONE question at a time
- Follow a natural doctor flow: greet, ask what's wrong, then dig deeper (location, duration, severity, triggers, associated symptoms, history, medications, allergies)
- Use warm, human language ("I see", "That helps me understand", "Let me ask you...")
- Never list bullet points of possible conditions
- Never give medical advice until enough info is gathered (minimum 4-5 exchanges)
- Only after thorough questioning, offer a structured Pre-Visit Summary
- Use casual but professional tone -- like chatting with your family doctor

**Arabic prompt** -- same rules, culturally adapted Arabic phrasing.

Also update the `general` mode prompts to be conversational (short replies, ask clarifying questions before explaining).

### 2. Lower `max_tokens` for patient mode

Reduce `max_tokens` from 2048 to **512** for `patient_intake` mode. This naturally forces shorter, more conversational replies instead of long essays.

### 3. Increase `temperature` slightly

Change temperature for `patient_intake` from 0.7 to **0.8** for more natural, human-like conversational variety.

### 4. Update welcome message in `PatientAIChat.tsx`

Update the welcome text to set expectations:
- EN: "Hi! I'm Tabeebi. Tell me what's bothering you and I'll ask you a few questions -- just like visiting your doctor."
- AR: "أهلاً! أنا طبيبي. أخبرني شو عندك وبسألك كم سؤال -- مثل ما تزور طبيبك بالضبط."

---

## Technical Details

| File | Change |
|------|--------|
| `supabase/functions/ai-assistant/index.ts` | Rewrite `patient_intake` EN/AR prompts with strict conversational rules. Update `general` prompts similarly. Reduce `max_tokens` to 512 and increase `temperature` to 0.8 for patient_intake mode. |
| `src/components/ai/PatientAIChat.tsx` | Update welcome message text (EN + AR) to set conversational expectations. |

### No structural or logic changes -- only prompt engineering and two parameter tweaks.

