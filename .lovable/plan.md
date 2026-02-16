

## Redesign Social Media Posts with Module UI Mockups

### The Problem
The current social media posts are too plain -- they only show an icon in a circle with text. They don't showcase what each module actually looks like. The landing page already has rich, interactive UI mockups for every module (Patient Registration forms, Pharmacy Dispensing screens, Lab Queues, etc.) and the social posts should feature these same mockups.

### The Solution
Replace the generic icon-in-circle hero section with **actual module UI mockups** -- the same ones already used on the landing page. Each post will show a scaled-down version of the module's real interface, making posts look like proper product marketing content.

### New Card Layout (1080x1080)

```text
+--------------------------------------------------+
| [========== colored top bar 10px ===========]     |
|                                                   |
|  [24 logo]  HealthOS          [Module pill]       |
|                                                   |
|  Large Bold Hook Text                             |
|  in Dark Slate Color                              |
|                                                   |
|  +----------------------------------------------+ |
|  |                                               | |
|  |   [MODULE UI MOCKUP - scaled from            | |
|  |    ProductScreenshots.tsx]                    | |
|  |   Patient Registration form / Pharmacy       | |
|  |   Dispensing / Lab Queue / etc.              | |
|  |                                               | |
|  +----------------------------------------------+ |
|                                                   |
|  Supporting subtext in muted gray                 |
|                                                   |
|  [Colored bottom strip with healthos.com]         |
+--------------------------------------------------+
```

### Key Changes

1. **Module UI mockups** replace the plain icon circle -- each module post (posts 1-10) gets its corresponding screen component from `ProductScreenshots.tsx`, scaled up with inline styles to fill the 1080px canvas properly
2. **AI/Tabeebi posts** (11-15) get a custom AI chat mockup or Tabeebi-specific screen
3. **Workflow posts** (16-20) get a flow/process visual with step indicators
4. **Stats posts** (21-25) get dashboard-style stat cards with big numbers
5. **Brand posts** (26-30) get the module grid overview (like the hero section)
6. **Hook text moves above the mockup** for immediate attention
7. **Subtext moves below the mockup** as supporting context

### Screen-to-Post Mapping

| Post # | Module | Screen Component |
|--------|--------|-----------------|
| 1 | Patients | PatientRegistrationScreen |
| 2 | Appointments | AppointmentScreen |
| 3 | OPD + Tabeebi | DoctorDashboardScreen |
| 4 | Emergency | EmergencyScreen |
| 5 | Pharmacy | PharmacyScreen |
| 6 | Laboratory | LabScreen |
| 7 | Operation Theatre | OTScreen |
| 8 | IPD | IPDScreen |
| 9 | Accounts | AccountsScreen |
| 10 | Procurement | ProcurementScreen |
| 11-15 | AI / Tabeebi | Custom AI chat mockup |
| 16-20 | Workflows | Custom step-flow visual |
| 21-25 | Stats | Custom stat dashboard |
| 26-30 | Brand | Module grid overview |

### Technical Approach

Since the existing screen components use Tailwind CSS classes (which won't render inside the 1080px inline-style canvas used for PNG export), we need to create **new inline-style versions** of each module mockup specifically for the social media cards. These will be built as pure inline-styled divs that render correctly in `html-to-image`.

### Data Model Update

**File: `src/components/social/socialPostsData.ts`**
- Add a `screenType` string field to each post (e.g., `"patients"`, `"pharmacy"`, `"lab"`)
- This maps to the corresponding mockup renderer in the card component

### Files to Change

| File | What Changes |
|------|-------------|
| `src/components/social/socialPostsData.ts` | Add `screenType` field to interface and all 30 posts |
| `src/components/social/SocialPostCard.tsx` | Replace icon circle with inline-styled module UI mockups; create mockup renderers for all categories |

### No New Dependencies
Uses existing `html-to-image` and `lucide-react`. All mockups are pure HTML/inline styles for reliable PNG export.

