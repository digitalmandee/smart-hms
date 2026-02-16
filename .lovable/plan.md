

## Fix Mobile Padding - Remove Conflicting Padding Overrides

### Root Cause Found

The Tailwind config at `tailwind.config.ts` line 10 defines:
```
container: {
  center: true,
  padding: "2rem",   // = 32px on ALL breakpoints
}
```

This means every `container` div already gets **32px** horizontal padding by default. But the recent changes added `px-6 sm:px-8 lg:px-4` which **overrides and reduces** the padding:
- Mobile: `px-6` = 24px (DOWN from 32px -- making it WORSE)
- Tablet: `sm:px-8` = 32px (same as default)
- Desktop: `lg:px-4` = 16px (DOWN from 32px)

Each change we made was actually fighting against the built-in container padding.

### The Fix

**Remove all explicit `px-*` classes** from containers that use the `.container` class. The container's built-in `padding: 2rem` (32px) will provide consistent, generous spacing on all screen sizes.

Change pattern in every file:
```
container mx-auto px-6 sm:px-8 lg:px-4  -->  container mx-auto
```

### Files to Update (15 files)

| File | Line |
|------|------|
| `src/components/landing/Navbar.tsx` | ~Line 31 |
| `src/components/landing/HeroSection.tsx` | Line 66 |
| `src/components/landing/TrustBadges.tsx` | Line 14 |
| `src/components/landing/ProblemSolutionSection.tsx` | Line 34 |
| `src/components/landing/FeaturesTabs.tsx` | ~Line 219 |
| `src/components/landing/AIFeaturesSection.tsx` | ~Line 58 |
| `src/components/landing/WorkflowDiagram.tsx` | Line 54 |
| `src/components/landing/ProcurementCycleDiagram.tsx` | Line 80 |
| `src/components/landing/WarehouseSection.tsx` | ~Line 51 |
| `src/components/landing/RoleSelector.tsx` | ~Line 167 |
| `src/components/landing/ComparisonTable.tsx` | Line 263 |
| `src/components/landing/TestimonialsSection.tsx` | ~Line 40 |
| `src/components/landing/FAQSection.tsx` | ~Line 37 |
| `src/components/landing/CTASection.tsx` | Line 13 |
| `src/components/landing/Footer.tsx` | Line 35 |

Also clean up `src/App.css`: remove the `#root` styles (`max-width: 1280px`, `padding: 2rem`, `text-align: center`) which are leftover Vite boilerplate and can interfere with layout.

### Result
- Mobile: 32px side padding (was being reduced to 24px)
- Tablet: 32px side padding (consistent)
- Desktop: 32px side padding (was being reduced to 16px)
- Clean, consistent spacing managed by one config value
