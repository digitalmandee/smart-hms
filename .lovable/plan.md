

# Fix Language-Reactive Greeting + Merge Tabeebi into Main HMS Landing Page

## Two Issues to Fix

### Issue 1: Greeting Doesn't Change with Language

Currently, when a user switches language (EN/AR/UR), the greeting message stays in the original language. This happens because `useAIChat` sets the initial greeting once via `useState` and never updates it when the language prop changes.

**Fix in `PatientAIChat.tsx`:**
- Add a `useEffect` that watches the `language` state
- When language changes and the chat only has the greeting message (no real conversation yet), reset the messages array with the new language's greeting via `clearChat`
- Update `useAIChat` hook: make `clearChat` accept an optional new greeting parameter, or handle it by re-calling with the new greeting

**Fix in `useAIChat.ts`:**
- Track `initialGreeting` changes -- when it changes and messages only contain the greeting, swap it out

---

### Issue 2: Merge Tabeebi into Main HMS Landing Page

The main landing page (`/`) needs to prominently showcase how Tabeebi AI powers the entire HMS -- not just as a standalone chatbot, but as an integrated AI layer helping both doctors and patients.

**Revamp `AIFeaturesSection.tsx` to show two perspectives:**

**For Patients:**
- Voice consultations in 3 languages
- 24/7 symptom checking before visiting clinic
- No waiting rooms -- talk to a doctor instantly

**For Doctors:**
- Auto-generated clinical summaries after each consultation
- AI-assisted patient intake (pre-screens patients before they see the doctor)
- Smart diagnostic suggestions during OPD

**For Hospital Admin:**
- Reduced doctor workload = more patients per day
- Automated documentation saves hours
- Differentiate from competitors with AI-powered care

**Update `HeroSection.tsx`:**
- Keep the "Introducing Tabeebi" badge but make it link to `/tabeebi`
- Add a secondary mention: "Now with Custom AI Doctor" in the subtitle area

**Add a new "AI Across Your HMS" section or expand the existing one:**
- Show a visual flow: Patient talks to Tabeebi -> AI pre-screens -> Doctor gets summary -> Prescription auto-generated
- Three column cards: "For Patients", "For Doctors", "For Admins"

---

## Files Changed

| File | Changes |
|------|---------|
| `src/hooks/useAIChat.ts` | React to `initialGreeting` changes -- reset greeting when language switches |
| `src/components/ai/PatientAIChat.tsx` | Add effect to reset chat greeting on language change |
| `src/components/landing/AIFeaturesSection.tsx` | Complete revamp: 3-perspective layout (Patient/Doctor/Admin), workflow visual, stronger CTA |
| `src/components/landing/HeroSection.tsx` | Strengthen the Tabeebi mention in hero, add "AI-Powered" to subtitle |

## Technical Details

### Greeting Language Fix

In `useAIChat.ts`, add a `useEffect` watching `initialGreeting`:

```
useEffect(() => {
  if (initialGreeting && messages.length <= 1 && !conversationId) {
    setMessages([{ role: "assistant", content: initialGreeting }]);
  }
}, [initialGreeting]);
```

This only swaps the greeting if no real conversation has started yet (messages.length <= 1 and no active conversation).

### AIFeaturesSection Revamp Structure

```
Section Header: "Custom AI Integrated Across Your HMS"

Row 1: Three cards
  - For Patients: Voice consultations, 24/7 access, trilingual
  - For Doctors: Auto summaries, smart intake, diagnostic assist  
  - For Admins: More throughput, less paperwork, competitive edge

Row 2: Workflow strip
  Patient -> Tabeebi Pre-Screen -> Doctor Dashboard -> AI Summary -> Prescription
  (visual flow with icons and arrows)

Row 3: CTA
  "Try Tabeebi Now" button -> /tabeebi
  "See Full Demo" button -> /auth/login
```

### HeroSection Updates

- Change the badge text from "Introducing Tabeebi -- AI Virtual Doctor" to "Custom AI Doctor Built-In"
- Add a line in the description: "With Tabeebi, our custom-trained AI doctor, patients get instant consultations while doctors get AI-generated clinical summaries."

