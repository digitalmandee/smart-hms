

# HealthOS 24 Launch Video V4 — Cinematic Slide-Based Design

## Problems in V3

1. **Webpage layout** — Header/sidebar/dashboard looks like a web app, not a video. Modules feel like screenshots of a CMS, not cinematic content.
2. **Slideshow feel** — Same static layout repeated 16 times with text-left/content-right. No dynamic motion, no visual drama.
3. **No music** — `muted: true` was never resolved. The sandbox ffmpeg lacks `libfdk_aac` for AAC encoding, but WAV/PCM audio should work with the right codec settings.
4. **Empty dashboard areas** — Fake stat cards and bar charts look hollow and purposeless.

## V4 Vision: Cinematic Module Showcase

**Aesthetic**: Dark clinical premium — deep navy/slate backgrounds with teal accent. Clean typography. Each scene is a full-bleed visual moment, not a dashboard mockup.

**Key shift**: Stop pretending to show a dashboard. Instead, show MODULE CONTENT as bold, typographic, full-screen compositions. Think Apple keynote / product launch — big text, bold icons, feature lists that animate in with rhythm.

### Color Palette
- Background: `#0B1120` (deep navy)
- Card surface: `#141E30` with `rgba(255,255,255,0.05)` border
- Primary accent: `#0EA5E9` (sky blue/teal)
- Secondary: `#10B981` (emerald for clinical)
- Text: `#F1F5F9` (slate-50)
- Muted: `#64748B` (slate-500)

### Typography
- Display: Inter (via `@remotion/google-fonts/Inter`)
- One font, varied weights (400, 600, 800)

### Motion System
- **Enter**: Elements slide up 40px + fade in over 20 frames, staggered 6 frames apart
- **Accent**: Scale from 0.8 → 1.0 with spring (damping: 15)
- **Transitions**: `wipe(from-left)` and `fade()` alternating between scenes
- **Persistent**: Subtle floating gradient orbs drifting slowly (sinusoidal Y motion)

## Scene Structure (90s = 2700 frames @ 30fps)

### Scene 1: ECG Intro (0-90 frames, 3s)
- Black screen → SVG ECG line traces across full width using stroke-dashoffset
- At peak of heartbeat, HealthOS logo pulses in at center
- "HealthOS" text + "24" badge spring in
- "AI-Powered Hospital Management" fades up

### Scene 2: Problem Statement (90-210, 4s)
- Bold kinetic type: "20+ Departments" (big) → "One Platform" (bigger)
- 10 disconnected system names appear scattered, then compress into a single unified block
- Red accent for "problem" state → transitions to teal

### Scene 3: Module Overview Grid (210-330, 4s)
- All 16+ module icons appear in a 4x4 grid with staggered spring-in
- Each icon in its colored circle, name below
- "Every Department. Fully Integrated." text at bottom

### Scenes 4-14: Module Deep-Dives (330-1730, ~127 frames each ≈ 4.2s)
**11 grouped module scenes** (not 16 individual — group related modules):

Each scene uses ONE of 3 visual treatments (rotating):

**Treatment 1 — "Feature Wall"** (full-screen)
- Module name HUGE at top-left (80px font)
- Module SVG icon large (200px) at top-right with glow
- 6 features as large pills/cards in 2x3 grid, each with checkmark icon
- Each card springs in with stagger
- Accent gradient bar at left edge

**Treatment 2 — "Split Reveal"**
- Left 60%: Module icon centered at 300px with radial glow behind it
- Right 40%: Module name + 6 features slide in from right, staggered
- Bottom: 3-4 key stats as horizontal badges

**Treatment 3 — "Scrolling List"**
- Module name + icon at top
- Features appear one-by-one with slide-up animation (typewriter feel for feature list)
- Key stat numbers animate/count up at bottom

**Module groupings:**
1. OPD & Consultations (Treatment 1)
2. IPD & Admissions (Treatment 2)
3. Emergency & Surgery & OT (Treatment 3)
4. Nursing Station (Treatment 1)
5. Laboratory & Radiology (Treatment 2)
6. Pharmacy & Dispensing (Treatment 3)
7. Billing & Invoicing (Treatment 1)
8. Finance & Accounts (Treatment 2)
9. HR, Payroll & Procurement (Treatment 3)
10. Inventory & Blood Bank (Treatment 1)
11. Insurance & NPHIES (Treatment 2)

### Scene 15: Tabeebi AI (1730-1880, 5s)
- "Tabeebi" in large gradient text (pink → teal)
- "Your Digital Medical Assistant" subtitle
- 4 capability cards (Trilingual Voice, Clinical Summaries, Prescription Gen, 24/7 Pre-Screening)
- 3 language badges: EN | عربي | اردو
- No chat mockup, no phone — just bold feature presentation

### Scene 16: Automation Engine (1880-2010, 4.3s)
- "Built-in Automation" title
- 4 key automations shown as before/after pairs with arrow between
- Quick stagger animation

### Scene 17: KSA Compliance (2010-2160, 5s)
- 7 integration badges (NPHIES, ZATCA, Wasfaty, etc.) in grid
- Saudi green accent
- Data standards row at bottom

### Scene 18: Technology & Security (2160-2310, 5s)
- AWS, 99.9% Uptime, AES-256, RBAC, API-First as bold cards
- Dark premium tech aesthetic

### Scene 19: ROI / Results (2310-2460, 5s)
- 4 big metrics with animated count-up numbers
- Before/after progress bars

### Scene 20: Closing (2460-2700, 8s)
- Logo resolve with scale bounce
- "20+ Modules · 50+ Features · 3 Languages" counting up
- "healthos24.com" + contact info
- Fade to branded end card

## Audio Strategy

The key issue: sandbox ffmpeg lacks `libfdk_aac`. Solutions:
1. Generate WAV audio (PCM) and render with `codec: 'h264'` — ffmpeg can mux PCM into MP4 as AAC using its built-in native AAC encoder (not libfdk)
2. In render script, set `muted: false` and let Remotion handle the audio muxing
3. If that fails, try rendering video + audio separately and muxing with ffmpeg directly
4. Generate the ambient track as a 90s sine-wave chord pad (C-F-G progression, low volume)

## File Structure

```
/tmp/healthos-video/
  src/
    index.ts
    Root.tsx
    MainVideo.tsx
    theme.ts
    scenes/
      ECGIntroScene.tsx
      ProblemScene.tsx
      ModuleGridScene.tsx
      ModuleScene.tsx          (single component, takes treatment prop)
      TabeebiScene.tsx
      AutomationScene.tsx
      ComplianceScene.tsx
      TechScene.tsx
      ROIScene.tsx
      ClosingScene.tsx
    components/
      SVGIcons.tsx             (16 module SVG icons)
      FloatingOrbs.tsx         (persistent background)
      ProgressBar.tsx          (bottom progress indicator)
    data/
      modules.ts              (all module data: name, icon, features, stats, treatment)
  public/
    audio/bg-music.wav
  scripts/
    render.mjs
    generate-music.mjs
```

## Render
- Output: `/mnt/documents/healthos24-launch-v4.mp4`
- `concurrency: 1` to avoid timeout
- `muted: false` — attempt audio embedding

