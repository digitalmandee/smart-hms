
# Tabeebi Avatar — Full Visual Overhaul

## Confirmed Issues (From Code + Screenshot Analysis)

### Issue 1: Head Nod Is Completely Invisible
The `headNod` CSS animation is applied to the `<img>` element inside a `overflow-hidden` container. When the image translates Y by -4px to +3px, those pixels are clipped by the parent — the user sees zero movement. This is why the image appears static.

**Fix**: Apply the animation to the entire portrait `<div>` container (not just the img). This way the whole card rocks/bobs together — fully visible.

### Issue 2: Equalizer Bars Are Too Small to Notice
11 bars, 5px wide each, in a 48px tall container **below** the portrait. Even though the JS interval IS updating them (session replay confirmed), they are visually too small and too far from the face to feel like lip sync.

**Fix**: Move the equalizer bars **inside** the portrait as a bottom overlay (like a real audio call interface), increase size dramatically — 8px wide bars, up to 60px tall — and use a vivid glow color.

### Issue 3: "Dr. Fatima" Name Overlay + Attribution Must Be Removed
The name card (`Dr. Fatima Al-Tabeebi`, `🇦🇪 Family Medicine`) and `Photo: Unsplash+` text sit on top of the image. User doesn't want to expose these labels.

**Fix**: Remove the name/specialty overlay from inside the portrait. Remove the Unsplash attribution text. The header already shows "Dr. Tabeebi" as the title — no need to repeat it inside the photo.

### Issue 4: Mouth Overlay Is Nearly Invisible
The white radial gradient on the photo is barely visible against the bright photo background. The user cannot see any "mouth movement" effect.

**Fix**: Replace with a dark semi-transparent oval at the mouth position that **scales open/closed** based on `mouthOpenness`. A dark shape on the bright face photo will be clearly visible as a mouth animation.

### Issue 5: Static Feel — Not Like a "3D AI Human"
The photo has no movement at all from the user's perspective (animations are clipped). It needs to feel alive.

**Fix**: 
- Apply `headNod` to the container div (not img) — the whole portrait visibly nods
- Add a subtle `perspective(800px) rotateX()` 3D tilt during speaking for depth effect
- Scale the portrait container slightly larger when speaking (1.03x)
- Add a strong pulsing glow ring around the portrait during speaking

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/ai/DoctorAvatarLarge.tsx` | Fix head nod clipping, move EQ bars inside portrait, bigger bars, remove name overlay, fix mouth overlay |

Only one file needs to change.

---

## Technical Details

### Fix 1: Move Animation From `<img>` to Container `<div>`

**Current (broken — clips):**
```tsx
<div className="relative overflow-hidden rounded-3xl" style={{ ... }}>
  <img style={{ animation: state === "speaking" ? "headNod 0.65s..." : undefined }} />
```

**Fixed:**
```tsx
<div
  className="relative overflow-hidden rounded-3xl"
  style={{
    animation: state === "speaking" ? "headNod 0.65s ease-in-out infinite"
             : state === "idle"     ? "avatarFloat 5s ease-in-out infinite"
             : undefined,
    transform: state === "speaking" ? "scale(1.03)" : "scale(1)",
  }}
>
  <img className="w-full h-full object-cover" style={{ objectPosition: "50% 8%" }} />
