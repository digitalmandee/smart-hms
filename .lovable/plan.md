# Video-Call AI Doctor with Real Lip-Sync (No Third-Party Avatar)

## What you want
A Tabeebi consultation that **looks and feels like a Zoom/FaceTime call** with a doctor — using **your own doctor portrait** (not HeyGen, not D-ID, not any pre-built avatar service). The mouth must actually move in sync with the spoken audio.

## Why HeyGen-style services won't fit
HeyGen / D-ID / Synthesia all upload your image to their cloud and stream a generated video back — they own the rendering. You want the doctor image to live in your app and the lip-sync to happen on your side. That's a different architecture.

## The approach: real-time audio-driven mouth animation on a layered portrait

We use a technique used by VTubers and AAA game cinematics — **viseme-driven mouth swapping on a still portrait**, driven by live audio amplitude + phoneme analysis from the actual TTS waveform. No video generation, no cloud avatar service.

### Pipeline
```text
User speech ──► Whisper STT ──► Tabeebi LLM ──► ElevenLabs TTS (audio bytes)
                                                       │
                                                       ▼
                                          Web Audio AnalyserNode (browser)
                                                       │
                                                       ▼
                                  Real-time amplitude + frequency bands
                                                       │
                                                       ▼
                            DoctorPortrait component (layered SVG/PNG)
                            • Base face image (your doctor photo)
                            • Mouth layer → swapped between 6 viseme shapes
                            • Eye layer → blinks every 3-5s
                            • Subtle head sway (transform, sine wave)
                            • Eyebrow micro-movement on emphasis
```

### What makes it feel like a real video call
1. **Full-bleed portrait**, not a card — fills the screen like a FaceTime window.
2. **Subtle ambient motion** even when idle: breathing (1px scale pulse), eye blinks, slight head sway. The face is never frozen.
3. **Mouth shapes driven by actual audio**, not random:
   - Web Audio `AnalyserNode` reads the live TTS playback waveform.
   - Amplitude → mouth openness (0-1).
   - Spectral centroid (low/mid/high frequency balance) → picks one of 6 viseme shapes (closed, slightly open, wide open, "O", "E", "F/V").
   - Updates at 60fps, perfectly aligned with what's actually being heard.
4. **Live caption strip** at the bottom (call-style), reveals word-by-word as audio plays.
5. **Call UI chrome**: top bar with "Dr. Tabeebi · Live" + connection dot, bottom dock with mic/end-call/captions toggle, optional self-view PiP.
6. **Connection feel**: a 1-second "connecting…" intro with a soft ring tone before the doctor "picks up", then a smooth fade-in.

### Why this looks better than the current implementation
The current `DoctorAvatarLarge` uses a **random EQ bar** to drive a dark oval over the mouth — it's faking it. The new pipeline reads the **actual audio being played** and snaps the mouth to the real phoneme shape. The difference is night-and-day.

## Technical details

### New / changed files
- **`src/components/ai/LiveDoctorPortrait.tsx`** *(new)* — full-bleed call-style portrait, layered mouth/eyes, audio-driven.
- **`src/hooks/useAudioVisemes.ts`** *(new)* — wraps a `<audio>` element in an `AudioContext` + `AnalyserNode`, exposes `{ amplitude, viseme }` updated each animation frame.
- **`src/hooks/useElevenLabsTTS.ts`** *(new)* — calls our `tabeebi-tts` edge function, returns the resulting audio Blob and an `<audio>` element ready to be analysed.
- **`supabase/functions/tabeebi-tts/index.ts`** *(new)* — server-side ElevenLabs call. Takes `{ text, language }`, returns MP3 bytes. Uses `eleven_multilingual_v2` for EN/AR/UR. Validates JWT, requires `ELEVENLABS_API_KEY` secret.
- **`src/pages/public/TabeebiVoicePage.tsx`** *(rewrite)* — new call-style layout, wires the portrait + TTS hook + existing `useVoiceConsultation` STT + existing `useAIChat`.
- **`src/lib/i18n/translations/{en,ar,ur}.ts`** — ~12 new keys: `tabeebi.call.connecting`, `.live`, `.end_call`, `.captions`, `.muted`, `.audio_only_fallback`, etc.

### Doctor image
- Need 1 high-quality doctor portrait (front-facing, neutral mouth-closed expression, eyes open) + 6 mouth crops (closed, small, medium, wide, O, F/V). I'll generate these with the AI image tool from the existing portrait used in `DoctorAvatarLarge` so the face stays consistent. Stored under `public/avatars/doctor/`.
- The mouth crops are positioned by a fixed offset relative to the base portrait (one-time tuning in CSS).
- For Arabic clinics the image should be a male doctor with neutral cultural framing — I'll generate a second portrait and let language switch the active one.

### Fallback chain
1. **Primary**: ElevenLabs TTS → real audio → real visemes. Looks like a video call.
2. **Fallback** (no `ELEVENLABS_API_KEY` or quota hit): browser `speechSynthesis` → still feed its audio output through the analyser via a `MediaStreamDestination` → mouth still animates. Degrades quality, not the experience.
3. **Last resort** (no audio support): current behaviour with random EQ animation, `Audio-only mode` badge shown.

### Secrets required
- `ELEVENLABS_API_KEY` — needs to be added to Supabase edge-function secrets. I'll prompt for it via the secrets tool before implementation. If you skip it, the page works on the browser-TTS fallback.

### Languages
ElevenLabs `eleven_multilingual_v2` covers English and Arabic natively. Urdu is not officially supported — it falls back to Hindi voice (closest phonemes). The UI shows a small note on the language switcher when UR is selected.

### Memory update
This supersedes `mem://clinical/tabeebi-ai-voice-strategy` (which referenced ElevenLabs WebRTC + DeepSeek). I'll update it to reflect the new "ElevenLabs HTTP TTS + browser-side viseme rendering" approach.

## Out of scope for this pass
- Recording the call (storage + consent flow).
- Doctor-side panel reuse (`DoctorAIPanel`) — same component will plug in later.
- Webcam self-view PiP (will add the toggle button but real camera capture comes next pass).

## Acceptance
- Open `/tabeebi/voice` → 1-second "connecting…" intro → doctor portrait fades in, breathing/blinking.
- Tap mic, ask a question in EN/AR/UR → doctor's **mouth visibly opens and closes in time with the actual spoken audio**, not random.
- End-call button stops TTS, releases mic, returns to the landing screen.
- Without `ELEVENLABS_API_KEY` set, page still works using browser TTS with mouth animation (slightly less crisp).
