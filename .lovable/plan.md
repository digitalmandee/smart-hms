

# HealthOS 24 Launch Video V5 — Light, Slide-Based, Content-Rich

## Problems in V4

1. **Dark background** — user wants light/clinical aesthetic matching the executive slides (white/light gray backgrounds with subtle teal accents)
2. **No real animations** — scenes feel static, elements don't animate in with motion
3. **No music** — still rendering muted due to ffmpeg codec issue
4. **Screen-like layouts** — looks like a webpage, not cinematic slides

## V5 Vision

**Match the executive slide design language** already in the codebase — those slides are the gold standard the user designed. They use:
- Light backgrounds (`bg-gradient-to-br from-background to-primary/5`)
- Colored top accent bar (2px gradient strip)
- Category label → Big title → Subtitle header pattern
- Card grids with icons, borders, rounded corners
- Footer with "HealthOS 24 | AI-Powered Hospital Management"
- Teal primary color with category-specific accent colors

**But animate everything** — each element (title, cards, icons, stats) enters with spring/interpolate motion. Cards stagger in. Text slides up. Icons scale in. This is the key difference from a static slideshow.

### Color Palette (from existing executive slides)
- Background: `#FFFFFF` to `#F8FAFC` (white to slate-50)
- Primary: `hsl(var(--primary))` → teal `#0EA5E9`
- Card: white with `#E2E8F0` border
- Text: `#0F172A` (slate-900)
- Muted: `#64748B` (slate-500)
- Category accents: blue, emerald, pink, amber, purple, teal (per module group)

### Typography
- Inter via `@remotion/google-fonts/Inter`

### Motion System
- **Default enter**: Slide up 30px + fade in over 18 frames via `interpolate`
- **Card stagger**: Each card delayed by 5 frames
- **Icon enter**: Scale from 0.7 → 1.0 via `spring({ damping: 15 })`
- **Scene transitions**: `fade()` with 15-frame overlap between all scenes
- **Persistent elements**: Subtle floating teal gradient orb at ~3% opacity drifting sinusoidally

## Scene Structure (90s = 2700 frames @ 30fps)

### Scene 1: ECG Intro + Logo (0-120 frames, 4s)
- Light background (`#F8FAFC`)
- ECG SVG line traces across center using stroke-dashoffset
- HealthOS logo (from brand component SVG) scales in at center
- "HealthOS" + "AI-Powered Hospital Management" slides up
- Faint teal radial glow behind logo

### Scene 2: About Us (120-270, 5s)
- **Mirror `ExecAboutUsSlide` layout exactly** — teal top bar, "About Us" label, "Who We Are" title, 3x2 card grid with icons
- Cards stagger in with spring animation
- 6 cards: Mission, Vision, Track Record, Team, Market Reach, Innovation DNA

### Scene 3: Problem Statement (270-420, 5s)
- **Mirror `ExecProblemSlide`** — "The Challenge" red accent, split layout
- Left: 10 disconnected systems in dashed red border box (appear one by one)
- Right: 4 pain point cards slide in from right

### Scene 4: All-in-One Solution (420-570, 5s)
- **Mirror `ExecAllInOneSlide`** — hub-spoke diagram
- Center "24" hub scales in, then 12 department icons spring outward to positions
- SVG connector lines draw in via stroke-dashoffset

### Scene 5: Modules Overview (570-720, 5s)
- **Mirror `ExecModulesSlide`** — 4-column category grid
- 7 category cards stagger in, module names appear within each

### Scene 6: AI Everywhere (720-870, 5s)
- **Mirror `ExecAIEverywhereSlide`** — but on LIGHT background instead of dark
- Central "HealthOS AI Core" brain icon + 8 AI module cards in 4x2 grid
- Cards spring in with stagger

### Scene 7: Tabeebi AI (870-1020, 5s)
- **Mirror `ExecTabeebiSlide`** — Bot icon + 4 capability cards + chat preview
- Cards slide in from left, chat bubbles appear sequentially

