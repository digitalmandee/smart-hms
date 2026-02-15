

# Tabeebi Overhaul + Consultation History Mobile Fix

This plan addresses two things: (1) the approved Tabeebi improvements (human-like AI, realistic avatar, speaking UI, voice overlay) and (2) making the consultation history page more mobile-app-friendly.

---

## Part 1: Deep Medical AI Prompt Rewrite

**File: `supabase/functions/ai-assistant/index.ts`**

The current `patient_intake` prompt produces a dry "Pre-Visit Summary" after questions. The rewrite will make Tabeebi behave like a senior family physician who:

- Skips questions the patient already answered (no repetition)
- After 5-6 exchanges, provides a **Doctor's Assessment** instead of just a summary:
  - Most likely condition(s) with empathetic explanation
  - Specific OTC medications with dosages (e.g., "Paracetamol 500mg every 6 hours")
  - Home remedies and lifestyle advice
  - Red flags requiring ER/urgent care
  - When to see a doctor in person and what type of specialist
  - Warm, caring closing
- Uses natural human phrases ("I understand that must be uncomfortable", "Based on what you've told me...")
- Keeps the medical guardrails and disclaimers

---

## Part 2: Realistic Doctor Avatar

**File: `src/components/ai/DoctorAvatar.tsx`**

Replace the current abstract cartoon SVG with a more detailed, photorealistic-style illustrated doctor:

- Realistic face with skin tone, gentle expression, glasses, detailed white coat
- Proper size system:
  - `xs` (32px) -- for chat bubble inline avatars (face only, no rings/waves)
  - `sm` (48px) -- for chat header
  - `md` (80px) -- for consultation start card
  - `lg` (120px) -- for landing/loading screens
- Expressive states: blinking eyes (idle), widened eyes (listening), mouth animation (speaking), pulsing glow (thinking)
- Remove the oversized ring/pulse decorations at small sizes

---

## Part 3: Voice Overlay UI

**File: `src/components/ai/PatientAIChat.tsx`**

Integrate VoiceOrb as a floating overlay when voice mode is active:

- When user taps mic: semi-transparent overlay slides up with VoiceOrb centered
- Shows real-time transcript below the orb
- "Listening..." / "Speaking..." label
- Tap orb or background to dismiss
- When AI responds in voice mode: overlay shows speaking waveform
- Remove the Card wrapper for edge-to-edge mobile layout
- Add subtle gradient background to chat area

---

## Part 4: Warmer Chat Message UI

**File: `src/components/ai/AIChatMessage.tsx`**

- First assistant message renders as a "Consultation Start Card" with larger avatar, "Dr. Tabeebi - General Physician" label
- Assistant bubbles use warmer teal-tinted background instead of plain gray
- Timestamps on messages ("just now", "2 min ago")
- Subtle slide-up entrance animations
- Use `xs` size DoctorAvatar in regular assistant bubbles (32px, no rings)

---

## Part 5: Chat Page Cleanup

**File: `src/pages/public/TabeebiChatPage.tsx`**

- Remove the redundant header (let PatientAIChat handle the full doctor header)
- Make the page truly edge-to-edge on mobile
- Full `100dvh` layout with no wasted space

---

## Part 6: Consultation History Mobile Enhancement

**File: `src/components/mobile/MobileConsultationHistory.tsx`**

The component already exists and works, but needs polish to feel more like a native mobile app:

- Add a sticky search bar at the top that stays visible while scrolling
- Use larger, more visually distinct consultation cards with colored left border (green for diagnosed, gray for pending)
- Add swipe-to-view gesture hint (subtle arrow animation)
- Increase card padding and spacing for better touch targets
- Show relative dates ("Today", "Yesterday", "3 days ago") alongside absolute dates
- Add a floating "scroll to top" button when scrolled down
- Improve the empty state with a more engaging illustration
- Add section headers by date group ("Today", "This Week", "Earlier")

**File: `src/pages/app/opd/ConsultationHistoryPage.tsx`**

- Ensure mobile detection triggers correctly for PWA mode
- Pass any missing props to the mobile component

---

## Technical Details

### System Prompt Structure (ai-assistant/index.ts)

Phase 1 (Questions): Natural conversational flow, but the prompt explicitly instructs: "If the patient has already mentioned a symptom detail, do NOT ask about it again. Adapt your next question based on what they said."

Phase 2 (Doctor's Assessment): After 5-6 exchanges, output format changes from "Pre-Visit Summary" to:

```
**Doctor's Assessment**

Based on what you've described, [empathetic acknowledgment].

**Most Likely**: [condition] - [brief plain-language explanation]

**What I Recommend**:
- [OTC medication with dose, e.g., "Paracetamol 500mg every 6 hours for pain"]
- [Home remedy, e.g., "Apply a cold compress for 15 minutes"]
- [Lifestyle advice]

**Watch For These Red Flags**:
- [symptom that needs ER]
- [symptom that needs urgent care]

**Next Steps**: [when to see doctor, what specialist]

Take care, and don't hesitate to come back if anything changes.

_Disclaimer: This is AI-generated guidance. Always consult a healthcare professional for definitive diagnosis and treatment._
```

### DoctorAvatar Size Map

| Size | Pixels | Use Case | Decorations |
|------|--------|----------|-------------|
| xs | 32px | Chat bubbles | None (face only) |
| sm | 48px | Chat header | Status dot only |
| md | 80px | Consultation card | Subtle ring |
| lg | 120px | Landing/loading | Full rings + pulse |

### Voice Overlay Flow

1. User taps mic -> overlay slides up (dark semi-transparent bg)
2. VoiceOrb centered with "Listening..." label
3. Live transcript appears below orb
4. On final transcript -> overlay dismisses, message sends
5. When AI responds + voice active -> overlay reappears with "Speaking..." state
6. Tap anywhere or stop button to dismiss

### Consultation History Mobile Improvements

- Date grouping using `date-fns` `isToday`, `isYesterday`, `isThisWeek`
- Colored left border: `border-l-4 border-l-green-500` for consultations with diagnosis, `border-l-gray-300` for pending
- Sticky search: `sticky top-0 z-10 bg-background/95 backdrop-blur-sm`
- Section headers: small gray labels between card groups

### Files Changed Summary

| Action | File | Purpose |
|--------|------|---------|
| Modify | `supabase/functions/ai-assistant/index.ts` | Human-like doctor prompts with real medical guidance |
| Modify | `src/components/ai/DoctorAvatar.tsx` | Realistic avatar with xs/sm/md/lg sizes |
| Modify | `src/components/ai/AIChatMessage.tsx` | Consultation card, warmer bubbles, timestamps |
| Modify | `src/components/ai/PatientAIChat.tsx` | Voice overlay, edge-to-edge layout, gradient bg |
| Modify | `src/pages/public/TabeebiChatPage.tsx` | Remove redundant header, full-screen chat |
| Modify | `src/components/mobile/MobileConsultationHistory.tsx` | Date groups, colored borders, sticky search, native feel |

### Implementation Order

1. Rewrite system prompts in edge function (most impactful)
2. Redesign DoctorAvatar with realistic look + proper size variants
3. Update AIChatMessage with consultation card + warmer styling
4. Update PatientAIChat with voice overlay + mobile layout
5. Clean up TabeebiChatPage
6. Enhance MobileConsultationHistory
7. Deploy edge function and test end-to-end

