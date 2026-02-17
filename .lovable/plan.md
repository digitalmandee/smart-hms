
# Tabeebi Voice Mode — Complete Rebuild of All 5 Issues

## Root Cause Analysis

### Why Audio Is Still Silent (The Real Fix)
The current `speakResponse` is called from `handleAssistantResponse`, which is called from inside `useAIChat`'s `sendMessage()` — an `async` function that started from a mic press event. By the time the AI response returns (~2–4s later), the browser's user gesture event stack has long expired. Chrome/Safari block `speechSynthesis.speak()` in this context.

The only reliable cross-browser fix: **unlock audio on first mic tap** by calling `speechSynthesis.speak()` with a silent empty utterance synchronously inside the `handleMicPress` click handler. This "primes" the audio context. Then all subsequent `speak()` calls from any async context work because the audio context is already unlocked.

### Why Responses Are Cut Off Mid-Sentence
`max_tokens` for voice mode is still 768 (early) / 1536 (later). The brevity instruction says max 35 words — that's only ~50 tokens. When DeepSeek generates a short response and the response ends mid-stream, it may be cutting off because the token limit is being hit on streaming boundaries. We need to set `max_tokens = 120` in voice mode to force short output.

### Why the Avatar Looks Unattractive
The `dr-tabeebi-avatar.jpg` local asset was a placeholder — there's no actual real doctor photo there. Instead of importing a local broken binary, we reference a **specific high-quality royalty-free photo URL** of an Arabic/UAE female doctor directly in the component via `<img src="URL">`.

### Why Lip Sync Is Invisible
The `eqBar` animation is missing an explicit height on the divs — they start at 0px height and animate to 28px, but Tailwind's `min-h-[4px]` was removed. Also the animation direction is `alternate` with no `animation-fill-mode: both` so bars snap to 0 at the start. The mouth overlay inside the photo uses `bg-white/25 blur-md` which is nearly invisible on a photo background.

### Why It Feels Slow
The "thinking" phase (2–4s for API + streaming) is unavoidable with a remote AI. But the perception of slowness is worse because there's silence. Fix: immediately speak a short bridging phrase ("One moment...") the instant the user stops speaking and processing begins. This fills the silence gap.

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/public/TabeebiVoicePage.tsx` | Add audio unlock on mic press, add thinking bridge phrase, improve layout |
| `src/components/ai/DoctorAvatarLarge.tsx` | Use real Unsplash doctor photo URL, fix eq bar animation, more dramatic lip overlay |
| `supabase/functions/ai-assistant/index.ts` | Cap `max_tokens` at 120 for voice mode, strengthen brevity instruction |
| `src/hooks/useVoiceConsultation.ts` | Add `unlockAudio()` method, add `speakBridge()` for instant feedback phrases |

---

## Detailed Changes

### 1. Audio Unlock Fix (`TabeebiVoicePage.tsx` + `useVoiceConsultation.ts`)

Add an `unlockAudio()` function to `useVoiceConsultation.ts`:
```typescript
const unlockAudio = useCallback(() => {
  if (!isTTSSupported) return;
  // Speak a zero-duration silent utterance to unlock Web Audio context
  const unlock = new SpeechSynthesisUtterance("");
  unlock.volume = 0;
  unlock.rate = 10; // fastest possible = near zero duration
  window.speechSynthesis.speak(unlock);
}, [isTTSSupported]);
```

In `TabeebiVoicePage.tsx`, call `unlockAudio()` inside `handleMicPress` **synchronously before** doing anything else:
```typescript
const handleMicPress = () => {
  unlockAudio(); // ← called synchronously in gesture handler — unlocks browser audio
  // ... rest of logic
};
```

Also add a `speakBridge()` in `useVoiceConsultation.ts` for instant "thinking" feedback:
```typescript
const speakBridge = useCallback((lang: string) => {
  const phrases = { en: "One moment.", ar: "لحظة.", ur: "ایک لمحہ." };
  const text = phrases[lang] || "One moment.";
  // speak immediately (audio is already unlocked)
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = 0.7;
  utterance.rate = 1.1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}, []);
