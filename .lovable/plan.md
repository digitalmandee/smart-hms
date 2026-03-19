

# HealthOS 24 Launch Video V3 — Unified Design + Rich Module Content + Audio

## Key Feedback Addressed

1. **Remove Tabeebi chat scene** — this is a launch video, not a chat demo. Replace with a concise "AI-Powered" feature highlight slide (no phone mockup, no conversation)
2. **Remove analytics-style scenes (Layout B donut charts, Layout C metric grids)** — replace with ONE unified module layout focused on features and dashboard content
3. **Add background music** — generate a royalty-free corporate ambient track via programmatic tone synthesis (since sandbox ffmpeg can encode PCM audio), embed via Remotion `<Audio>`
4. **Fill empty spaces** — every module scene should be dense with content: header, features list, stats, chart, table — all visible simultaneously
5. **Fix branding** — show full "HealthOS" logo (not just "24" badge) consistently at top of every scene

## Design System: Single Unified Layout

Every module scene uses ONE template — no A/B/C rotation:

```text
┌──────────────────────────────────────────────────────┐
│  [HealthOS Logo + 24]     Module Name + Icon    ●●●  │ ← Persistent branded header
├──────┬───────────────────────────────────────────────┤
│      │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│ Side │  │Stat1│ │Stat2│ │Stat3│ │Stat4│            │ ← 4 stat cards
│ Nav  │  └─────┘ └─────┘ └─────┘ └─────┘            │
│      ├──────────────────┬───────────────────────────┤
│      │  ✓ Feature 1     │  ┌─ Bar Chart ──────┐    │
│      │  ✓ Feature 2     │  │ ████ ██████ ████ │    │
│      │  ✓ Feature 3     │  │ ██ ████████ ██   │    │
│      │  ✓ Feature 4     │  └──────────────────┘    │
│      │  ✓ Feature 5     │  ┌─ Data Table ─────┐    │
│      │  ✓ Feature 6     │  │ Row 1  Row 2  .. │    │
│      │                  │  │ Row 3  Row 4  .. │    │
│      │                  │  └──────────────────┘    │
└──────┴──────────────────┴───────────────────────────┘
│                    ▬▬▬▬ progress bar                  │
```

## Revised Scene Structure (90s @ 30fps = 2700 frames)

| Scene | Frames | Duration | Content |
|-------|--------|----------|---------|
| 1. ECG Intro + Logo | 0-150 | 5s | ECG heartbeat traces → HealthOS logo reveal with full branding |
| 2. Platform Overview | 150-270 | 4s | "20+ Departments. One Platform." + 16 SVG icons grid |
| 3-18. 16 Module Scenes | 270-2270 | ~67s | Unified layout per module (~125 frames each) |
| 19. Tabeebi AI Highlight | 2270-2420 | 5s | Feature card layout (NO chat) — icon, 3 languages, key capabilities as cards |
| 20. KSA Compliance | 2420-2540 | 4s | 4 compliance badges |
| 21. Closing | 2540-2700 | 5.3s | Logo + stats + tagline |

## Changes to Implement

### Files to DELETE
- `ModuleSceneB.tsx` — eliminated (unified layout only)
- `ModuleSceneC.tsx` — eliminated
- `FloatingAccents.tsx` — replaced by `ClinicalWatermark.tsx`

### Files to CREATE

**`src/components/ClinicalWatermark.tsx`**
- Very faint ECG line patterns at ~2% opacity as background
- Subtle medical cross symbols scattered
- Applied as background layer in MainVideo

**`src/components/BrandHeader.tsx`**
- Persistent top bar: HealthOS logo (SVG icon + "HealthOS" text) on left
- Module name + icon on right
- Used in every scene for consistency

### Files to REWRITE

**`src/scenes/ModuleSceneA.tsx` → `src/scenes/UnifiedModuleScene.tsx`**
- Single unified layout for ALL 16 modules
- Full HealthOS logo in sidebar header (not "24" badge)
- BrandHeader at top
- 4 stat cards row
- Left: 6 features with checkmark icons
- Right top: Bar chart with month labels
- Right bottom: Data table (5 rows)
- All areas filled — no empty space

**`src/scenes/TabeebiScene.tsx`**
- Remove phone mockup and chat conversation entirely
- Replace with feature-card layout:
  - Large "Tabeebi AI" title with stethoscope icon
  - 4 capability cards (Trilingual Voice, Clinical Summaries, Prescription Gen, 24/7 Pre-Screening)
  - 3 language badges (EN/AR/UR)
  - "Built Into Every Module" badge
- Clean, informational — matches module scene aesthetic

**`src/scenes/OpeningScene.tsx`**
- Add ECG heartbeat line animation in first 60 frames (traces across full screen width)
- Logo reveals from behind ECG line
- Full "HealthOS" branding (icon + text), not just "24" box

**`src/scenes/ClosingScene.tsx`**
- Full HealthOS logo (icon + "HealthOS" text)
- BrandHeader at top

**`src/components/SidebarNav.tsx`**
- Replace "24" badge with full HealthOS SVG logo (icon + text)

**`src/MainVideo.tsx`**
- Remove A/B/C layout rotation — all modules use `UnifiedModuleScene`
- Add `ClinicalWatermark` as persistent background
- Replace `TabeebiScene` import
- Add audio layer (see below)

**`src/Root.tsx`**
- Add missing `import React` statement

**`scripts/render.mjs`**
- Change `muted: false` to enable audio
- Output to `healthos24-launch-v3.mp4`
- If audio encoding fails, fall back to `muted: true`

### Background Music

1. Generate a 90-second ambient corporate WAV file using a Node.js script that synthesizes simple sine-wave tones with chord progressions (C major, F major, G major pads at low volume) — entirely programmatic, no external download needed
2. Save to `public/audio/bg-music.wav`
3. Add `<Audio src={staticFile('audio/bg-music.wav')} volume={0.12} />` in MainVideo as persistent layer
4. If Remotion audio encoding fails (sandbox ffmpeg limitation), render muted and note this

### Render
- Output: `/mnt/documents/healthos24-launch-v3.mp4`
- QA key frames with `bunx remotion still`

