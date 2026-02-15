

# Voice Consultation: Speechify TTS + Web Speech API STT

## Overview

Add voice consultation mode to Tabeebi using **Speechify API** for text-to-speech (high-quality, $10/1M chars) and the **browser-native Web Speech API** for speech-to-text (free, no API key). This avoids ElevenLabs dependency entirely.

---

## What You'll Need

- A **Speechify API key** from [speechify.com](https://speechify.com). You'll be prompted to add it securely as a secret (`SPEECHIFY_API_KEY`).

---

## Implementation

### 1. New Edge Function: `speechify-tts`

**File: `supabase/functions/speechify-tts/index.ts`**

- Accepts `{ text, language }` via POST
- Calls Speechify TTS API with appropriate voice per language:
  - EN: a warm male professional voice
  - AR: Arabic voice
  - UR: falls back to EN voice (Speechify has limited Urdu; can revisit)
- Returns raw audio binary (MP3)
- Uses `SPEECHIFY_API_KEY` secret

**File: `supabase/config.toml`** -- add entry for `speechify-tts` with `verify_jwt = false`

### 2. New Hook: `src/hooks/useVoiceConsultation.ts`

Manages the full voice mode lifecycle:

- **State machine**: `idle` | `listening` | `processing` | `speaking`
- **STT (Speech-to-Text)**: Uses `window.SpeechRecognition` (Web Speech API)
  - Handles microphone permission requests with user-friendly messaging
  - Continuous recognition mode with interim results
  - Language switching (en-US, ar-SA, ur-PK)
  - Falls back gracefully if browser doesn't support it
- **TTS (Text-to-Speech)**: Calls the `speechify-tts` edge function
  - Fetches audio as blob, plays via `Audio` element
  - Tracks playback state (speaking start/end)
- **Exposes**: `startListening()`, `stopListening()`, `speakResponse(text)`, `stopSpeaking()`, `voiceState`, `transcript`, `isSupported`

### 3. Updated Chat Component: `src/components/ai/PatientAIChat.tsx`

- Add a **microphone toggle button** next to the send button
- When voice mode is active:
  - Pulsing red indicator when listening
  - Transcribed speech auto-populates the input and sends
  - AI text responses are automatically spoken aloud via Speechify
  - Stop button to cancel speech playback
- Browser support check: show tooltip if Web Speech API unavailable
- Voice mode integrates with existing chat flow (messages appear in chat as normal)

### 4. Updated Hook: `src/hooks/useAIChat.ts`

- Minor update: add an `onAssistantResponse` callback so the voice hook can trigger TTS when the AI finishes responding

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Create | `supabase/functions/speechify-tts/index.ts` | Speechify TTS edge function |
| Create | `src/hooks/useVoiceConsultation.ts` | Voice mode state (STT + TTS) |
| Modify | `supabase/config.toml` | Add speechify-tts entry |
| Modify | `src/components/ai/PatientAIChat.tsx` | Mic button, voice mode UI |
| Modify | `src/hooks/useAIChat.ts` | Add assistant response callback |

### Secret Required

- `SPEECHIFY_API_KEY` -- you'll be prompted to add this securely

### Implementation Order

1. Create `speechify-tts` edge function + config entry
2. Create `useVoiceConsultation` hook
3. Update `useAIChat` with response callback
4. Integrate voice UI into `PatientAIChat`
5. Deploy and test

