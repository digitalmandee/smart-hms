
# Tabeebi Voice Mode - Three Critical Fixes

## Issues Identified

### 1. Audio Not Working (Critical Bug)
The `handleAssistantResponse` callback in `TabeebiVoicePage.tsx` captures `speakResponse` from the hook, but the callback is defined with `useCallback` **before** the voice hook is initialized on the same render. More critically, `speakResponse` is not included in the `useCallback` dependency array — so it's always a stale version that may not work. This is the #1 reason audio is silent.

Fix: Move `handleAssistantResponse` **below** the hook declarations, or restructure to use a `ref` for `speakResponse` so it's always current.

### 2. Response Feels Slow / Not Conversational
Currently, `onAssistantResponse` is called only **after the full AI stream completes** (at the end of `sendMessage` in `useAIChat`). This means the TTS waits for the entire 2-10 sentence response to finish generating before it starts speaking — causing the "thinking then answering" feeling.

Fix: Start speaking the **first sentence** as soon as the stream delivers it (sentence-based early TTS). The page will detect the first sentence boundary in streamed content and begin speaking it immediately while the rest continues to stream. This cuts perceived latency from ~4-6s to ~1-2s.

### 3. Cartoony SVG Avatar → Realistic Photo Avatar
The current SVG cartoon is functional but clearly not photorealistic. For a real human doctor appearance without external APIs, we use a **beautiful high-quality AI-generated doctor photo** (a realistic Arabic/South Asian female doctor) as the avatar base, with animated overlays on top:
- Animated pulse rings (listening/speaking)
- Subtle glow/border color changes per state
- A translucent animated "mouth" overlay when speaking
- The photo itself subtly scales/moves to simulate breathing

Since we cannot call external image generation APIs at runtime, we'll use a **curated high-quality free-to-use doctor image** (from Unsplash or similar) as the avatar. The user confirmed they want a "real woman or Arabic type of woman" — we'll use a professional photo of a female doctor with appropriate appearance.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/public/TabeebiVoicePage.tsx` | Fix stale closure bug, add early TTS (first sentence), restructure hook order |
| `src/hooks/useVoiceConsultation.ts` | Add `speakResponseEarly()` — speaks first sentence immediately, queues rest |
| `src/components/ai/DoctorAvatarLarge.tsx` | Replace SVG cartoon with realistic photo + animated state overlays |

---

## Technical Details

### Fix 1: Stale Closure for `speakResponse`

Current broken pattern:
```
const handleAssistantResponse = useCallback((content) => {
  speakResponse(content);  // ← speakResponse captured here is STALE
}, []);                     // ← no dependency!

const { speakResponse } = useVoiceConsultation(language);
// ↑ defined AFTER callback but used inside it
```

Fixed pattern:
```
const { speakResponse } = useVoiceConsultation(language);
const speakRef = useRef(speakResponse);
speakRef.current = speakResponse; // always up to date

const handleAssistantResponse = useCallback((content) => {
  speakRef.current(content);  // always calls latest version
}, []); // no deps needed
```

### Fix 2: Early Sentence-Based TTS

The `useAIChat` hook fires `onAssistantResponse` once at the end. We add a **streaming sentence detector** in the voice page:

- Track streamed content via `useAIChat`'s `messages` array (already updates in real-time)
- When the latest assistant message contains a complete sentence (ends with `.`, `?`, `!`, `؟`, `۔`) and TTS hasn't started yet → call `speakResponse` on just that first sentence
- This fires ~1-2 seconds into streaming instead of waiting for the full response
- After speaking the first sentence, queue the rest when `onAssistantResponse` fires

Actually, the cleaner approach: add an `onStreamChunk` callback to `useAIChat` that fires as tokens arrive, and detect sentence boundaries in `TabeebiVoicePage`. When the first sentence boundary is detected (and it's at least 30 chars), immediately speak that sentence.

For simplicity, we monitor the `messages` array in a `useEffect` — when the latest assistant message grows past a sentence boundary and TTS hasn't started for this turn, begin speaking the first sentence.

### Fix 3: Photo-Based Realistic Avatar

Replace the SVG cartoon with a photo inside the circle. The photo will be fetched from a CDN (Unsplash with specific doctor photo parameters). On top of the photo:

- **Idle**: Gentle breathing scale animation (CSS transform on the image)
- **Listening**: Teal pulsing border rings, subtle brightness increase
- **Thinking**: Amber-tinted ring, gentle slow pulse
- **Speaking**: Strong pulsing rings, animated "sound wave" bars below the image, a subtle mouth area overlay that pulses

The photo circle will be 260px diameter (same as current), filled with `object-cover`. We'll use a carefully chosen Unsplash photo URL of a professional female doctor with Middle Eastern/South Asian appearance in a white coat.

The avatar component will be rebuilt as:
```
<div class="relative w-[260px] h-[260px] rounded-full overflow-hidden">
  <img src={doctorPhotoUrl} class="w-full h-full object-cover object-top" />
  <!-- State-based overlay: semi-transparent color wash -->
  <div class="absolute inset-0 rounded-full" style="...state colors..." />
  <!-- Mouth speaking pulse overlay in lower face region -->
  {speaking && <div class="absolute bottom-[20%] ... animate-pulse" />}
</div>
<!-- Rings outside -->
```

---

## Implementation Steps

1. **Fix hook order** in `TabeebiVoicePage` — move all `useVoiceConsultation` / `useAIChat` declarations to the top, use a `speakRef` pattern for the callback
2. **Add voiceschanged listener** in `useVoiceConsultation.speakResponse` — browsers load voices asynchronously; if voices array is empty on first call, wait for `voiceschanged` event before setting voice (this is a known Chrome bug causing silent TTS)
3. **Add early sentence TTS** — monitor streaming messages in `TabeebiVoicePage`, detect first sentence, begin speaking immediately
4. **Rebuild `DoctorAvatarLarge`** — photo-based with animated state overlays
