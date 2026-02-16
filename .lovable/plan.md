

## Rebalance Landing Page to HMS-First + Add Tabeebi Slide to Presentation

### The Problem

Right now the landing page feels like a Tabeebi product page, not an HMS product page:
- Hero headline: "Custom-Trained AI Doctor" -- Tabeebi is the star
- Hero subtitle: "Inside Your HMS" -- HMS is secondary
- Hero mockup: Tabeebi chat window
- Primary CTA: "Try Tabeebi Now"
- The entire AIFeaturesSection is Tabeebi-only with its own CTA

Meanwhile, the presentation deck (32 slides) has zero mention of Tabeebi/AI anywhere.

### What Changes

#### Landing Page -- Make HMS the Hero, Tabeebi a Feature

**File: `src/components/landing/HeroSection.tsx`**
- Change headline from "Custom-Trained AI Doctor" to something HMS-first like "Complete Hospital Management System" with a subline about 20+ modules
- Replace Tabeebi chat mockup (right side) with a more general HMS dashboard preview or a grid showing key module icons
- Change primary CTA from "Try Tabeebi Now" to "Start Free Trial" (links to /auth/signup)
- Keep a secondary smaller Tabeebi mention (e.g., "Powered by Tabeebi AI" badge) but not as the main focus
- Update the animated typewriter text to cycle through HMS value props instead of just "Custom-Trained AI Doctor"
- Keep the aiStats but rebalance: "20+ Modules", "500+ Clinics", "24/7 Available", "3 Languages"

**File: `src/components/landing/AIFeaturesSection.tsx`**
- Rename section header from "What Makes Tabeebi Different" to "Built-in Medical AI -- Tabeebi"
- Keep all the content but position it as ONE feature of the HMS, not the central product
- Remove the standalone "Try Tabeebi Free" CTA button at the bottom (the section-level CTA competes with the main product CTAs)

**File: `src/components/landing/CTASection.tsx`**
- Make "Start Free Trial" the primary CTA (not "Try Tabeebi Now")
- Keep Tabeebi as a secondary option below

**File: `src/pages/Index.tsx`**
- Move AIFeaturesSection AFTER FeaturesTabs (currently it's before ProblemSolutionSection, making it seem like the primary offering)
- Order: Hero -> TrustBadges -> ProblemSolution -> FeaturesTabs -> AIFeaturesSection -> rest

#### Presentation -- Add a Tabeebi AI Slide

**New file: `src/components/presentation/TabeebiSlide.tsx`**
- Create a dedicated slide showcasing Tabeebi as a key differentiator within the HMS
- Content: "Built-in Medical AI -- Tabeebi" as title
- Show 4 key capabilities: Trilingual Voice Consultations, Clinical Summaries for Doctors, Prescription Generation, 24/7 Patient Pre-Screening
- Include a small chat mockup visual
- Stats: "3 Languages", "50K+ Consultations", "24/7 Available"
- Position it as a competitive advantage of HealthOS 24, not a standalone product

**File: `src/pages/Presentation.tsx`**
- Import and add TabeebiSlide after the module slides (around slide 23-24, before the workflow/operational slides)
- Update TOTAL_SLIDES from 32 to 33

---

### Technical Summary

| File | Changes |
|------|---------|
| `src/components/landing/HeroSection.tsx` | Rewrite to HMS-first hero: new headline, dashboard preview instead of chat mockup, rebalanced CTAs |
| `src/components/landing/AIFeaturesSection.tsx` | Rename header, remove standalone CTA, position as feature not product |
| `src/components/landing/CTASection.tsx` | Swap primary/secondary CTA order (Free Trial first, Tabeebi second) |
| `src/pages/Index.tsx` | Move AIFeaturesSection after FeaturesTabs |
| `src/components/presentation/TabeebiSlide.tsx` | New slide: Tabeebi AI capabilities within HMS context |
| `src/pages/Presentation.tsx` | Add TabeebiSlide, update total count to 33 |

No new dependencies. No edge function changes.
