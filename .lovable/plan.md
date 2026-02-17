
# Tabeebi Voice Mode — Photo Fix + Real Lip Sync + Bigger Avatar

## What This Plan Does

Three targeted changes to fix the exact issues reported:

1. **Correct Arabic doctor photo** — use the exact Unsplash photo you shared (hijab, white coat, stethoscope, studio background)
2. **Real JavaScript-driven lip sync** — replace broken CSS loops with `setInterval` randomization that changes bar heights every 80ms during speaking, making it look genuinely alive
3. **Bigger avatar** — switch from a 280px circle to a tall half-body portrait (like a video call) filling most of the screen
4. **Remove "One moment"** — silent thinking instead of robotic bridge phrase

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/ai/DoctorAvatarLarge.tsx` | New photo URL, bigger portrait format, JS-driven lip sync bars, bigger mouth overlay |
| `src/pages/public/TabeebiVoicePage.tsx` | Remove speakBridge call, increase avatar area in layout |
| `src/hooks/useVoiceConsultation.ts` | Remove speakBridge call from handleFinalTranscript (silence = natural) |

---

## Technical Details

### 1. Doctor Photo URL

From the Unsplash page you linked, the actual CDN URL is:
```
https://plus.unsplash.com/premium_photo-1664475543697-229156438e1e?fm=jpg&q=80&w=800&auto=format&fit=crop
```

This shows a Muslim Arabic female doctor in pink hijab, white coat with stethoscope, professional studio background — exactly right.

Note: This is an Unsplash+ (Getty) image. The CDN URL is publicly accessible for embedding in web apps as long as the Unsplash attribution is shown (which we'll add as a small overlay).

### 2. Avatar Format — Half-Body Portrait

Current: 280px circle (just a face crop)
New: Tall rounded rectangle — `w-[300px] h-[420px]` (or `w-[280px] h-[400px]` on mobile)

```
┌─────────────┐
│   [head]    │   ← face visible
│  [torso]    │   ← white coat + stethoscope visible  
│  [hands]    │   ← crossed arms visible
└─────────────┘
```

This makes her look like she's standing/sitting across from you — like a real video call or FaceTime. `object-fit: cover; object-position: 50% 5%` shows the full body from head to mid-torso.

The portrait will have:
- Soft rounded corners (`rounded-3xl`)
- State-based glowing border instead of rings
- A gradient overlay at the bottom to fade into the background (like a video call portrait)

### 3. JavaScript-Driven Lip Sync (The Real Fix)

Current broken approach — CSS `@keyframes eqBar` that runs the same loop forever:
```css
@keyframes eqBar {
  from { transform: scaleY(0.15); }
  to { transform: scaleY(1); }
}
```
This looks mechanical — every bar animates on a fixed schedule regardless of speech.

New approach — React state drives bar heights directly:

```typescript
const [barHeights, setBarHeights] = useState<number[]>(
  [4, 6, 4, 8, 4, 6, 4, 8, 4, 6, 4]  // quiet idle state
);
const barTimerRef = useRef<ReturnType<typeof setInterval>>();

useEffect(() => {
  if (state === "speaking") {
    barTimerRef.current = setInterval(() => {
      setBarHeights(
        Array.from({ length: 11 }, (_, i) => {
          // Center bars are tallest (speech formants)
          const isCenterBar = i >= 3 && i <= 7;
          const min = isCenterBar ? 8 : 3;
          const max = isCenterBar ? 38 : 20;
          return Math.floor(min + Math.random() * (max - min));
        })
      );
    }, 80); // 12.5fps updates — fast enough to look organic
  } else {
    clearInterval(barTimerRef.current);
    setBarHeights([4, 6, 4, 8, 4, 6, 4, 8, 4, 6, 4]); // reset to idle
  }
  return () => clearInterval(barTimerRef.current);
}, [state]);
```

Each bar's height changes independently at random — center bars (indices 3-7) go taller since human speech is concentrated in mid frequencies. This makes the visualizer look genuinely responsive.

**Mouth overlay** — driven by average center bar height:
```typescript
const mouthOpenness = state === "speaking"
  ? Math.min(1, (barHeights[4] + barHeights[5] + barHeights[6]) / (3 * 38))
  : 0;
```

The mouth overlay size scales with `mouthOpenness`:
- At low openness (0.1): small ellipse, lips nearly closed
- At high openness (0.9): tall ellipse, mouth clearly open

### 4. Equalizer Bar Rendering

Replace the current static height + scaleY approach with direct `height` from state:

```tsx
<div className="flex gap-[3px] items-end h-12">
  {barHeights.map((h, i) => (
    <div
      key={i}
      className="w-[5px] bg-primary rounded-full transition-[height] duration-75"
      style={{ height: `${h}px` }}
    />
  ))}
</div>
```

Using `transition-[height] duration-75` gives each bar a 75ms smooth transition between random heights — creating a very natural-looking fluid animation without snap.

### 5. Listening Waveform (Same Treatment)

When `state === "listening"`, show similar animated bars but in the mic-input style (blue/teal, symmetric, reacts as if picking up audio):

```typescript
// Same setInterval approach when state === "listening"
// Different heights — more uniform (input monitor, not output playback)
// Shorter bars overall (8-18px range)
```

### 6. Remove "One Moment" Bridge

In `TabeebiVoicePage.tsx`, line 115: `speakBridgeRef.current();` — remove this line.

The "thinking" avatar animation (amber pulse) already gives visual feedback. Silence during thinking is natural and professional. Saying "One moment" every time sounds like a voicemail robot.

### 7. Layout Change

Current avatar area height: `flex-1 flex-col items-center justify-center` — avatar gets ~300px vertical space on mobile.

New: Give the avatar more room by reducing the bottom conversation history panel. On mobile the portrait takes 420px height, which is most of a 844px screen. The mic button floats at the bottom.

Remove: The transcript history panel (it distracts from the video-call feel). Instead show only the last Dr. Tabeebi response as a subtitle below the portrait (like a real-time caption).

---

## Implementation Order

1. `DoctorAvatarLarge.tsx` — swap photo URL, convert to portrait format, add `useState` + `useEffect` for JS bar animation, update mouth overlay
2. `TabeebiVoicePage.tsx` — remove `speakBridgeRef.current()`, adjust layout to give avatar more vertical space, replace history panel with single last-response caption
3. `useVoiceConsultation.ts` — `speakBridge` function can stay (for future use) but it won't be called

No edge function changes needed (brevity + token cap already correctly configured).
No new dependencies needed.
