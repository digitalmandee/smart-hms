

# Make Tabeebi Feel Like a Real Doctor -- Final Polish

## Issues Identified from Screenshot

The screenshot shows the current state still has problems:
1. Greeting is too long and instructional ("Tell me what's bothering you... just like a real consultation" -- a real doctor wouldn't say that)
2. The big "Consultation Start Card" with centered avatar feels like an AI onboarding screen, not a doctor's office
3. No way to access past consultation history from the chat page
4. Urdu language is missing (only EN/AR available, but app claims trilingual)
5. The "General Physician" subtitle under the avatar card is unnecessary ceremony

## Changes

### 1. Shorter, Natural Greeting (PatientAIChat.tsx)

Replace the current wordy greeting with something a real doctor would say:

- EN: "Hello! I'm Dr. Tabeebi. What brings you in today?"
- AR: "أهلاً! أنا د. طبيبي. شو بتحس فيه اليوم؟"
- UR (new): "السلام علیکم! میں ڈاکٹر طبیبی ہوں۔ آج کیا تکلیف ہے؟"

No mention of "type or tap mic", no "just like a real consultation" -- just a simple doctor greeting.

### 2. Remove the Consultation Start Card (AIChatMessage.tsx)

The first message currently renders as a big centered card with avatar + "Dr. Tabeebi / General Physician" label. Replace it with a simple chat bubble just like any other assistant message. The doctor header is already in the top bar -- no need to repeat it.

### 3. Add Urdu Language Support

**PatientAIChat.tsx**: Add "ur" as a third language option. Update the language toggle to cycle EN -> عربي -> اردو.

**useAIChat.ts**: Extend the language type to include "ur".

**supabase/functions/ai-assistant/index.ts**: Add Urdu system prompt for `patient_intake`, `doctor_assist`, and `general` modes. Map "ur" language to the Urdu prompt.

### 4. Add Chat History Button (TabeebiChatPage.tsx)

Add a small "History" icon button (ClockIcon) in the top bar next to the logout button. Tapping it opens a bottom sheet / slide-up panel showing past AI conversations from the `ai_conversations` table, with date and a preview snippet. Tapping one loads that conversation into the chat.

### 5. Simplify the Chat Header Subtitle (PatientAIChat.tsx)

Remove emoji from status text. Use cleaner status:
- "Available" instead of "🟢 Available now"
- "Listening..." instead of "🎙️ Listening..."
- "Thinking..." instead of "💭 Thinking..."

## Technical Details

### Urdu System Prompt (ai-assistant/index.ts)

Add `ur` key to each prompt in `SYSTEM_PROMPTS`:

```
patient_intake.ur: Same clinical flow as EN/AR but in Urdu script. 
"آپ ڈاکٹر طبیبی ہیں، ایک تجربہ کار فیملی ڈاکٹر..."
```

Update language resolution: `const lang = language === "ar" ? "ar" : language === "ur" ? "ur" : "en";`

### Chat History (TabeebiChatPage.tsx + new component)

- New component: `src/components/ai/ChatHistoryDrawer.tsx`
- Queries `ai_conversations` table filtered by current user
- Shows as a Vaul drawer (mobile-friendly bottom sheet)
- Each item shows: date, first user message snippet
- On select: loads messages into chat via a new `loadConversation` method on `useAIChat`

### useAIChat Changes

- Add `language: "en" | "ar" | "ur"` type
- Add `loadConversation(id, messages)` method to restore a past conversation
- Keep existing greeting filter logic

### Language Toggle (PatientAIChat.tsx)

Current: button toggles between EN and Arabic
New: cycle through 3 languages: EN -> AR -> UR -> EN
Display: "عربي" / "اردو" / "EN" based on current

### Suggested Topics in Urdu

```
ur: [
  "🤕 مجھے سر درد ہے",
  "🤢 پیٹ میں درد",
  "🤒 بخار اور سردی",
  "📋 فالو اپ وزٹ",
]
```

### Files Changed

| File | Changes |
|------|---------|
| `supabase/functions/ai-assistant/index.ts` | Add Urdu prompts, update lang resolution |
| `src/hooks/useAIChat.ts` | Add "ur" to language type, add `loadConversation` method |
| `src/components/ai/PatientAIChat.tsx` | Shorter greetings, Urdu support, 3-way language toggle, remove emoji from status |
| `src/components/ai/AIChatMessage.tsx` | Remove Consultation Start Card, render first message as normal bubble |
| `src/pages/public/TabeebiChatPage.tsx` | Add history button + drawer |
| `src/components/ai/ChatHistoryDrawer.tsx` | New -- bottom sheet with past consultations |

