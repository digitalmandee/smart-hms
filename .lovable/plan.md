

# Transform Tabeebi into a Real Virtual Doctor Consultation

## Overview

This plan upgrades Tabeebi from a text chatbot into a realistic virtual doctor consultation experience across 7 areas: enhanced doctor persona, trilingual support (adding Urdu), voice consultation with ElevenLabs, an animated doctor avatar, emotional intelligence, and natural disclaimers.

---

## Phase 1: Enhanced Doctor Persona and Emotional Intelligence (Prompt Engineering)

**File: `supabase/functions/ai-assistant/index.ts`**

Rewrite all system prompts to create a deeply human doctor persona:

**patient_intake (EN) -- key additions:**
- Persona: "You are Dr. Tabeebi, a senior physician with 20+ years of experience. You are calm, patient, and genuinely caring."
- Emotional intelligence rules:
  - Detect anxiety keywords ("scared", "worried", "can't sleep", "am I dying") and respond with calm reassurance first before any questions
  - Never use fear-based language ("this could be dangerous", "you might have...")
  - Use reassuring phrases: "That's quite common", "I've seen many patients with similar concerns", "Let's figure this out together"
- After gathering information (5-6 exchanges), provide a structured explanation:
  - "Here's what I think might be going on..." (possible causes in plain language)
  - "What your symptoms suggest..." (what they indicate)
  - "When to be concerned..." (red flags, stated calmly)
  - "What I'd recommend..." (actionable next steps)
- Natural disclaimers woven into conversation: "If this pain becomes severe or continues for more than 24 hours, I would strongly recommend seeing a doctor in person."
- Never say "I'm an AI" or "as an AI" -- stay in doctor character

**patient_intake (AR):** Same rules, culturally adapted Gulf/Levantine Arabic

**patient_intake (UR) -- NEW Urdu prompt:**
- Same doctor persona adapted for Urdu-speaking patients
- Use respectful Urdu medical phrasing (e.g., "آپ کی طبیعت کیسی ہے؟", "مجھے بتائیں کیا تکلیف ہے")
- Warm, culturally appropriate tone

**general mode:** Same emotional intelligence and natural disclaimer rules applied

**Guardrail updates:**
- EN: Softer refusal: "I appreciate you asking, but my expertise is in health and medicine. How can I help with any health concerns you might have?"
- AR/UR: Culturally adapted soft refusals

---

## Phase 2: Urdu Language Support (Trilingual)

### Edge function (`ai-assistant/index.ts`)
- Add Urdu (`ur`) variants to all SYSTEM_PROMPTS (patient_intake, doctor_assist, general)
- Add MEDICAL_GUARDRAIL_UR
- Update language selection: `const lang = language === "ar" ? "ar" : language === "ur" ? "ur" : "en";`

### `src/hooks/useAIChat.ts`
- Update language type from `"en" | "ar"` to `"en" | "ar" | "ur"`

### `src/components/ai/PatientAIChat.tsx`
- Add Urdu to language state type
- Add Urdu suggested topics: `["سر میں درد ہے", "پیٹ میں درد", "بخار اور کپکپی", "اپنی حالت کی پیشرفت"]`
- Add Urdu welcome message
- Update language toggle to cycle through EN -> AR -> UR -> EN
- Add Urdu placeholder text and disclaimer

---

## Phase 3: Voice Consultation Mode (ElevenLabs TTS + STT)

This requires an **ELEVENLABS_API_KEY** secret to be added.

### New Edge Function: `supabase/functions/elevenlabs-tts/index.ts`
- Accept `{ text, voiceId }` and call ElevenLabs TTS API
- Use a warm, professional male doctor voice (e.g., "Daniel" voice ID `onwK4e9ZLuTAKqWW03F9`)
- Return raw audio binary (MP3)
- Streaming endpoint for lower latency

### New Edge Function: `supabase/functions/elevenlabs-scribe-token/index.ts`
- Generate single-use tokens for realtime speech-to-text
- Returns `{ token }` for client-side WebSocket connection

