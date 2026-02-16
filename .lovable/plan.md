

## Fix Tabeebi Context Loss, Add Multiple-Choice, and Improve Responses

### Root Causes

1. **Sliding window too aggressive**: `trimMessages()` at line 248 keeps only `messages[0]`, `messages[1]`, and the last 6 messages. Once a conversation exceeds 8 messages, the middle is dropped -- the AI literally loses what was discussed.
2. **No primary symptom anchor**: The system prompt has no reminder of the patient's initial complaint. When context is trimmed, the AI has no way to stay on track.
3. **Exchange count wrong**: `messageCount = messages.length` counts ALL messages (user + assistant), so after 4 total messages (2 user + 2 assistant), the AI already thinks 4 exchanges happened and rushes to conclude.

---

### Changes

#### 1. Fix Sliding Window to Preserve Chief Complaint Context (edge function)

**supabase/functions/ai-assistant/index.ts** -- Rewrite `trimMessages()`:
- Always keep the first USER message (the chief complaint) regardless of window size
- Expand window from last 6 to last 8 messages to retain more recent context
- Add a summarization line: inject a brief system message summarizing what was discussed in trimmed messages

```
Before: [msg0, msg1, ...last 6] (loses middle)
After:  [first_user_msg, context_summary, ...last 8]
```

#### 2. Extract and Inject Primary Symptom into System Prompt (edge function)

**supabase/functions/ai-assistant/index.ts**:
- Before building the system prompt, find the first user message and extract it
- Add to ALL three language prompts:
  - EN: `"PRIMARY COMPLAINT: The patient initially said: '[first message]'. All follow-up details are about THIS complaint -- do NOT reinterpret location/timing as a new condition."`
  - AR/UR: equivalent translations
- This prevents "headache" + "on the back" from becoming "back pain"

#### 3. Fix Exchange Count to User-Only Messages (edge function)

**supabase/functions/ai-assistant/index.ts** line 304:
- Change `const messageCount = messages.length` to `const messageCount = messages.filter(m => m.role === "user").length`
- This means 4-5 actual patient replies trigger the assessment, not 4-5 total messages

#### 4. Add Multiple-Choice Instruction to Prompts (edge function)

**Update all three language prompts in `buildPatientIntakePrompt()`**:
- Add instruction block for structured questions:
  - "For severity, duration, or symptom type -- offer 2-4 labeled choices instead of open-ended questions"
  - Example: "How would you describe it? A) Sharp/stabbing B) Dull/aching C) Throbbing D) Burning"
- This speeds up consultations and reduces misinterpretation

#### 5. Improve Assessment Quality (edge function)

**Update assessment format in all three language prompts**:
- Add "Keep assessment under 300 words"
- Require exact medication dosages: "drug name, strength, dose, frequency, duration, food timing"
- Require treatment tiers: immediate relief, short-term plan, escalation triggers
- Add: "Your advice must be SPECIFIC to the discussed symptoms"

#### 6. Lower Temperature for Focused Responses (edge function)

**Line 370**: Change `patient_intake` temperature from `0.7` to `0.5`

---

### Technical Details

| File | Changes |
|------|---------|
| `supabase/functions/ai-assistant/index.ts` | Rewrite `trimMessages()` to preserve chief complaint + expand window; extract primary symptom and inject into system prompt; fix `messageCount` to count user messages only; add multiple-choice instructions to EN/AR/UR prompts; update assessment format for conciseness and dosage specifics; reduce temperature to 0.5 |

Single file change. No new dependencies. Edge function redeployment required.

### Example: How Context is Preserved

```text
Patient message 1: "I have a bad headache"
Patient message 2: "It's on the back of my head"
Patient message 3: "Started 2 days ago"
Patient message 4: "Yes, my neck is stiff too"

BEFORE (current):
- If conversation grows, messages 1-2 get trimmed
- AI sees only "neck is stiff" and loses "headache" context
- AI pivots to "neck pain" diagnosis

AFTER (fixed):
- System prompt includes: "PRIMARY COMPLAINT: 'I have a bad headache'"
- First user message always kept in window
- AI correctly diagnoses: tension headache with cervical involvement
```

