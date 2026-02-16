

## Add "Other" Option, Human Emotions, Smart Patient Detection, and Tabeebi Branding

### 1. Add "Other" Option to Multiple-Choice Buttons

**File: `src/components/ai/AIChatMessage.tsx`**
- After the A/B/C/D option buttons, add a final "Other" button styled slightly differently (dashed border or lighter tone)
- When clicked, it focuses the text input field so the user can type their own answer
- Pass a new callback `onOtherSelect` (or reuse `onOptionSelect` with a special value)

**File: `src/components/ai/PatientAIChat.tsx`**
- When "Other" is clicked, auto-focus the input textarea instead of sending a message
- This lets the patient type something that doesn't match any of the choices

### 2. Emotional, Human Doctor Tone in All Messages

**File: `supabase/functions/ai-assistant/index.ts`** -- Update all 3 language prompts:
- Add explicit emotional instruction to the CONSULTATION STYLE section:
  - "Respond like a caring family doctor who genuinely cares. Use warm phrases like 'I understand that must be uncomfortable', 'Don't worry, let's figure this out together', 'That's good that you noticed...' "
  - "Show empathy EVERY message, not just the assessment. Use reassuring language naturally."
  - "Never sound clinical or robotic. Imagine you're sitting across from the patient in your clinic."
- Add similar emotional instructions in Arabic and Urdu prompts

### 3. Stop Generic Paracetamol -- Condition-Specific Medications

**File: `supabase/functions/ai-assistant/index.ts`** -- Update all 3 language prompts:
- Add explicit medication rule:
  - "NEVER default to Paracetamol/Panadol for everything. Match medication to the specific condition:"
  - "For tension headache: Ibuprofen 400mg or Naproxen 250mg"
  - "For migraine: Sumatriptan 50mg or combination analgesic"
  - "For muscle pain: Diclofenac 50mg or Methocarbamol"
  - "For acid reflux: Omeprazole 20mg, not Paracetamol"
  - "For allergies: Cetirizine 10mg or Loratadine 10mg"
  - "Always explain WHY you chose that specific medication over alternatives"

### 4. Smart Patient Detection -- Self vs. Someone Else

**File: `supabase/functions/ai-assistant/index.ts`** -- Update all 3 language prompts:
- Add a "WHO IS THE PATIENT?" instruction block:
  - "If the user says 'I have...' or 'my head hurts' or 'mujhe...' -- they are asking about THEMSELVES. Use their profile data (name, gender) directly. Do NOT ask for gender or age again."
  - "If the user says 'my child has...' or 'my mother is...' or 'someone I know...' -- they are asking about SOMEONE ELSE. In this case, ask: age, gender, and (if relevant for dosage) approximate weight of that person before proceeding."
  - "Watch for cues like 'mere bachay ko' (my child), 'meri wife ko' (my wife), 'mera baap' (my father) etc."

### 5. Rebrand Assessment to "Tabeebi"

**File: `supabase/functions/ai-assistant/index.ts`** -- Update all 3 language prompts:
- English: Change `**Doctor's Assessment**` to `**Tabeebi's Assessment**`
- Arabic: Change `**تقييم الطبيب**` to `**تقييم طبيبي**`
- Urdu: Change `**ڈاکٹر کا جائزہ**` to `**طبیبی کا جائزہ**`
- Add a warm closing like "Wishing you a speedy recovery! -- Dr. Tabeebi" with a heart emoji

---

### Technical Summary

| File | Changes |
|------|---------|
| `src/components/ai/AIChatMessage.tsx` | Add "Other" button after option buttons with `onOtherSelect` callback |
| `src/components/ai/PatientAIChat.tsx` | Handle "Other" click to focus text input |
| `supabase/functions/ai-assistant/index.ts` | Update EN/AR/UR prompts: add emotional tone instructions, condition-specific medication rules, self-vs-other patient detection, rebrand to "Tabeebi's Assessment" |

No new dependencies. Edge function redeployment required.

