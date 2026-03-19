

# HealthOS 24 Launch Video V2 — Complete Rewrite

## Problems in V1

1. **Emoji icons render as blank rectangles** in headless Chromium — ProblemScene uses emoji, ModuleScene has no module-specific icons at all (just colored dots)
2. **Sparse, empty layouts** — DashboardMockup is a single white card with 3 stat boxes and 4 bullet points floating in 1920x1080 space
3. **Zero visual variety** — all 16 modules use identical ModuleScene layout (left text + right card), repeated 16 times
4. **Weak dashboard mockups** — no charts, no sidebar nav, no tables, no realistic UI elements
5. **No background music** — render uses `muted: true`, no audio track
6. **No SVG icons** — modules have no visual identity beyond accent color

## V2 Redesign Strategy

### Duration: 90 seconds (2700 frames @ 30fps)

Since 90s exceeds the 600s render timeout at full concurrency, we will render with `concurrency: 1` and accept a longer render. If it times out, we trim to 60s (1800 frames).

### Background Music

Generate a royalty-free ambient corporate track using a simple approach:
- Use `Audio` component from Remotion with a free CC0 corporate background track downloaded via curl
- Remove `muted: true` from render script
- If audio encoding fails (sandbox ffmpeg lacks libfdk_aac), fall back to muted render and note this

### SVG Icon System (replacing all emoji)

Create `src/components/SVGIcons.tsx` with 16+ inline SVG icon components:
- User (patient), Calendar (appointments), Stethoscope (OPD), Ambulance (emergency), Scissors (OT), Bed (IPD), HeartPulse (nursing), Flask (lab), Scan (radiology), Pill (pharmacy), Receipt (POS), CreditCard (billing), Book (accounts), Droplet (blood bank), Box (inventory), Users (HR)
- Each icon: simple 2-color SVG path, 24x24 viewBox, accepts `color` prop

### Three Module Layout Variants (rotated A/B/C)

Instead of one `ModuleScene.tsx` repeated 16 times:

**Layout A — "Full Dashboard"** (modules 1, 4, 7, 10, 13, 16)
- Full-width dashboard mockup filling ~80% of frame
- Left sidebar with 5 nav items (active indicator on current module)
- Top header bar with module name + search box mockup
- 4 stat cards in a row with animated progress bars + sparklines
- Below: a mini bar chart (8 bars growing with stagger) + a data table (5 rows, 4 columns)
- Module SVG icon large in sidebar header

**Layout B — "Split Feature"** (modules 2, 5, 8, 11, 14)
- Left 55%: Large SVG icon (120px) + module name + 6 feature rows with checkmark SVGs + accent line
- Right 45%: Tablet/phone mockup frame containing a mini-dashboard with donut chart + 3 metric cards
- Asymmetric layout, features stagger in from left, device slides in from right

**Layout C — "Metric Grid"** (modules 3, 6, 9, 12, 15)
- Module name big at top-left with accent underline
- 6-card grid (3x2) filling the frame, each card has: SVG icon, metric value (animated counter), label, and a mini sparkline (SVG polyline with animated stroke)
- Cards spring in with varied delays, creating a wave effect

### Rich Dashboard Components

New files in `src/components/`:

- **`SVGIcons.tsx`** — 16 module SVG icons as React components
- **`MiniBarChart.tsx`** — 6-8 bars, heights from data array, grow up with stagger using `interpolate`
- **`MiniLineChart.tsx`** — SVG polyline sparkline, stroke-dashoffset animation
- **`DonutChart.tsx`** — SVG circle with animated `stroke-dashoffset`, center label
- **`DataTable.tsx`** — 5 rows, 4 columns, zebra stripes, rows fade in with stagger
- **`SidebarNav.tsx`** — vertical nav with 5 items, active pill indicator
- **`StatusBadge.tsx`** — colored pill badges ("Active", "Pending", "Critical")

### Enhanced Non-Module Scenes

**OpeningScene** (0-5s, 150 frames):
- Grid of 16 module SVG icons starts scattered (random positions) and assembles into a 4x4 grid
- Logo "24" SVG draws in center with stroke animation
- "HealthOS" text springs in, "Smart Hospital Management" fades up
- Heartbeat SVG line traces across bottom

**ProblemScene** (5-9s, 120 frames):
- "20+ Departments. One Platform." — large kinetic type
- Replace emoji grid with SVG icon grid
- Icons start dim/scattered, then slide together into a unified dashboard frame wireframe
- Frame border draws in via stroke animation

