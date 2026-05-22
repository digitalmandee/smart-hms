---
name: investor-deck-editing
description: Conventions for editing the HealthOS executive/investor presentation deck — slide component structure, the Exec language context (EN/AR/UR), tone rules (functional descriptive, no buzzwords), adding or reordering slides without breaking pagination, and print/PDF export. Load when editing any file under src/components/executive/, src/pages/ExecutivePresentation.tsx, src/pages/Presentation.tsx, or when the user mentions the investor deck, pitch deck, executive presentation, or slides.
---

# Investor Deck Editing

## Where the deck lives

- **Main route container**: `src/pages/ExecutivePresentation.tsx`
  - Constants: `TOTAL_SLIDES = 20` core, `APPENDIX_SLIDES = 14`. Update both when adding/removing slides.
  - Print/PDF export iterates `.slide` class within `printContainerRef`. Every slide root must carry `className="slide ..."`.
- **Slides**: `src/components/executive/Exec*Slide.tsx` (one component per slide).
- **i18n**: `src/components/executive/i18n/ExecLangContext.tsx` + `ar.json` (and Urdu equivalent — add `ur.json` if missing when shipping Urdu strings).
- **Other decks**: `src/pages/Presentation.tsx`, `src/pages/PharmacyWarehousePresentation.tsx` follow the same pattern but have their own slide counts.

## Three languages — always

Project rule: **English, Arabic, Urdu**. Every user-visible string added to a slide must:

1. Go through the Exec language context (`useExecLang()` / `t()`), not be hardcoded.
2. Have entries in **all three** locale JSON files. Missing keys silently fall back and look broken in production.
3. For Arabic, respect RTL rules from the `arabic-rtl-translation` skill (use `flex-row-reverse` + `text-end`, never rely on Radix `dir`).

## Tone and copy (hard rule)

- **Functional, descriptive language.** Say what the product does.
- **Banned**: "CFO-grade", "CFO-ready", "enterprise-grade", "world-class", "best-in-class", "next-gen", "revolutionary", "AI-powered" (as filler), "unlock", "supercharge", "seamless".
- Replace buzzwords with the concrete capability. Example: not "CFO-grade reporting" — "Daily P&L, GL drilldown, multi-branch consolidation."
- Numbers and proof beat adjectives. If a slide has a claim, back it with a metric or screenshot.

## Adding or reordering slides

1. Create `ExecYourSlide.tsx` under `src/components/executive/`. Root element must have `className="slide ..."`.
2. Add it to the slide array/JSX in `ExecutivePresentation.tsx` at the desired index.
3. **Bump `TOTAL_SLIDES`** (or `APPENDIX_SLIDES` for appendix slides). The footer ("X core slides + Y appendix") reads from these.
4. Add all copy keys to `ar.json`, `ur.json`, and the EN source.
5. Test print mode — slides paginate one-per-page; oversized content overflows silently.

## Slide component conventions

- Use existing semantic tokens from `index.css` and `tailwind.config.ts`. **No raw colors** (`text-white`, `bg-black`).
- Motion: Framer Motion is fine for entrance animations. Don't add heavy continuous animation — it tanks print export and screen recording.
- Images/assets: import from `src/assets/`. Aspect-ratio-locked containers prevent layout shift between languages.
- Keep one H1 per slide for SEO/accessibility.

## Print / PDF export

- The print flow queries `.slide` nodes inside `printContainerRef` and renders each as a page.
- Anything position-absolute outside the slide bounds will clip in PDF.
- Test export in both LTR (EN/UR-LTR... wait, Urdu is RTL too) and RTL after non-trivial changes.

## See also

- `arabic-rtl-translation` — RTL layout, Radix dir bypass, font rules, adding a locale
- `mem://style/branding-preferences` — tone enforcement
