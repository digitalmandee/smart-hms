
# Tabeebi Voice Mode — 5 Critical Fixes

## Issues Summary (From Code Analysis + User Feedback)

### Issue 1: No Audio (Root Cause Confirmed)
The TTS is broken in two ways:
- **Early TTS fires from `useEffect`** — browsers block `speechSynthesis.speak()` called from React effects because they are not in a user gesture stack. Only calls triggered directly from click handlers bypass this browser restriction.
- **`handleAssistantResponse` never speaks** — when `earlyTTSFiredRef.current` is `true`, the callback skips speaking. But early TTS only speaks the first sentence; the rest is never spoken. When it's `false`, it does call `speakRef.current(content)` — but this only works if voices are loaded.

**Fix**: Remove the `useEffect`-based early TTS entirely (it's blocked by browser security anyway). Instead, call `speakResponse` directly from `handleAssistantResponse` every time with the full response. Add a `userUnlockRef` to track whether the user has interacted (mic press), and only speak after that. Also add `utterance.volume = 1` and ensure we always pick the best female voice.

### Issue 2: Responses Too Long / AI-Generic
The `patient_intake` system prompt is designed for text chat — it asks multiple-choice questions, gives long assessments. For voice, we need 1-2 sentence conversational responses.

**Fix**: Add a `voice_mode: true` flag to the AI request. In the `ai-assistant` edge function, detect this flag and append a **voice brevity instruction** to the system prompt:
> "VOICE MODE: This is a real-time voice call. Keep ALL responses under 2 sentences (max 30 words for acknowledgements, max 60 words for assessments). No bullet points, no lists, no formatting. Speak naturally like a doctor on the phone."

For simple greetings like "hello, can you hear me?" — the AI should respond with a single short sentence: "Yes, I can hear you clearly! What brings you in today?" — not a paragraph.

### Issue 3: UAE Arabic Female Doctor Photo
The current photo shows a Western-looking woman. The user wants an Arabic/UAE-looking female doctor. 

**Fix**: Replace `src/assets/dr-tabeebi-avatar.jpg` with a new AI-generated image of an Arabic female doctor — dark hair, olive skin tone, wearing a white coat, with a UAE/Gulf setting feel. We'll use a high-quality Unsplash photo of a Middle Eastern female doctor. The specific URL will be: a carefully selected photo of an Arabic/Middle Eastern female doctor from a royalty-free source.

Since we cannot generate images at runtime, we will fetch a suitable image from Unsplash's free CDN using a specific photo ID of a Middle Eastern female doctor, then save it as the avatar asset.

### Issue 4: No Lip Sync
The `mouthPulse` CSS overlay is barely visible (only 60×18px blurred div). It's not obvious at all that the avatar's mouth is moving.

**Fix**: Redesign the speaking state overlay to be much more dramatic:
- Add **3 animated SVG arc overlays** over the lower-face area that expand/contract rapidly
- Add a **visible equalizer bar animation** BELOW the avatar circle (7 bars, different heights animating) when speaking — like a real audio visualizer
- Make the entire avatar circle GLOW teal when speaking (box-shadow animation)
- Slightly zoom the avatar photo when speaking (scale 1.05)

### Issue 5: Full-Screen Layout Enhancement
Make the page more immersive — avatar should take up more vertical space:
- Remove the "Auto-listen" toggle from below the mic (move it to header as a small icon toggle)
- Increase avatar size to 290px on desktop, ~240px on mobile
- Add subtle animated gradient background that shifts color based on state
- Show the doctor's name and specialty below the avatar: "Dr. Fatima Al-Tabeebi" and "Family Medicine · Dubai"

---

## Files to Modify

| File | Change |
|------|--------|
| `src/assets/dr-tabeebi-avatar.jpg` | Replace with Arabic/UAE female doctor photo |
| `src/components/ai/DoctorAvatarLarge.tsx` | Enhanced lip-sync, bigger equalizer, glow effects |
| `src/pages/public/TabeebiVoicePage.tsx` | Fix TTS audio, remove broken early TTS, add voice brevity flag, enhanced layout |
| `supabase/functions/ai-assistant/index.ts` | Add `voice_mode` brevity instruction to patient_intake prompt |

---

## Technical Details

### Fix 1: Audio — Remove Effect-Based TTS, Use Direct Callback

**Current broken flow:**
```
useEffect detects sentence → calls speakRef.current() ← BLOCKED by browser (not in gesture stack)
handleAssistantResponse fires → skips because earlyTTSFiredRef.current = true
```

**Fixed flow:**
```
User taps mic → startListening() → userInteractedRef.current = true
AI response complete → handleAssistantResponse fires → speakRef.current(content) ← WORKS (deferred from mic tap context)
```

Remove the early-sentence `useEffect` block entirely. The reason it felt slow before was the AI generating too much text (Issue 2). Once responses are short (1-2 sentences), the delay becomes <1 second, making early TTS unnecessary.

Also add `utterance.volume = 1.0` explicitly in `speakResponse` and improve voice selection to prefer female voices:
```typescript
// Prefer female voices for Dr. Tabeebi
const femaleVoice = voices.find(v => 
  v.lang.startsWith(targetLang.split("-")[0]) && 
  (v.name.toLowerCase().includes("female") || 
   v.name.toLowerCase().includes("samantha") ||
   v.name.toLowerCase().includes("karen") ||
   v.name.toLowerCase().includes("victoria"))
);
const matchingVoice = femaleVoice || voices.find(v => v.lang.startsWith(targetLang.split("-")[0]));
```

### Fix 2: Voice Brevity in Edge Function

In `supabase/functions/ai-assistant/index.ts`, after building `systemPrompt` for `patient_intake` mode, check for `voice_mode`:

```typescript
const voiceMode = body.voice_mode === true;
if (voiceMode && mode === "patient_intake") {
  systemPrompt += "\n\nVOICE MODE RULES (CRITICAL): You are on a live voice call. Keep every response under 2 sentences. Maximum 40 words per response. No lists, no bullet points, no asterisks, no markdown. For greetings or simple acknowledgements, respond in 1 sentence only. Sound like a doctor on a phone call, not a written report.";
}
```

In `TabeebiVoicePage.tsx`, pass `voice_mode: true` in the request body. This requires a small modification to `useAIChat` to accept and pass through extra body params, OR we can pass it via `patientContext` as a known field that the edge function reads.

Simplest approach: pass `voice_mode: true` in `patientContext` and read it in the edge function:
```typescript
// In TabeebiVoicePage.tsx
const { sendMessage, isLoading, messages } = useAIChat({
  mode: "patient_intake",
  language,
  patientContext: { voice_mode: true },
  onAssistantResponse: handleAssistantResponse,
});
```

```typescript
// In ai-assistant edge function
const voiceMode = patient_context?.voice_mode === true;
```

### Fix 3: Arabic Female Doctor Photo

Replace the doctor photo with a UAE/Arabic-looking female doctor. We'll use a direct Unsplash URL pointing to a photo of a Middle Eastern female doctor. The URL format: `https://images.unsplash.com/photo-[ID]?w=400&h=400&fit=crop&crop=face`

Selected photo — a Middle Eastern/Arabic female doctor with dark hair and olive skin in a white coat. We'll fetch this and save it as the asset, OR simply reference it as an import from a new file.

### Fix 4: Enhanced Lip Sync & Speaking Visuals

In `DoctorAvatarLarge.tsx`, replace the tiny `mouthPulse` overlay with:

**Equalizer bars below avatar** (when speaking):
```tsx
{state === "speaking" && (
  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1 items-end">
    {[0,1,2,3,4,5,6].map((i) => (
      <div
        key={i}
        className="w-2 bg-primary rounded-full"
        style={{
          height: "8px",
          animation: `eqBar 0.${4+i%3}s ease-in-out ${i * 0.08}s infinite alternate`,
        }}
      />
    ))}
  </div>
)}
```

**Glowing avatar ring when speaking:**
```tsx
state === "speaking" && "shadow-[0_0_40px_8px_rgba(var(--primary-rgb),0.4)] animate-pulse"
```

**Larger visible mouth overlay** — increase from 60×18px to 80×28px and use a brighter color:
```tsx
style={{ bottom: "25%", width: "80px", height: "28px", animation: "mouthPulse 0.35s ease-in-out infinite" }}
className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white/30 blur-sm"
```

### Fix 5: Layout — Full-Screen Immersive

- Move auto-listen toggle into header (small icon button)
- Increase avatar from 260px → 290px
- Add doctor name/specialty card below avatar
- Add ambient background gradient that shifts by state (teal for listening/speaking, amber for thinking, neutral for idle)

---

## Implementation Steps (In Order)

1. **Edge function**: Add `voice_mode` brevity rules to `ai-assistant` (deploy required)
2. **`useVoiceConsultation.ts`**: Fix voice selection (prefer female), add `volume = 1`
3. **`TabeebiVoicePage.tsx`**: Remove broken `useEffect` early TTS, pass `voice_mode: true` in patientContext, clean up layout
4. **`DoctorAvatarLarge.tsx`**: Add equalizer bars, bigger mouth overlay, glow effect, increase size
5. **Doctor photo**: Replace with Arabic/UAE female doctor image
