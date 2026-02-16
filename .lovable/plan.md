

## Redesign Social Media Posts — Rich, Catchy, Module-Specific Designs

### The Problem
The current posts are too plain — just white background, small text, and a tiny icon at the bottom. They don't look like real social media marketing content. There are no visual elements that represent each module, no feature highlights, and no visual energy.

### The New Design
Each 1080x1080 card will be a visually rich, module-specific design with filled colored sections, feature bullets, large prominent icons, and proper social media visual impact.

### New Card Layout (1080x1080)

```text
+--------------------------------------------------+
| [========== colored top bar 8px ============]     |
|                                                   |
|  [24 logo]  HealthOS          [Module pill]       |
|                                                   |
|     +------------------------------------+        |
|     |                                    |        |
|     |    [LARGE ICON - 120px]            |        |
|     |    in filled colored circle        |        |
|     |    (200px, 15% opacity bg)         |        |
|     |                                    |        |
|     +------------------------------------+        |
|                                                   |
|  Large Bold Hook Text                             |
|  in Dark Slate Color                              |
|                                                   |
|  Supporting subtext in muted gray                 |
|                                                   |
|  +----------------------------------------------+ |
|  | [colored left border section]                 | |
|  |  * Feature highlight 1                        | |
|  |  * Feature highlight 2                        | |
|  |  * Feature highlight 3                        | |
|  +----------------------------------------------+ |
|                                                   |
|  [Colored bottom strip with healthos.com]         |
+--------------------------------------------------+
```

### Key Visual Improvements

1. **Large centered icon area** — A prominent 200px colored circle with a large 100px icon inside, giving each module a visual identity
2. **Feature highlights section** — 3 key features per module post displayed as bullet points with colored dots, making the post informative
3. **Filled colored bottom strip** — A 80px footer bar in the brand color with white "healthos.com" text, adding visual weight
4. **Bigger decorative elements** — Larger gradient circles at 8-10% opacity for visual depth
5. **Module-specific features** — Each of the 30 posts gets 3 relevant feature bullets added to the data

### Data Model Changes

**File: `src/components/social/socialPostsData.ts`**

Add a `features` array (3 strings) to each post for the feature highlights section:

```
interface SocialPost {
  id: number;
  hook: string;
  subtext: string;
  category: PostCategory;
  icon: LucideIcon;
  brandColor: string;
  module?: string;
  features: string[];  // NEW - 3 key highlights
}
```

Example feature data per post:
- Post 1 (Patients): ["CNIC Auto-Fill", "QR Code Check-in", "Family Linking"]
- Post 2 (Appointments): ["Live Token Display", "SMS Reminders", "Online Booking"]
- Post 5 (Pharmacy): ["Batch Tracking", "Expiry Alerts", "Auto Reorder"]
- Post 11 (Tabeebi): ["24/7 Available", "Urdu + English", "AI Triage"]
- Post 16 (OPD Flow): ["6-Step Process", "15 Min Average", "Zero Paper"]
- Post 21 (Stats): ["3x Faster", "AI Pre-screening", "Real-time Data"]
- Post 26 (Brand): ["Built for Pakistan", "CNIC Integration", "PKR Currency"]
- ...and so on for all 30 posts

### Card Component Redesign

**File: `src/components/social/SocialPostCard.tsx`**

The card will be completely restructured with these sections:

1. **Top bar** (8px) — solid brand color
2. **Header row** — Logo "24" badge + "HealthOS" + Module pill (same as now but refined)
3. **Hero icon section** — Large 200px circle with 15% opacity brand color background, containing a 100px icon in brand color. This is the visual centerpiece
4. **Hook text** — 64px extrabold in slate-900
5. **Subtext** — 28px in slate-500
6. **Feature highlights** — A left-bordered section with 3 bullet points (colored dot + text), background uses 5% brand color
7. **Bottom strip** — 80px tall filled bar in brand color with white "healthos.com" text and white HealthOS logo

### Color Map Update
Extend the existing colorMap to include:
- `heroBg`: light fill for the icon circle (15% opacity equivalent)
- `featureBg`: very light background for the feature section
- `featureBorder`: left border color for the feature section
- `bottomBar`: same as the main brand color for the footer strip

### Files to Change

| File | What Changes |
|------|-------------|
| `src/components/social/socialPostsData.ts` | Add `features: string[]` to interface and all 30 posts |
| `src/components/social/SocialPostCard.tsx` | Complete card redesign with hero icon, feature highlights, and bottom strip |
| `src/pages/SocialMediaPosts.tsx` | No changes needed |

### No New Dependencies
Uses existing `html-to-image`, `lucide-react`, and inline styles for the 1080px canvas.
