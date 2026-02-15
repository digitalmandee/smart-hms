

# Voice Consultation: Puter.js TTS + Web Speech API STT (Zero Cost)

## Overview

Add voice consultation mode to Tabeebi using **Puter.js** for text-to-speech (free, unlimited, no API key) and the **browser-native Web Speech API** for speech-to-text (also free). Total cost: **$0**.

No edge function needed. No API keys needed. Everything runs client-side.

---

## How It Works

1. Patient taps the **microphone button** next to the send button
2. Browser listens via Web Speech API and transcribes speech to text
3. Transcribed text auto-sends as a chat message
4. When the AI responds, Puter.js speaks the response aloud
5. Patient can stop playback or continue the voice conversation

---

## Implementation

### 1. Add Puter.js Script to `index.html`

Add `<script src="https://js.puter.com/v2/">` to the HTML head. This loads the Puter.js SDK globally, giving access to `puter.ai.txt2speech()`.

### 2. New Hook: `src/hooks/useVoiceConsultation.ts`

Manages the full voice mode lifecycle:

- **State machine**: `idle` | `listening` | `processing` | `speaking`
- **STT (Speech-to-Text)**: Uses `window.SpeechRecognition` (Web Speech API)
  - Handles microphone permission with user-friendly error messages
  - Continuous recognition with interim results
  - Language switching: en-US, ar-SA, ur-PK
  - Graceful fallback if browser doesn't support it
- **TTS (Text-to-Speech)**: Uses `puter.ai.txt2speech(text)`
  - Plays returned audio blob via HTML Audio element
  - Tracks playback state (speaking start/end)
- **Exposes**: `startListening()`, `stopListening()`, `speakResponse(text)`, `stopSpeaking()`, `voiceState`, `transcript`, `isSupported`

### 3. Update `src/hooks/useAIChat.ts`

Add an `onAssistantResponse` callback option so the voice hook can automatically trigger TTS when the AI finishes streaming a response.

### 4. Update `src/components/ai/PatientAIChat.tsx`

- Add a **microphone toggle button** next to the send button
- Visual states:
  - Pulsing red dot when listening
  - Speaker icon when AI is speaking
  - Stop button to cancel playback
- Transcribed speech auto-populates input and sends
- AI responses automatically spoken when voice mode is active
- Tooltip shown if Web Speech API is unavailable in the browser

---

## Technical Details

### Files Changed

| Action | File | Purpose |
|--------|------|---------|
| Modify | `index.html` | Add Puter.js script tag |
| Create | `src/hooks/useVoiceConsultation.ts` | Voice state machine (STT + TTS) |
| Modify | `src/hooks/useAIChat.ts` | Add onAssistantResponse callback |
| Modify | `src/components/ai/PatientAIChat.tsx` | Mic button, voice indicators, auto-speak |

### No secrets or edge functions required

### Puter.js TTS call pattern

```text
const response = await puter.ai.txt2speech(text);
// response is an audio Blob
const url = URL.createObjectURL(response);
const audio = new Audio(url);
audio.play();
```

### Web Speech API STT pattern

```text
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US"; // or ar-SA, ur-PK
recognition.continuous = true;
recognition.onresult = (event) => { /* get transcript */ };
recognition.start();
```

### Implementation Order

1. Add Puter.js script to index.html
2. Create useVoiceConsultation hook
3. Update useAIChat with response callback
4. Integrate voice UI into PatientAIChat

