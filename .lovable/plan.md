

## Tabeebi Chat: Markdown Fix, Sidebar Toggle, Header Polish, and Typing Animation

### Issues to Fix

1. **Broken markdown rendering** -- The `formatMarkdown()` function fails on patterns like `**Most Likely Outcome**:` (renders as `Most Likely Outcome**:` with stray asterisks), numbered lists with `:` after bold text get split across lines showing "ri" fragments, and `Home Remedies &:` appears garbled
2. **No sidebar collapse/toggle** -- Desktop sidebar has no way to collapse it
3. **Header too plain** -- Icons are generic, "AI Medical Assistant" text still feels basic, no visual distinction
4. **No typing/thinking animation in chat** -- When the bot is processing (before streaming starts), there is no visible "thinking" bubble in the message list
5. **Max tokens too low for assessments** -- `max_tokens: 512` for intake with < 8 messages causes truncation on detailed assessments (the "Home Remedies &: ri" issue is truncation mid-word)

---

### 1. Fix Markdown Rendering (Root Cause of Garbled Text)

**AIChatMessage.tsx** -- Rewrite `formatMarkdown()`:
- The current regex `\*\*(.+?)\*\*/g` is non-greedy but fails when `**` appears next to `:` or on multi-line content
- Fix: process line-by-line instead of whole-text regex to properly handle numbered lists (`1.`, `2.`), bold text with colons, and nested formatting
- Add proper handling for numbered lists: wrap consecutive `<li>` from `\d+\.` in `<ol>` tags (currently no `<ol>` wrapper)
- Handle edge case: `**Home Remedies &**:` where the colon is outside the bold markers
- Add `ol` to DOMPurify ALLOWED_TAGS

### 2. Fix Truncation (max_tokens too low)

**supabase/functions/ai-assistant/index.ts**:
- Change `maxTokens` for `patient_intake` from `512` (when < 8 messages) to `768`, and from `1024` to `1536` for assessments (>= 8 messages)
- This prevents the AI response from being cut off mid-sentence ("Home Remedies &:\nri" is a truncated "Home Remedies & Lifestyle Tips:\n1. ...")

### 3. Add Sidebar Collapse Toggle

**TabeebiChatPage.tsx**:
- Add a `sidebarCollapsed` state (default: false)
- When collapsed, sidebar shrinks to 60px showing only icons (new chat, history icon list, settings)
- Add a toggle button (ChevronLeft/ChevronRight or PanelLeftClose/PanelLeftOpen icon) at the top of the sidebar
- Smooth width transition with `transition-all duration-300`

### 4. Better Header

**TabeebiChatPage.tsx header**:
- Remove the "Online" label duplication (green dot is enough)
- On mobile, make icons slightly larger (h-4.5 w-4.5) with better spacing
- Add a subtle bottom shadow instead of just border for depth
- Replace generic Globe/Plus/Clock icons with more distinct styling (filled vs outline based on state)

### 5. Thinking Bubble in Chat

**PatientAIChat.tsx**:
- When `isLoading` is true and the last message is from the user (AI hasn't started streaming yet), render a temporary "thinking" `AIChatMessage` with `role="assistant"`, empty content, and `isStreaming={true}`
- This shows the breathing dots animation in the chat while the AI processes

---

### Technical Details

| File | Changes |
|------|---------|
| `src/components/ai/AIChatMessage.tsx` | Rewrite `formatMarkdown()` to handle bold-with-colon, numbered lists with `<ol>`, line-by-line processing; add `ol` to DOMPurify tags |
| `src/pages/public/TabeebiChatPage.tsx` | Add sidebar collapse toggle with icon-only mode, improve header shadow/spacing |
| `src/components/ai/PatientAIChat.tsx` | Add thinking bubble when `isLoading` and last message is user |
| `supabase/functions/ai-assistant/index.ts` | Increase max_tokens: 512 to 768 (early), 1024 to 1536 (assessment) |

No new dependencies needed.