### Scene 8: Clinical Workflows (1020-1170, 5s)
- **Mirror `ExecClinicalSlide`** — 5-column department grid (OPD, IPD, Emergency, Surgery, Nursing)
- Each column slides up with stagger, features appear within

### Scene 9: Diagnostics & Pharmacy (1170-1320, 5s)
- **Mirror `ExecDiagnosticsSlide`** — 3-column (Lab, Radiology, Pharmacy)
- Columns slide in from bottom with stagger

### Scene 10: Automation Engine (1320-1470, 5s)
- **Mirror `ExecAutomationSlide`** — 2x4 grid of before/after cards
- Cards stagger in, "Before" appears then arrow then "After"

### Scene 11: Patient Workflow (1470-1620, 5s)
- **Mirror `ExecWorkflowSlide`** — 9-step horizontal flow diagram
- Steps appear left-to-right with arrows drawing between them
- Bottom stats count up

### Scene 12: Finance & Operations (1620-1770, 5s)
- **Mirror `ExecFinanceOpsSlide`** — 3x2 grid (Billing, Accounts, HR, Procurement, Inventory, Doctor Comp)
- Cards spring in

### Scene 13: Insurance & NPHIES (1770-1920, 5s)
- **Mirror `ExecInsuranceSlide`** — NPHIES 7-step pipeline + Pakistan/Denial sections
- Pipeline steps appear left-to-right, bottom cards slide up

### Scene 14: KSA Compliance (1920-2070, 5s)
- **Mirror `ExecKsaComplianceSlide`** — 7 integration badges + data standards
- Saudi green accent, badges stagger in

### Scene 15: Technology & Security (2070-2220, 5s)
- **Mirror `ExecTechSlide`** — 4x3 grid of tech feature cards
- Cards stagger in wave pattern

### Scene 16: ROI / Results (2220-2370, 5s)
- **Mirror `ExecROISlide`** — 4 metric cards with before/after progress bars
- Numbers count up, bars animate width

### Scene 17: CTA / Closing (2370-2700, 11s)
- **Mirror `ExecCTASlide`** — 6 "Why Us" cards + contact info + logo
- Cards stagger in, logo scales with bounce
- Hold final frame for 3-4 seconds

## Audio Strategy

Try a different approach for audio:
1. Generate WAV with raw PCM data (16-bit, 44100Hz, mono)
2. Use Remotion's `<Audio>` component with the WAV file
3. In render script, try `muted: false` — Remotion uses ffmpeg's built-in AAC encoder (not libfdk_aac)
4. If that fails, render video muted, then use ffmpeg to mux audio separately: `ffmpeg -i video.mp4 -i audio.wav -c:v copy -c:a aac output.mp4`

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
      AboutUsScene.tsx
      ProblemScene.tsx
      AllInOneScene.tsx
      ModulesScene.tsx
      AIEverywhereScene.tsx
      TabeebiScene.tsx
      ClinicalScene.tsx
      DiagnosticsScene.tsx
      AutomationScene.tsx
      WorkflowScene.tsx
      FinanceOpsScene.tsx
      InsuranceScene.tsx
      ComplianceScene.tsx
      TechScene.tsx
      ROIScene.tsx
      CTAScene.tsx
    components/
      SVGIcons.tsx
      SlideHeader.tsx        (reusable: top accent bar + label + title + subtitle + slide number)
      SlideFooter.tsx        (reusable: "HealthOS 24 | ..." footer)
      AnimatedCard.tsx       (reusable: card with spring-in animation based on delay prop)
  public/
    audio/bg-music.wav
  scripts/
    render.mjs
    generate-music.mjs
```

### Key Design Decisions

1. **Every scene mirrors an existing executive slide** — same data, same layout, same colors — but with frame-based animation
2. **Reusable `SlideHeader` and `SlideFooter`** components ensure brand consistency across all 17 scenes
3. **`AnimatedCard`** wraps any card content with `spring()` entry animation + configurable delay
4. **Light backgrounds throughout** — no dark mode scenes
5. **No dashboard mockups, no fake analytics** — pure content presentation matching the executive deck

