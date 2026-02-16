

## Make AI Multiple-Choice Options Clickable Buttons

### What Changes

When the AI responds with multiple-choice options (lines like `A) ...`, `B) ...`, `C) ...`), instead of rendering them as plain text inside the message bubble, they will be extracted and displayed as tappable pill-shaped buttons below the message text. Clicking a button automatically sends that choice as the user's reply.

### How It Works

1. **Parse options from AI response** -- After the message content is rendered, detect lines matching the pattern `A) ...`, `B) ...`, `C) ...`, `D) ...` (letter followed by closing parenthesis)
2. **Split the message** -- Separate the "question text" (everything before the options) from the "options" (the A/B/C/D lines)
3. **Render options as buttons** -- Show the question text normally in the bubble, then render each option as a rounded, outlined button below it
4. **On click, send as message** -- When the user taps an option, it sends the full option text (e.g., "A) Dull, constant pressure or ache") as their reply

### Visual Design

- Options appear as rounded pill buttons with `border-primary/30` and `hover:bg-primary/10`
- Stacked vertically inside the message bubble area, below the question text
- Only the LAST assistant message shows interactive buttons (previous ones show options as static text)
- Buttons are disabled while the AI is loading/streaming

---

### Technical Details

| File | Changes |
|------|---------|
| `src/components/ai/AIChatMessage.tsx` | Add option parsing logic: extract lines matching `/^[A-D]\) .+/` from content, split into `questionText` and `options` array. Render options as clickable buttons. Add new `onOptionSelect` callback prop and `isLatest` prop. |
| `src/components/ai/PatientAIChat.tsx` | Pass `onOptionSelect={handleSend}` and `isLatest={i === lastAssistantIndex}` to `AIChatMessage` for assistant messages. |

### Option Parsing Logic

```
Input content:
"Thanks, Sannan. That helps.\nHow would you describe the pain?\nA) Dull, constant pressure\nB) Sharp or stabbing\nC) Throbbing sensation"

Parsed:
- questionText: "Thanks, Sannan. That helps.\nHow would you describe the pain?"
- options: ["A) Dull, constant pressure", "B) Sharp or stabbing", "C) Throbbing sensation"]
```

No new dependencies needed. No edge function changes.

