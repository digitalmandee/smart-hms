
# Tabeebi Voice Mode - Human AI Character Experience (Browser TTS)

## What You're Building

A dedicated full-screen **Voice Consultation Room** for Tabeebi at `/tabeebi/voice` where the entire interaction is voice-driven. The patient sees a large animated doctor character filling the screen, speaks to it, and hears the AI respond using the browser's built-in `speechSynthesis` (the same TTS module already in `useVoiceConsultation.ts`). No ElevenLabs needed — we reuse everything you already have.

---

## What Changes vs. Current Voice Mode

**Current:** Voice is a floating overlay on top of the chat UI. The doctor avatar is 120px. The experience is "chat with a voice add-on."

**New:** A full-screen immersive room. The doctor avatar is ~280–320px tall. There are no chat bubbles — just the character, a status line, the live transcript, and a big tap-to-speak button. It feels like a video call with an AI doctor.

---

## Files to Create / Edit

| File | Action |
|------|--------|
| `src/pages/public/TabeebiVoicePage.tsx` | **Create** — full-screen voice consultation page |
| `src/components/ai/DoctorAvatarLarge.tsx` | **Create** — enhanced large SVG avatar (280px, more expressive lip-sync, breathing, head-tilt states) |
| `src/pages/public/TabeebiChatPage.tsx` | **Edit** — add "Voice Mode" button in header next to language picker |
| `src/App.tsx` | **Edit** — add `/tabeebi/voice` route |

No new hooks needed. `useVoiceConsultation` + `useAIChat` are reused exactly as-is.

---

## Voice Page Layout

```text
┌─────────────────────────────────────────────────────┐
│  ←  Dr. Tabeebi              🌐 EN    [profile icon] │
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│            [DoctorAvatarLarge ~300px]               │
│         animated — idle/listening/thinking          │
│              /speaking based on state               │
│                                                     │
│    ┌──────────────────────────────────────────┐     │
│    │  "I'm listening... tap to stop"          │     │
│    │  ●●●●● (waveform bars when listening)    │     │
│    └──────────────────────────────────────────┘     │
│                                                     │
│   "I've had a headache since morning..."  ← live    │
│            transcript in subtle bubble              │
│                                                     │
│                  [  🎤  ]  ← 80px mic button        │
│              Tap to speak / Tap to stop             │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  Last response (2–3 lines, faded, scrollable):      │
│  "Your headache could be tension-related..."        │
└─────────────────────────────────────────────────────┘
```

---

## DoctorAvatarLarge — What's Enhanced

The existing `DoctorAvatar` is 120px max and built for inline use. The new `DoctorAvatarLarge` is designed for hero placement:

- **Size**: 280–320px, fills vertical space
- **Breathing**: Subtle chest/shoulder scale animation on idle (makes it feel alive)
- **Head tilt**: When `listening`, the head tilts ~3–4 degrees (curiosity cue)
- **Larger mouth animation**: The speaking mouth animation is more visible and dramatic at large size — mouth opens/closes clearly
- **Eye expressions**:
  - `idle`: Natural slow blink every ~4s (already done, but larger and more visible)
  - `listening`: Pupils slightly dilate (SVG animate attributeName="r")
  - `thinking`: Eyes shift slightly left (looking-away expression using a translate animation)
  - `speaking`: Light head nod + mouth open/close wave
- **Pulse rings**: Larger, more dramatic rings (3 concentric) behind the avatar circle
- **Sound wave bars**: Taller bars on left (listening) and right (speaking) sides

All animations use SVG `<animate>` / CSS keyframes — no external deps.

---

## Voice Page Logic

The page reuses `useAIChat` (for AI responses) and `useVoiceConsultation` (for STT + browser TTS):

1. User taps the mic button → `startListening()` → avatar shows `listening` state
2. Speech captured → final transcript sent to `sendMessage()` → avatar shows `thinking`
3. AI response streams in → `onAssistantResponse` fires → `speakResponse(content)` → avatar shows `speaking`
4. TTS finishes → avatar returns to `idle` → mic button pulses inviting next tap
5. Language selector in header changes both STT language and TTS language (same as chat page)

**Auto-listen after response**: After the AI finishes speaking, there's a 1-second pause then `startListening()` auto-fires — so the conversation flows naturally without needing to tap every time (can be toggled off).

---

## Navigation

- **From chat page**: A `Mic` icon button labeled "Voice Mode" added to the header right side (next to language picker), navigates to `/tabeebi/voice`
- **From voice page**: A `←` back button + "Chat Mode" text link returns to `/tabeebi/chat`
- Both pages share the same auth check (session required, redirect to `/tabeebi` if not logged in)
- Language state is passed via URL query param `?lang=en` so both pages stay in sync

---

## Technical Notes

- `useVoiceConsultation` already handles voices via `window.speechSynthesis.getVoices()` — it picks the best available matching voice for the language. This works well for English (multiple natural voices available in Chrome/Edge). Arabic has decent browser support. Urdu falls back to English TTS.
- The `speakResponse()` function already cleans markdown before speaking — reused as-is.
- No new edge functions, no API keys, no billing changes needed.
- The page is mobile-first — the large avatar scales down gracefully on small screens using `clamp()` sizing.

---

## Specific Code Changes

### 1. `src/components/ai/DoctorAvatarLarge.tsx` (New)
- Same SVG structure as `DoctorAvatar` but scaled to fill 280–320px
- Enhanced `breathing` animation on body
- Head tilt via CSS transform on listening state
- More expressive mouth (wider open/close arc on speaking)
- 3-ring radial pulse animation behind the circle

### 2. `src/pages/public/TabeebiVoicePage.tsx` (New)
- Auth guard (same pattern as `TabeebiChatPage`)
- Language state from URL query param, synced with header picker
- `useVoiceConsultation(language)` for STT + TTS
- `useAIChat({ mode: "patient_intake", language, onAssistantResponse })` for AI
- Full-screen layout: avatar top-center, status text, transcript bubble, 80px mic button
- Last AI response shown below mic button (last 2–3 lines, faded)
- Auto-listen toggle (default on)

### 3. `src/pages/public/TabeebiChatPage.tsx` (Edit)
- Add `Mic` icon button in header (right side, before profile dropdown)
- On click: `navigate('/tabeebi/voice?lang=' + language)`
- Tooltip: "Switch to Voice Mode"

### 4. `src/App.tsx` (Edit)
- Add `import TabeebiVoicePage from "./pages/public/TabeebiVoicePage";`
- Add `<Route path="/tabeebi/voice" element={<TabeebiVoicePage />} />` alongside the existing `/tabeebi/chat` route
