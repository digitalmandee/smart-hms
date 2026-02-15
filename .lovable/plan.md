

## Fix Orange Input Area, Language Dropdown, and Header Polish

### Changes from Previous Plan

- **Brand teal instead of grey**: The input area wrapper will use `bg-primary/10` (light teal tint) instead of grey/muted, and the chat background gradient will use `to-primary/5` -- keeping the brand identity consistent
- **Placeholder text**: Ensure all three language placeholders are clear and properly displayed

---

### 1. Fix Orange Colors -- Use Brand Teal

**PatientAIChat.tsx**:
- Change `bg-accent/30` (coral/orange) on the input wrapper to `bg-primary/10` (soft teal tint)
- Change `from-background to-accent/10` chat gradient to `from-background to-primary/5` (subtle teal gradient)
- This replaces the out-of-place orange with the brand teal, matching the medical theme

### 2. Fix Language Toggle to Show Current Language

**TabeebiChatPage.tsx**:
- Replace the cycling button with a dropdown menu showing all 3 language options
- Display the CURRENT language code (EN/AR/UR) on the trigger button so users know what is active
- Each dropdown item shows the language name in its own script with a checkmark for the active one

### 3. Polish Header Icons

**TabeebiChatPage.tsx header**:
- Add subtle hover backgrounds to action buttons
- Increase gap from `gap-1` to `gap-1.5` for better spacing

---

### Technical Details

| File | Changes |
|------|---------|
| `src/components/ai/PatientAIChat.tsx` | Replace `bg-accent/30` with `bg-primary/10`, replace `to-accent/10` with `to-primary/5` |
| `src/pages/public/TabeebiChatPage.tsx` | Language dropdown showing current selection, header icon spacing polish |

No new dependencies needed.