### `supabase/config.toml`
- Add entries for both new edge functions with `verify_jwt = false`

### New Hook: `src/hooks/useVoiceConsultation.ts`
- Manages voice mode state (idle, listening, processing, speaking)
- Uses `@elevenlabs/react` `useScribe` hook for realtime STT
- Fetches TTS audio from edge function and plays it
- Handles microphone permissions with friendly UX
- Exposes: `startListening()`, `stopListening()`, `speakResponse(text)`, `voiceState`, `transcript`

### `src/components/ai/PatientAIChat.tsx` -- Voice Mode Integration
- Add a microphone button next to the send button
- When voice mode is active:
  - Show voice visualization (pulsing indicator when listening, waveform when AI speaks)
  - Transcribed text appears in the chat as user messages
  - AI responses are both displayed as text AND spoken aloud
  - Toggle button to switch between text and voice modes

---

## Phase 4: Animated Doctor Avatar

Instead of a complex 3D avatar with lip-sync (which requires heavy libraries and GPU), we'll create a polished 2D animated doctor avatar using CSS animations and SVG:

### New Component: `src/components/ai/DoctorAvatar.tsx`
- Circular avatar area showing a professional doctor illustration (SVG-based)
- States driven by `voiceState`:
  - **Idle**: Subtle breathing animation (gentle scale pulse)
  - **Listening**: Attentive pose -- slight head tilt, "nodding" animation, green indicator
  - **Thinking**: Thoughtful expression, pulsing dots animation
  - **Speaking**: Mouth animation (CSS keyframes alternating between open/closed states synced to audio), gentle head movement
- Online status indicator (green dot)
- Smooth transitions between states

### Integration in `PatientAIChat.tsx`
- Show DoctorAvatar above the chat area when voice mode is active
- Avatar replaces the static stethoscope icon during voice consultations
- Collapses back to compact view in text-only mode

---

## Phase 5: UI Polish and Welcome Experience

### `src/components/ai/PatientAIChat.tsx`
- Refined welcome screen with the animated avatar
- Language selector shows all 3 languages as pills/chips instead of cycling
- Voice mode button prominently displayed in welcome state
- Smoother message animations using existing fade-in classes

### `src/components/ai/AIChatMessage.tsx`
- Add typing indicator that looks more natural (animated dots with varying delays)
- Slightly larger text for better readability
- Avatar shows doctor icon for assistant messages (matching the avatar component style)

---

## Technical Details

### Dependencies to Install
- `@elevenlabs/react` -- for realtime STT via useScribe hook

### Secrets Required
- `ELEVENLABS_API_KEY` -- needed for TTS and STT functionality

### Files Created
| File | Purpose |
|------|---------|
| `supabase/functions/elevenlabs-tts/index.ts` | Text-to-speech edge function |
| `supabase/functions/elevenlabs-scribe-token/index.ts` | STT token generation |
| `src/hooks/useVoiceConsultation.ts` | Voice mode state management |
| `src/components/ai/DoctorAvatar.tsx` | Animated doctor avatar component |

### Files Modified
| File | Changes |
|------|---------|
| `supabase/functions/ai-assistant/index.ts` | Enhanced prompts with emotional intelligence, natural disclaimers, Urdu support |
| `supabase/config.toml` | Add new edge function entries |
| `src/hooks/useAIChat.ts` | Add Urdu language type |
| `src/components/ai/PatientAIChat.tsx` | Urdu support, voice mode UI, avatar integration, language selector redesign |
| `src/components/ai/AIChatMessage.tsx` | Improved typing indicator and message styling |

### Implementation Order
1. Prompt engineering (phases 1 + 5/6 from requirements) -- immediate impact, no new dependencies
2. Urdu language support -- straightforward addition
3. Voice consultation (ElevenLabs) -- requires API key secret
4. Animated doctor avatar -- CSS/SVG animations
5. UI polish -- final refinements

