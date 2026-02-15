

## Improve Tabeebi AI: Smarter, More Human-like Medical Consultations

### Problems

1. **Repetitive generic questions** -- The AI asks the same checklist (location, duration, severity 1-10, aggravating factors, medical history, medications, allergies) for every patient regardless of symptoms. Real doctors adapt based on the complaint.

2. **No patient profile awareness** -- The user's name, gender, and any known info from their auth profile is never sent to the AI, so it asks redundant questions like gender.

3. **Too many questions before conclusion** -- The current prompt says "after 5-6 exchanges" but the max_tokens is only 256 during intake, which forces short one-question responses indefinitely. The AI has no way to know how many exchanges have occurred.

4. **Lacks medical reasoning depth** -- Responses feel formulaic ("On a scale of 1-10...") rather than clinically thoughtful. Real doctors ask contextual follow-ups based on the specific complaint.

---

### Plan

#### Step 1: Rewrite the system prompt to be clinically intelligent

**File: `supabase/functions/ai-assistant/index.ts`**

Replace the rigid checklist-based prompt with a clinical reasoning prompt that:

- Instructs the AI to adapt questions based on the specific complaint (not a fixed checklist)
- Tells the AI the patient's name and gender upfront so it never asks those
- Includes a message count in the system context so the AI knows when to wrap up (after 4-5 user messages, provide assessment)
- Encourages symptom-specific follow-ups (e.g., for stomach pain: "Have you eaten anything unusual?" not "On a scale of 1-10...")
- Removes the rigid "flow" checklist and replaces with clinical reasoning guidelines
- Keeps the assessment format but triggers it earlier

#### Step 2: Pass user profile data to the AI

**File: `src/hooks/useAIChat.ts`**

- Include the user's display name and gender (from auth metadata) in the `patient_context` sent to the edge function

**File: `src/components/ai/PatientAIChat.tsx`**

- Pull the user's name from auth session metadata and pass it as `patientContext`

#### Step 3: Inject message count and profile into system context

**File: `supabase/functions/ai-assistant/index.ts`**

- Add `message_count` to the system context so the AI knows how deep into the conversation it is
- Inject patient name/gender into the system message so the AI never asks for them
- Increase `max_tokens` for patient_intake from 256 to 512 (early exchanges) and keep 1024 for assessment phase

#### Step 4: Update Arabic and Urdu prompts similarly

**File: `supabase/functions/ai-assistant/index.ts`**

- Mirror the English prompt improvements in the Arabic and Urdu system prompts

---

### Technical Details

**New system prompt approach (English):**

```
You are Dr. Tabeebi, a warm senior family physician (20yr experience).
You ONLY answer medical/health questions.

PATIENT INFO (do NOT ask for these):
- Name: {name}
- Gender: {gender}

CONSULTATION STYLE:
- Ask ONE focused question per turn. Be warm and empathetic.
- Think like a real doctor: your follow-up questions should be specific
  to the complaint, not a generic checklist.
- For stomach pain: ask about food, bowel changes, nausea — not "rate 1-10"
  unless pain severity is clinically relevant.
- For fever: ask about duration, associated symptoms (cough, body aches,
  rash), travel history, sick contacts.
- NEVER repeat information the patient already provided.
- NEVER ask gender or name.

TIMING:
- Current exchange count: {count}
- After the patient has answered 4-5 questions, provide your Doctor's Assessment.
- Do NOT keep asking indefinitely. Conclude with actionable advice.

ASSESSMENT FORMAT:
**Doctor's Assessment**
**Most Likely**: [condition] — [plain explanation]
**What I Recommend**:
- **Medication**: [specific OTC with exact dose]
- **Home Remedies**: [specific actions]
**Red Flags — See a Doctor If**: [2-3 dangerous symptoms]
**Next Steps**: [when/which specialist]
```

**Max tokens adjustment:**
- Exchange count < 8: 512 tokens (enough for thoughtful questions)
- Exchange count >= 8: 1024 tokens (enough for full assessment)

**Patient context injection (useAIChat.ts):**
```typescript
// Get user metadata from auth session
const userName = user.user_metadata?.full_name || "";
const userGender = user.user_metadata?.gender || "";
```

**Edge function context building:**
```typescript
contextMessage += `\nPatient Name: ${patient_context?.name || "Unknown"}`;
contextMessage += `\nPatient Gender: ${patient_context?.gender || "Not specified"}`;
contextMessage += `\nExchange Count: ${messages.length}`;
```