```

The container's `overflow-hidden` clips the image inside, but the container itself is NOT inside any overflow-hidden parent — so the container's own animation is fully visible. The head nod will be clearly visible to the user.

### Fix 2: EQ Bars — Inside Portrait, Much Bigger

Remove the external EQ bar section below the avatar. Instead, overlay them inside the portrait at the bottom:

```tsx
{/* EQ bars — inside portrait, bottom center overlay */}
{(state === "speaking" || state === "listening") && (
  <div
    className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-[4px] items-end"
    style={{ height: "60px" }}
  >
    {barHeights.map((h, i) => (
      <div
        key={i}
        style={{
          width: "7px",
          height: `${h}px`,
          borderRadius: "9999px",
          background: "hsl(var(--primary))",
          boxShadow: "0 0 6px 1px hsl(var(--primary)/0.6)",
          transition: "height 75ms ease-out",
        }}
      />
    ))}
  </div>
)}
```

This places glowing teal bars directly on the lower chest/chin area of the photo during speaking — immediately visible and tied to the face.

### Fix 3: Dark Mouth Overlay (Visible on Bright Photo)

Replace the nearly-invisible white radial gradient with a dark oval that clearly shows mouth opening/closing:

```tsx
{state === "speaking" && (
  <div
    className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
    style={{
      bottom: "29%",           // position at mouth level in the photo
      width: `${36 + mouthOpenness * 20}px`,
      height: `${8 + mouthOpenness * 22}px`,
      background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 80%)",
      borderRadius: "50%",
      transition: "width 70ms ease-out, height 70ms ease-out",
    }}
  />
)}
```

A dark semi-transparent oval at mouth position clearly reads as "mouth opening" against the bright white background of the studio photo. Scales from 36×8px (nearly closed) to 56×30px (open).

### Fix 4: Remove Name Card and Attribution

Delete the name card overlay div and the `<p className="text-[9px]...">Photo: Unsplash+</p>` attribution element entirely. The header already shows "Dr. Tabeebi — Voice Consultation".

### Fix 5: 3D Perspective Tilt During Speaking

Add a subtle perspective transform to the container to give a 3D depth effect:

```tsx
style={{
  perspective: "800px",
  // existing styles...
}}
```

And update the `headNod` keyframe to include a slight X rotation:

```css
@keyframes headNod {
  0%, 100% { transform: translateY(0px) rotateX(0deg); }
  30%       { transform: translateY(-8px) rotateX(1.5deg); }
  70%       { transform: translateY(6px) rotateX(-1deg); }
}
```

### Fix 6: Speaking Glow Ring (Much More Dramatic)

Current glow: `boxShadow: "0 0 0 3px hsl(var(--primary)/0.8), 0 0 40px 10px hsl(var(--primary)/0.35)"` — decent but could be stronger.

Add a CSS `animate-pulse` class on the container during speaking AND a brighter outer glow:

```tsx
boxShadow: state === "speaking"
  ? "0 0 0 4px hsl(var(--primary)), 0 0 60px 20px hsl(var(--primary)/0.5), 0 0 100px 40px hsl(var(--primary)/0.2)"
  : ...
```

---

## Updated `DoctorAvatarLarge.tsx` Structure

```
<div className="flex flex-col items-center gap-3">
  
  {/* Portrait container — animation applied HERE (not on img) */}
  <div
    style={{
      animation: speaking ? "headNod 0.65s..." : idle ? "avatarFloat 5s..." : undefined,
      boxShadow: glow,
      transform: speaking ? "scale(1.03)" : "scale(1)",
    }}
    className="relative overflow-hidden rounded-3xl transition-all duration-500"
  >
    {/* Photo — static, no animation */}
    <img src={DOCTOR_PHOTO_URL} />
    
    {/* State tint overlay */}
    {/* Bottom gradient fade */}
    {/* Mouth dark oval — visible on bright photo */}
    {/* EQ bars — overlaid inside bottom of portrait */}
    {/* Thinking shimmer */}
    {/* Listening pulse ring */}
    {/* Status dot */}
    {/* NO name card — removed */}
  </div>

  {/* NO external EQ bars below — moved inside portrait */}
  {/* NO attribution text — removed */}
  
</div>
```

---

## Implementation Steps

1. Move `headNod` and `avatarFloat` animation from `<img>` style to the portrait container `<div>` style
2. Remove the name card overlay (`Dr. Fatima Al-Tabeebi` + `🇦🇪 Family Medicine`) from inside the portrait
3. Remove the `<p>Photo: Unsplash+</p>` attribution below
4. Replace the white radial gradient mouth overlay with a dark oval that scales with `mouthOpenness`
5. Move equalizer bars inside the portrait as a bottom-center overlay (bigger, with glow)
6. Update `headNod` keyframe to include Y translation that is larger (+8px/-8px) and optionally a slight rotateX for 3D feel
7. Strengthen the speaking glow ring

No hooks changes. No edge function changes. Single file only.
