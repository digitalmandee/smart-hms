
# Replace Broken 3D Avatar with Polished Illustrated Avatar Card

## The Problem

Right now, when no VRM file exists (which is always the case until you upload one), `VRMAvatarCanvas` falls back to `ProceduralDoctorAvatar` — a blocky, low-quality Three.js mesh that looks terrible. The much better `DoctorAvatarLarge` (photo-based) exists but is only used as a tiny loading spinner.

## The Fix

Replace the `ProceduralDoctorAvatar` fallback inside `VRMAvatarCanvas` with a **beautiful illustrated avatar card** — using the existing `DoctorAvatar` SVG component (which already has idle float, speaking nod, listening pulse, eye blink animations) wrapped in a professional styled card with:

- A rich teal gradient background (brand color)
- Animated EQ bars when speaking/listening (reused from `DoctorAvatarLarge`)
- Glow border matching the state
- "Dr. Tabeebi" name badge at the bottom
- No Three.js dependency — pure React/CSS, zero loading time

This is a **temporary polished placeholder** until the VRM file is ready. Once you drop `doctor.vrm` into `public/avatars/`, it automatically switches to the 3D avatar — no code changes needed.

---

## What Changes

### 1. New component: `AvatarPlaceholderCard`

A self-contained card (inside `VRMAvatarCanvas.tsx` or its own file) that replaces `ProceduralDoctorAvatar`:

```text
┌─────────────────────────────┐  ← rounded-3xl card, teal gradient bg
│                             │
│      ╔═══════════╗          │  ← teal brand ring (animated on state)
│      ║  DR SVG   ║          │  ← DoctorAvatar size="lg", animated
│      ╚═══════════╝          │
│                             │
│   ▌▌ ▌▌▌ ▌▌ ▌▌▌ ▌▌        │  ← EQ bars (speaking/listening)
│                             │
│  ┌─────────────────────┐    │
│  │   Dr. Tabeebi  🩺   │    │  ← name badge
│  │   AI Health Assistant│   │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### 2. Update `VRMAvatarCanvas.tsx`

Replace the `ProceduralDoctorAvatar` import and usage (line 6 and line 204) with the new `AvatarPlaceholderCard`. The VRM loading path stays completely unchanged — when a VRM file is detected, it still shows the 3D canvas.

Also fix the loading fallback (line 233) to use the new card instead of the 3D avatar.

### 3. Update `DoctorAvatar.tsx` (small fix)

The existing `DoctorAvatar` SVG component used in chat already handles all 4 states well. No changes needed there — it gets reused inside the new card at `size="lg"`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/ai/VRMAvatarCanvas.tsx` | Replace `ProceduralDoctorAvatar` import + fallback with new `AvatarPlaceholderCard` |
| `src/components/ai/AvatarPlaceholderCard.tsx` | New file — polished illustrated card using existing `DoctorAvatar` SVG |

The `ProceduralDoctorAvatar.tsx` file is kept intact — it stays as-is until the VRM file arrives, it just won't be rendered anymore.

---

## Technical Details

### AvatarPlaceholderCard layout

- **Container**: `min(300px, 86vw)` × `min(420px, 54vh)` — matches `DoctorAvatarLarge` exactly so the voice page layout doesn't shift
- **Background**: `linear-gradient(160deg, hsl(174 84% 12%) 0%, hsl(174 84% 6%) 100%)` — deep brand teal, looks premium in dark mode
- **Center avatar**: `DoctorAvatar size="lg"` floating in the middle with existing animations
- **State ring**: Outer glow ring animates based on state (same `borderGlow` logic already in the codebase)
- **EQ bars**: Reuse the same animated bar logic from `DoctorAvatarLarge` — 11 bars, teal color, glowing
- **Name badge**: Frosted glass pill at the bottom: "Dr. Tabeebi · AI Health Assistant"
- **Status dot**: Top-right corner, green/teal/amber depending on state

### Why this is better than the current 3D avatar

- Zero WebGL/Three.js overhead — instant render
- The existing `DoctorAvatar` SVG already has: float animation, speaking nod, eye blink, listening pulse rings, sound waves — all perfectly implemented
- Consistent brand colors
- No geometry artifacts or camera framing issues
- Works perfectly until VRM file is ready
