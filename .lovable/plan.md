

# HealthOS 24 Launch Video — Clean Light Design with Dashboard Animations

## Design Philosophy: "Clinical Clarity"

Modern, light, airy — like a premium SaaS product page. Plain light backgrounds with dashboard UI mockups animating on screen. Only brand colors. No dark mode, no neon, no gradients-for-the-sake-of-gradients.

## Brand Palette (extracted from codebase)

| Role | HSL | Approx Hex |
|------|-----|------------|
| Primary (Teal) | 174 84% 32% | `#0D9488` |
| Accent (Coral) | 16 85% 57% | `#E8734A` |
| Background | 210 25% 96% | `#F1F4F8` |
| Foreground | 220 25% 15% | `#1D2939` |
| Success | 142 76% 36% | `#16A34A` |
| Warning | 38 92% 50% | `#F59E0B` |
| Info | 199 89% 48% | `#0EA5E9` |
| Card White | 0 0% 100% | `#FFFFFF` |
| Muted | 210 20% 94% | `#ECEEF1` |
| Border | 214 32% 91% | `#E2E8F0` |

## Typography
- **Display**: Inter Bold (via `@remotion/google-fonts/Inter`)
- **Body**: Inter Regular

## Motion System
- **Enter**: Spring slide-up with opacity (`damping: 20, stiffness: 200`)
- **Exit**: Fade out + slight scale down
- **Dashboard screens**: Slide in from right/bottom with soft shadow, floating on light bg
- **Transitions**: Wipe from-left between major sections, fade between module groups
- **Persistent**: Subtle floating teal circles (very low opacity) drifting slowly

## Video Structure (90s @ 30fps = 2700 frames)

### Scene 1: Logo Reveal (0–4s, 120 frames)
- Light `#F1F4F8` background
- HealthOS "24" icon draws in via SVG path animation
- "HealthOS" text springs in beside it
- Tagline "Smart Hospital Management" fades up
- Subtle heartbeat line traces across bottom

### Scene 2: Problem → Solution (4–8s, 120 frames)
- "20+ Departments. One Platform." — large Inter Bold, teal color
- Animated grid of 16 small module icons assembles into a unified dashboard frame
- Clean, minimal — just icons and text on light background

### Scenes 3–18: Module Showcase (8–76s, ~2040 frames)
Each module gets ~4.2s (127 frames). **Key creative**: each module shown as a **dashboard screen mockup** — a white card with rounded corners, subtle shadow, containing:
- Module icon + title in teal header bar
- 3–4 feature items as clean list rows with small icons
- Fake dashboard elements (progress bars, stat numbers, mini charts) drawn with brand colors

The dashboard card slides in from right, features stagger in, then wipes to next module.

**16 modules in order:**
1. Patient Management (teal accent)
2. Appointment System (success green)
3. OPD & Consultations (teal)
4. Emergency & Casualty (coral accent)
5. Operation Theatre (teal dark)
6. IPD Management (teal)
7. Nursing & Ward (coral)
8. Laboratory (info blue)
9. Radiology & Imaging (info blue)
10. Pharmacy (warning amber)
11. Pharmacy POS (teal)
12. Billing & Payments (coral)
13. Accounts & Finance (success green)
14. Blood Bank (coral)
15. Inventory & Procurement (warning amber)
16. HR & Staff (teal)

Each uses only brand palette colors — no external gradients.

### Scene 19: Tabeebi AI (76–83s, 210 frames)
- Standout scene — slightly different layout
- Phone mockup showing voice waveform animation
- "Tabeebi AI" in large teal text
- Three language badges (EN / AR / UR) spring in
- "Built Into Every Module" subtitle
- Animated dots simulating conversation

### Scene 20: KSA Compliance (83–87s, 120 frames)
- Four compliance badges in white cards: NPHIES, ZATCA, Wasfaty, Nafath
- "Saudi Arabia Ready" headline
- Badges spring in with stagger

### Scene 21: Closing (87–90s, 90 frames)
- Logo resolves to center
- "Start Your Free Trial" in coral accent
- Website URL fades in
- Heartbeat line traces across bottom one final time

## Technical Plan

1. **Design philosophy** → write `clinical-clarity.md` to `/mnt/documents/`
2. **Remotion project** → scaffold at `/tmp/healthos-video/`
3. **Fonts**: `@remotion/google-fonts/Inter`
4. **Scene files**: `OpeningScene.tsx`, `ProblemScene.tsx`, `ModuleScene.tsx` (reusable with props), `TabeebiScene.tsx`, `ComplianceScene.tsx`, `ClosingScene.tsx`
5. **Components**: `DashboardMockup.tsx` (white card with fake UI elements), `HeartbeatLine.tsx`, `FloatingAccents.tsx`
6. **All dashboard mockups built with divs** — rounded white cards, teal headers, list items with small colored indicators, mini bar charts as simple rectangles
7. **Render** → programmatic script to `/mnt/documents/healthos24-launch.mp4`
8. **QA** → spot-check key frames, verify no overlaps, re-render if needed

## Deliverables
- `clinical-clarity.md` — design philosophy document
- `healthos24-launch.mp4` — 90-second launch video

