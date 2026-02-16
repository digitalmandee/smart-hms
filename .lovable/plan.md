

## Fix Mobile Edge-to-Edge Spacing - Increase Padding

### Problem
The current `px-5` (20px) mobile padding is too tight -- content still feels like it's touching the screen edges. Need more breathing room on mobile screens.

### Fix
Increase mobile padding from `px-5` (20px) to `px-6` (24px) and tablet padding from `sm:px-6` (24px) to `sm:px-8` (32px) across ALL landing page containers. This gives noticeably more breathing room on both mobile and tablet.

**Change pattern in every file:**
```
px-5 sm:px-6 lg:px-4  -->  px-6 sm:px-8 lg:px-4
```

### Files to Update (15 files, one line each)

| File | Line |
|------|------|
| `src/components/landing/Navbar.tsx` | Line 31 |
| `src/components/landing/HeroSection.tsx` | Line 66 |
| `src/components/landing/TrustBadges.tsx` | Line 14 |
| `src/components/landing/ProblemSolutionSection.tsx` | Line 34 |
| `src/components/landing/FeaturesTabs.tsx` | Line 219 |
| `src/components/landing/AIFeaturesSection.tsx` | Line 58 |
| `src/components/landing/WorkflowDiagram.tsx` | Line 54 |
| `src/components/landing/ProcurementCycleDiagram.tsx` | Line 80 |
| `src/components/landing/WarehouseSection.tsx` | Line 51 |
| `src/components/landing/RoleSelector.tsx` | Line 167 |
| `src/components/landing/ComparisonTable.tsx` | Line 263 |
| `src/components/landing/TestimonialsSection.tsx` | Line 40 |
| `src/components/landing/FAQSection.tsx` | Line 37 |
| `src/components/landing/CTASection.tsx` | Line 13 |
| `src/components/landing/Footer.tsx` | Line 35 |

### Result
- Mobile: 24px side padding (was 20px) -- 20% more breathing room
- Tablet: 32px side padding (was 24px) -- 33% more breathing room
- Desktop: unchanged (container max-width handles spacing)