```

Call `speakBridge(language)` in `handleFinalTranscript` — right when the user's speech is captured, before the API call.

### 2. Token Cap for Voice Mode (`ai-assistant/index.ts`)

Change:
```typescript
const maxTokens = mode === "pharmacy_lookup" ? 512
  : mode === "patient_intake"
    ? (messageCount >= 4 ? 1536 : 768)
    : mode === "doctor_assist" ? 2048 : 2048;
```

To:
```typescript
const maxTokens = mode === "pharmacy_lookup" ? 512
  : mode === "patient_intake"
    ? (voiceMode ? 120 : messageCount >= 4 ? 1536 : 768)
    : mode === "doctor_assist" ? 2048 : 2048;
```

Also strengthen the voice mode prompt instruction to add `temperature: 0.3` for voice (currently 0.5, too creative → verbose):
```typescript
temperature: (mode === "patient_intake" && voiceMode) ? 0.3 : mode === "patient_intake" ? 0.5 : ...
```

### 3. Real Doctor Photo (`DoctorAvatarLarge.tsx`)

Replace the broken local asset import with a curated Unsplash photo of a Middle Eastern/Arabic female doctor in a white coat. Use this specific Unsplash photo URL with face-crop parameters:
```
https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&h=600&fit=crop&crop=faces&auto=format
```
This is a well-known royalty-free Unsplash photo of a female doctor in a white coat (dark hair, professional appearance). We embed it directly as `<img src="URL">` instead of a local import.

### 4. Visible Lip-Sync Equalizer Fix (`DoctorAvatarLarge.tsx`)

Current broken animation: bars have no starting height, animation snaps.

Fixed version — give each bar a fixed height and animate via `scaleY` instead of height (more reliable):
```css
@keyframes eqBar {
  0%, 100% { transform: scaleY(0.15); opacity: 0.6; }
  50% { transform: scaleY(1); opacity: 1; }
}
```
Each bar gets: `height: 32px; transform-origin: bottom; animation: eqBar ...`

Also enhance mouth overlay — replace white/25 blur with a strong bright overlay that's actually visible:
```tsx
{state === "speaking" && (
  <div
    className="absolute left-1/2 -translate-x-1/2"
    style={{
      bottom: "22%",
      width: "70px",
      height: "22px",
      background: "radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)",
      animation: "mouthPulse 0.35s ease-in-out infinite",
      borderRadius: "50%",
    }}
  />
)}
```

Also make the entire avatar photo **nod slightly** when speaking:
```css
@keyframes headNod {
  0%, 100% { transform: scale(1.03) translateY(0px); }
  33% { transform: scale(1.03) translateY(-3px); }
  66% { transform: scale(1.03) translateY(2px); }
}
```
Apply `animation: headNod 0.6s ease-in-out infinite` to the image when `state === "speaking"`.

### 5. Layout — Full Immersive Screen

The avatar should feel like a video call. Move the name/specialty card to INSIDE the avatar area as a subtle overlay at the bottom. Remove the outer "Doctor name" text block. Add a subtle ambient background gradient overlay that shifts with state:
- idle → very dark/neutral background
- listening → slight teal tint
- speaking → slight warm glow
- thinking → slight amber pulse

Add a **UAE flag emoji + "Dubai Health Authority" subtitle** to the doctor card to reinforce the UAE/Arabic doctor identity.

---

## Implementation Order

1. `supabase/functions/ai-assistant/index.ts` — cap voice mode tokens to 120, lower temperature to 0.3, deploy
2. `src/hooks/useVoiceConsultation.ts` — add `unlockAudio()`, add `speakBridge()` 
3. `src/pages/public/TabeebiVoicePage.tsx` — call `unlockAudio()` on mic tap, call `speakBridge()` on transcript capture, tighten layout
4. `src/components/ai/DoctorAvatarLarge.tsx` — swap to Unsplash photo URL, fix eq bars, enhance mouth overlay, add head nod

No database changes. No new dependencies. Edge function will be auto-deployed.
