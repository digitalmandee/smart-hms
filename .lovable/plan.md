
# Self-Hosted 3D AI Avatar with Lip Sync + Hand Movements

## The Answer to Your Question

Yes — with a **3D character model** (VRM/GLB format), you have 100% programmatic control over:
- **Lip sync** — via viseme morph targets (mouth shapes like "A", "E", "I", "O", "U", "sil")
- **Hand/arm movements** — pre-built bone animations (idle wave, gesture while speaking)
- **Head nod** — bone rotation during speech
- **Eye blink** — morph target driven on a timer
- **Facial expressions** — happy, thinking, neutral via blend shapes

**No HeyGen. No third-party streaming. No quota. 100% yours.**

---

## How It Works

```text
AI text response arrives
      ↓
ElevenLabs Edge Function → returns MP3 audio blob
      ↓
AudioContext plays audio → AnalyserNode reads amplitude 60fps
      ↓
Amplitude → mapped to viseme (mouth shape)
      ↓
Three.js + VRM renders 3D character with mouth open/closed
      ↓
Separate animation clips play on bones (hand gesture, head nod, idle sway)
```

---

## Technology Stack

| Tool | Role | Cost |
|------|------|------|
| **Three.js** | 3D rendering engine | Free (npm) |
| **@pixiv/three-vrm** | VRM avatar control (morph targets, bones) | Free (npm) |
| **Ready Player Me** | Generate a doctor avatar as .vrm/.glb file | Free |
| **ElevenLabs** | High quality doctor voice TTS | ~$0.30/1M chars |
| **Web Audio API** | Amplitude capture → drives lip sync | Free (browser built-in) |

ElevenLabs already has a dedicated docs integration in this project and is the standard for this use case. An `ELEVENLABS_API_KEY` secret just needs to be added.

---

## Visual Result

```text
┌────────────────────────────────┐
│                                │
│     [3D Doctor Character]      │
│      - Blinking eyes           │
│      - Mouth opens with voice  │
│      - Head nods when speaking │
│      - Hand gestures while     │
│        explaining something    │
│      - Idle sway animation     │
│                                │
└────────────────────────────────┘
        [ 🎤 Tap to speak ]
```

---

## Architecture Diagram

```text
TabeebiVoicePage
    │
    ├── useAIChat (DeepSeek) → text response
    │
    ├── useLipSyncTTS (NEW hook)
    │       ├── Calls elevenlabs-tts edge function
    │       ├── Plays via AudioContext
    │       ├── AnalyserNode → amplitude (0–1) at 60fps
    │       └── exposes: speak(text), stop(), amplitude, isPlaying
    │
    └── VRMAvatarCanvas (NEW component)
            ├── Three.js Scene + WebGLRenderer
            ├── @pixiv/three-vrm loads .vrm file
            ├── amplitude → viseme morph target weight
            ├── AnimationMixer: idle / speaking / thinking clips
            └── Eye blink timer (every 3–5s random)
```

---

## Files to Create / Edit

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/elevenlabs-tts/index.ts` | Create | TTS proxy edge function, returns MP3 binary |
| `src/hooks/useLipSyncTTS.ts` | Create | Audio playback + amplitude extraction hook |
| `src/components/ai/VRMAvatarCanvas.tsx` | Create | Three.js + VRM canvas component |
| `public/avatars/doctor.vrm` | Add | VRM model file from Ready Player Me |
| `src/pages/public/TabeebiVoicePage.tsx` | Edit | Swap HeyGenAvatar → VRMAvatarCanvas, wire amplitude |
| `src/components/ai/HeyGenAvatar.tsx` | Delete | No longer needed |

---

## Implementation Steps

### Step 1 — ElevenLabs TTS Edge Function
A Supabase edge function that:
- Receives `{ text, language }` POST request
- Calls ElevenLabs `/v1/text-to-speech/{voiceId}` with the `ELEVENLABS_API_KEY` secret
- Returns raw MP3 binary stream
- Uses voice `George` (JBFqnCBsd6RMkjVDRZzb) for a doctor-like deep voice

### Step 2 — `useLipSyncTTS` Hook
```typescript
// Core logic
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audioElement);
source.connect(analyser);
analyser.connect(audioCtx.destination);

// 60fps amplitude loop
function tick() {
  analyser.getByteFrequencyData(data);
  const avg = data.reduce((a, b) => a + b) / data.length;
  setAmplitude(avg / 128); // 0–1
  rafId = requestAnimationFrame(tick);
}
```
Exposes: `speak(text)`, `stop()`, `amplitude: number`, `isPlaying: boolean`

### Step 3 — VRM Avatar (Ready Player Me)
1. Go to **readyplayer.me** → create a doctor avatar (white coat, professional look)
2. Download as `.vrm` file
3. Place in `public/avatars/doctor.vrm`

The VRM format has built-in morph targets for lip sync:
- `viseme_aa` — "A" sound (open mouth)
- `viseme_ih` — "I" sound
- `viseme_ou` — "O/U" sound
- `viseme_ee` — "E" sound
- `viseme_oh` — neutral open
- `mouthClose` — closed

### Step 4 — `VRMAvatarCanvas` Component
```typescript
// Per-frame update driven by amplitude from useLipSyncTTS
vrm.expressionManager.setValue("aa", amplitude * 0.8);  // mouth open
vrm.expressionManager.setValue("blink", blinkValue);    // eye blink

// Three.js animation clips for:
// - idle: subtle body sway
// - speaking: head nods, hand gesture
// - thinking: chin-rub pose or subtle tilt
```

### Step 5 — Wire into TabeebiVoicePage
- Replace `<HeyGenAvatar>` with `<VRMAvatarCanvas amplitude={amplitude} state={avatarState} />`
- Replace `avatarRef.current.speak(content)` with `lipSyncTTS.speak(content)`
- Remove the `avatarRef` HeyGen ref entirely

---

## What You Get vs HeyGen

| Feature | HeyGen | This Solution |
|---------|--------|---------------|
| Lip sync | ✅ (but quota) | ✅ |
| Hand movements | ❌ | ✅ |
| Head nod | ✅ | ✅ |
| Eye blink | ✅ | ✅ |
| Custom avatar look | ❌ fixed | ✅ full control |
| Works offline | ❌ | ✅ (after load) |
| Monthly cost | $$ quota | ~$0 (tiny ElevenLabs cost) |
| Cold start delay | 2–3s session | 0s |
| Dependency | HeyGen API | ElevenLabs only (for voice) |

---

## One Thing Needed First

Before implementing, we need to add `ELEVENLABS_API_KEY` as a Supabase secret. You can get a free API key at [elevenlabs.io](https://elevenlabs.io) — free tier gives 10,000 characters/month which is plenty for testing.

Once the key is added, the full implementation can be built in one shot.