**TabeebiScene** (76-83s, 210 frames):
- Left: "Tabeebi" large teal text + "Your Digital Medical Assistant" + 3 language badges
- Right: Phone mockup with chat bubbles (not just waveform)
  - Chat bubble 1: "What are the symptoms?" (appears with typewriter effect)
  - Chat bubble 2: response with 3 symptom items
  - Waveform bars below (already working, keep)
- Add conversational dots animation

**ComplianceScene** (83-87s, 120 frames):
- Replace checkmark-only badges with larger cards containing SVG shield/document icons
- Add Saudi Arabia map outline (simple SVG path) as background element
- Badges larger (280px wide), more visual weight
- "Saudi Arabia Ready" with animated underline

**ClosingScene** (87-90s, 90 frames):
- Animated stat counters: "20+ Modules" / "50+ Features" / "3 Languages" counting up
- Logo resolve with subtle scale bounce
- "healthos24.com" + "24/7 Smart Hospital Management"

### Module Data Enhancement

Expand `moduleData.ts`:
- 6 features per module (up from 4)
- 4 stats per module (up from 3)
- Add `iconKey` field to map to SVG icon component
- Add `chartData` array (6-8 numbers) for bar/line charts
- Add `tableRows` (5 rows of mock data) for Layout A

### Motion System

- **Default enter**: Spring slide-up (`damping: 20, stiffness: 200`) + opacity fade
- **Accent enter**: Scale spring with slight overshoot (`damping: 12`)
- **Dashboard build**: Piece-by-piece — sidebar first (frame 0), then header (frame 8), then cards (stagger 6 frames each), then chart (frame 30), then table rows (stagger 4 frames)
- **Transitions**: Rotate between `wipe(from-left)`, `slide(from-right)`, `fade()` — 3 types cycling
- **Progress bar**: Persistent bottom bar showing video progress across all scenes

### Background Music Approach

1. Download a free CC0 ambient corporate loop (e.g., from Pixabay free music API or a direct URL)
2. Place in `public/audio/bg-music.mp3`
3. Add `<Audio src={staticFile('audio/bg-music.mp3')} volume={0.15} />` in MainVideo.tsx as persistent layer
4. Remove `muted: true` from render script
5. If audio encoding fails, render muted and note limitation

### File Changes Summary

```
src/
  components/
    SVGIcons.tsx          (NEW - 16 module SVG icons)
    MiniBarChart.tsx       (NEW - animated bar chart)
    MiniLineChart.tsx      (NEW - animated sparkline)
    DonutChart.tsx         (NEW - animated donut)
    DataTable.tsx          (NEW - animated table)
    SidebarNav.tsx         (NEW - sidebar nav mockup)
    StatusBadge.tsx        (NEW - colored pill badges)
    DashboardMockup.tsx    (REWRITE - richer, used by Layout A)
    FloatingAccents.tsx    (KEEP)
    HeartbeatLine.tsx      (KEEP)
  scenes/
    OpeningScene.tsx       (REWRITE - SVG icons grid assembly)
    ProblemScene.tsx        (REWRITE - SVG icons, frame wireframe)
    ModuleSceneA.tsx       (NEW - full dashboard layout)
    ModuleSceneB.tsx       (NEW - split feature layout)
    ModuleSceneC.tsx       (NEW - metric grid layout)
    ModuleScene.tsx        (DELETE)
    TabeebiScene.tsx       (REWRITE - chat bubbles, richer)
    ComplianceScene.tsx    (REWRITE - larger badges, map SVG)
    ClosingScene.tsx       (REWRITE - stat counters)
  moduleData.ts            (REWRITE - 6 features, 4 stats, iconKey, chartData)
  MainVideo.tsx            (REWRITE - alternate A/B/C layouts, audio layer)
  Root.tsx                 (KEEP)
  theme.ts                 (KEEP)
  fonts.ts                 (KEEP)
  index.ts                 (KEEP)
scripts/
  render.mjs               (UPDATE - remove muted:true if audio works)
public/
  audio/bg-music.mp3       (NEW - downloaded CC0 track)
```

### Render Strategy

1. Write all files
2. Download a CC0 music track via curl
3. Render with audio enabled (`muted: false`)
4. If audio fails, fall back to `muted: true`
5. Output to `/mnt/documents/healthos24-launch-v2.mp4`
6. QA key frames with `bunx remotion still`

