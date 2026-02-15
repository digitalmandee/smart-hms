

# Reduce Tabeebi Token Usage by ~50%

## Problem

Every API call sends the full system prompt (~800 tokens) plus the entire conversation history. After 6 exchanges, the cumulative input tokens are around 8,500-10,000. This can be cut roughly in half.

## Optimizations

### 1. Compress the System Prompt (save ~400 tokens per call)

**File: `supabase/functions/ai-assistant/index.ts`**

The current `patient_intake` system prompt is verbose with repeated examples and formatting templates. Rewrite it to be more concise while keeping the same behavior:

- Remove redundant phrasing (e.g., the assessment template has both instructions AND a full example -- keep just the template)
- Merge the medical guardrail into the main prompt instead of appending it as a separate block
- Use shorthand for the question flow (single line per step instead of multi-line)
- Target: ~400 tokens instead of ~800

### 2. Trim Conversation History (save ~30-40% on later messages)

**File: `supabase/functions/ai-assistant/index.ts`**

Instead of sending ALL messages to DeepSeek, implement a sliding window:

- Always send the system prompt + first user message (chief complaint context)
- Send only the last 4 message pairs (8 messages) of conversation history
- This caps the growing history and prevents ballooning costs on longer consultations
- For a typical 5-6 exchange consultation, this has no effect (all messages fit). But it prevents runaway costs if users chat longer.

### 3. Lower max_tokens for Question Phase

**File: `supabase/functions/ai-assistant/index.ts`**

During the question phase (messages count < 10), the AI only needs to ask 1-3 sentences. Set `max_tokens: 256` for early exchanges, and only increase to `1024` when the conversation is long enough for the assessment phase.

This prevents the model from generating unnecessarily long responses during Q&A.

### 4. Skip Sending the Initial Greeting Message

**File: `src/hooks/useAIChat.ts`**

The initial greeting ("Hello! I'm Tabeebi...") is a client-side hardcoded message. Currently it gets included in the `messages` array sent to the API. Filter it out before sending since the AI doesn't need to "see" its own greeting -- it already knows its persona from the system prompt.

---

## Expected Result

| Metric | Before | After |
|--------|--------|-------|
| System prompt tokens | ~800/call | ~400/call |
| Max tokens (Q&A phase) | 1024 | 256 |
| History sent (6 exchanges) | All 12 msgs | All 12 (capped at 8 pairs for longer chats) |
| Total tokens (6 exchanges) | ~10,000 | ~5,000-6,000 |

Roughly a 40-50% reduction for a typical consultation.

---

## Files Changed

| Action | File | Purpose |
|--------|------|---------|
| Modify | `supabase/functions/ai-assistant/index.ts` | Compressed prompt, sliding window, dynamic max_tokens |
| Modify | `src/hooks/useAIChat.ts` | Filter out hardcoded greeting before sending to API |

## Technical Details

### Compressed Prompt Strategy

The current prompt has three sections that can be condensed:
- "YOUR PERSONALITY" section: merge into a single line instruction
- "CONSULTATION FLOW": reduce from 12 lines to 6, remove examples
- "DOCTOR'S ASSESSMENT" template: keep the template, remove the prose explanation around it
- Merge MEDICAL_GUARDRAIL directly into the prompt text

### Dynamic max_tokens Logic

```
const messageCount = messages.length;
const maxTokens = messageCount >= 10 ? 1024 : 256;
```

This means the AI generates short focused questions early, and only produces the full assessment when enough exchanges have happened.

### Sliding Window Implementation

```
const recentMessages = messages.length > 8
  ? [messages[0], messages[1], ...messages.slice(-6)]
  : messages;
```

Keep the first exchange (chief complaint) plus the last 3 pairs for context.

