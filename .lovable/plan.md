

# Highlight Multilingual Support (No Switcher)

## What the User Wants
Simply highlight/badge that HealthOS 24 supports 3 languages (English, Urdu, Arabic) as a feature — no actual language switching or translations needed.

## Changes

### Where to Add Language Highlights

1. **`ExecTabeebiSlide.tsx`** — Already mentions trilingual AI. Add a visual badge row showing 🇬🇧 English · 🇸🇦 عربي · 🇵🇰 اردو with flag-style chips to emphasize multilingual capability.

2. **`ExecTechSlide.tsx`** — Add a 9th tech feature card: `{ icon: Globe, title: "Trilingual Interface", desc: "Full system available in English, Arabic & Urdu with RTL support." }` (or replace an existing one to keep the 4×2 grid).

3. **`ExecAllInOneSlide.tsx`** — Add a small "Available in 3 Languages" badge near the bottom or alongside the hub diagram.

4. **`ExecWhyUsSlide.tsx`** — Add "Trilingual Support" as one of the differentiator cards showing EN/AR/UR language support.

5. **`ExecTitleSlide.tsx`** — Add a subtle language badge row (EN | عربي | اردو) near the stats bar or tagline area.

### No Changes Needed
- No translation files
- No language context
- No switcher UI
- No RTL layout logic

### Files to Edit (5)
- `src/components/executive/ExecTitleSlide.tsx` — Add language badge
- `src/components/executive/ExecTabeebiSlide.tsx` — Enhance trilingual visual
- `src/components/executive/ExecTechSlide.tsx` — Add/update multilingual card
- `src/components/executive/ExecAllInOneSlide.tsx` — Add language badge
- `src/components/executive/ExecWhyUsSlide.tsx` — Add trilingual differentiator

