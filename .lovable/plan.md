

# Fix Tabeebi Medicine Check - Speed + UI Polish

## Problems Identified

1. **Slow search**: Uses `deepseek-reasoner` model (meant for complex reasoning) for simple medicine lookups. This is overkill and causes long wait times.
2. **Raw JSON shown**: When salt mode is on, the result sometimes shows raw JSON text like `{ "salt": "Paracetamol...", "alternatives": ["Calpol"...` instead of parsed, styled results (parsing happens in render cycle which can miss).
3. **Bland results UI**: Plain text list with no visual punch - needs animated loading, card-style results, and better salt display.

## Solution

### 1. Add `pharmacy_lookup` mode to edge function (speed fix)

**File: `supabase/functions/ai-assistant/index.ts`**

- Add a new mode `pharmacy_lookup` that routes to `deepseek-chat` (fast model) instead of `deepseek-reasoner`
- Use temperature 0.2 for deterministic results
- Lower max_tokens to 512 (we only need a short JSON response)
- This alone should cut response time from 10-15s to 2-4s

### 2. Fix result parsing bug

**File: `src/components/pharmacy/POSMedicineAlternatives.tsx`**

The current parsing runs during render (lines 49-73) which is an anti-pattern - it can cause infinite loops or miss updates. Move parsing into a `useEffect` that triggers when `messages` changes and `isLoading` becomes false.

### 3. Redesign the loading + results UI

**File: `src/components/pharmacy/POSMedicineAlternatives.tsx`**

Loading state:
- Animated `DoctorAvatar` (size "sm", state "thinking") centered with a pulsing "Tabeebi is checking..." text
- Add 3 skeleton shimmer lines below for anticipation

Salt display (when salt mode is on):
- Dedicated card with a flask icon, salt name in bold, strength highlighted in a teal badge
- Clear visual separation from the alternatives list

Results list:
- Each alternative in a mini-card with teal-gradient numbered circle, hover lift effect
- Staggered fade-in animation using CSS `animation-delay` on each item
- Subtle border and rounded corners per item

Empty state:
- DoctorAvatar (xs) + "Type a medicine name to find alternatives" with a subtle pill icon

### 4. Update useAIChat mode type

**File: `src/hooks/useAIChat.ts`**

- Add `pharmacy_lookup` to the mode union type

## Technical Summary

| File | Change |
|------|--------|
| `supabase/functions/ai-assistant/index.ts` | Add `pharmacy_lookup` mode routing to `deepseek-chat` with temp 0.2, max 512 tokens |
| `src/hooks/useAIChat.ts` | Add `pharmacy_lookup` to mode type |
| `src/components/pharmacy/POSMedicineAlternatives.tsx` | Switch to `pharmacy_lookup` mode, fix parsing with useEffect, redesign loading/results UI with animations |

