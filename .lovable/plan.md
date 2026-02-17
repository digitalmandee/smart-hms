
# 3D VRM Avatar — Self-Hosted Lip Sync, No Third-Party TTS

## What Changes

Replace `HeyGenAvatar` with a self-hosted 3D character using Three.js + VRM. Voice stays exactly as-is (your existing `window.speechSynthesis` in `useVoiceConsultation.ts` — untouched).

Lip sync is driven by a **simulated amplitude** — smooth randomised mouth movement during `speaking` state, blended to zero when idle. This is the standard approach when using browser TTS because Chrome blocks audio capture from its own speech engine.

---

## How It Works

```text
voiceState === "speaking"
        ↓
VRMAvatarCanvas generates smoothed random amplitude 0–1 at 60fps
        ↓
amplitude → VRM expressionManager.setValue("aa", amplitude * 0.85)
        ↓
3D mouth opens and closes in sync with speech rhythm

voiceState === "idle" / "thinking" / "listening"
        ↓
amplitude lerps to 0 → mouth closes smoothly
```

---

## Dependencies to Install

```
three@^0.169.0
@react-three/fiber@^8.18.0
@react-three/drei@^9.122.0
@pixiv/three-vrm@^3.4.0
```

---

## Files to Create / Edit

| File | Action | What |
|------|--------|------|
| `src/components/ai/VRMAvatarCanvas.tsx` | Create | Three.js scene + VRM loader + lip sync + animations |
| `src/pages/public/TabeebiVoicePage.tsx` | Edit | Swap `HeyGenAvatar` → `VRMAvatarCanvas`, remove `avatarRef` |
| `src/components/ai/HeyGenAvatar.tsx` | Keep | Kept but no longer used on the voice page |
| `public/avatars/doctor.vrm` | Manual step | User downloads from readyplayer.me |

---

## Step-by-Step Implementation

### Step 1 — `VRMAvatarCanvas.tsx`

A Three.js `<Canvas>` component that:

1. Loads a `.vrm` file from `public/avatars/doctor.vrm` using `@pixiv/three-vrm`'s `VRMLoaderPlugin`
2. Each frame (via `useFrame`):
   - If `state === "speaking"`: generates a smooth random amplitude using lerp toward a new random target every ~80ms
   - Maps amplitude → `vrm.expressionManager.setValue("aa", amplitude * 0.85)` (mouth open)
   - Eye blink: random timer every 3–5 seconds triggers `blinkExpression` blend shape
   - Head nod: small `sin(t)` rotation on neck/head bone while speaking
   - Idle sway: gentle `sin(t * 0.5)` body rotation when idle
3. Camera framed at bust-level (portrait crop, like the existing DoctorAvatarLarge)
4. Same `boxShadow` border glow as `DoctorAvatarLarge` based on `state` prop
5. Falls back to `<DoctorAvatarLarge>` while VRM is loading (same skeleton/loading experience as before)

```tsx
// Amplitude simulation inside useFrame
const TARGET_UPDATE_INTERVAL = 0.08; // seconds
let timeSinceLastTarget = 0;
let targetAmplitude = 0;
let currentAmplitude = 0;

useFrame((_, delta) => {
  if (state === "speaking") {
    timeSinceLastTarget += delta;
    if (timeSinceLastTarget > TARGET_UPDATE_INTERVAL) {
      targetAmplitude = Math.random() * 0.9 + 0.1; // 0.1–1.0
      timeSinceLastTarget = 0;
    }
  } else {
    targetAmplitude = 0;
  }
  // Lerp for smooth transitions
  currentAmplitude = THREE.MathUtils.lerp(currentAmplitude, targetAmplitude, delta * 12);
  vrm.expressionManager.setValue("aa", currentAmplitude * 0.85);
  vrm.update(delta);
});
```

### Step 2 — VRM Model (One Manual Step)

The user needs a `.vrm` model file. The recommended source is **readyplayer.me** (free):

1. Go to [readyplayer.me](https://readyplayer.me)
2. Create a doctor avatar (white coat look)
3. Download as `.vrm`
4. Place the file at `public/avatars/doctor.vrm`

Until the file is placed, the component falls back to `DoctorAvatarLarge` automatically (no broken UI).

Alternatively, a free default VRM model can be used from `https://pixiv.github.io/three-vrm/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm` as a placeholder during development — so the feature works immediately without waiting for a custom model.

### Step 3 — `TabeebiVoicePage.tsx` Changes

- Remove: `HeyGenAvatar` import, `avatarRef` ref, `HeyGenAvatarHandle` type
- Add: `VRMAvatarCanvas` import
- Replace `<HeyGenAvatar ref={avatarRef} ... />` with `<VRMAvatarCanvas state={avatarState} />`
- Remove: `avatarRef.current?.speak(content)` from `handleAssistantResponse` — it now only calls `speakRef.current(content)` (existing browser TTS)
- Remove: `avatarRef.current?.interrupt()` from `handleMicPress` — already handled by `stopAll()`
- Remove: `onStartTalking`/`onStopTalking` props (no longer needed since avatar state is driven by `voiceState`)

---

## What the Avatar Does

| State | VRM Behaviour |
|-------|--------------|
| `idle` | Gentle body sway, random eye blinks every 3–5s, mouth closed |
| `listening` | Subtle head tilt, pulse ring overlay, mouth closed |
| `thinking` | Head slightly tilted, amber shimmer overlay, mouth closed |
| `speaking` | Mouth opens/closes with smooth amplitude, head nods, active blinks |

---

## Important Note on VRM Expressions

Ready Player Me VRM files use these expression names (confirmed for RPM format):
- `viseme_aa` or `aa` — open mouth
- `blink` — eye blink
- `happy`, `sad`, `neutral` — facial expressions

The code tries both `aa` and `viseme_aa` to cover both VRM 0.x and VRM 1.0 formats.

---

## Visual Result

The avatar will look identical in layout to the current `DoctorAvatarLarge` — same rounded card, same glow border, same state tints — but as a live 3D character with:
- Blinking eyes
- Mouth that opens and closes while speaking
- Head nod during speech
- Idle float animation

