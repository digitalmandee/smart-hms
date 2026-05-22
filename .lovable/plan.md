# Arabic version of the Executive Investor Presentation

## Goal
Make the investor deck fully available in Arabic with proper RTL layout, accessible from the same `/executive-presentation` route via a language toggle (EN ⇄ AR). Same content, same 20 + 14 appendix slides — just translated and mirrored.

## Approach

Rather than duplicating all 35 slide components (~3,700 lines), introduce a lightweight **deck-local language context** with inline translation dictionaries per slide. This keeps each slide self-contained and easy to edit, while avoiding a parallel `*SlideAr.tsx` tree.

### 1. Deck language context
- New `src/components/executive/ExecLangContext.tsx` exporting:
  - `ExecLangProvider` (holds `lang: 'en' | 'ar'`, persists to `localStorage`)
  - `useExecLang()` → `{ lang, setLang, dir, t }`
  - `t(en, ar)` helper: returns the right string based on current `lang`
- Scoped to the presentation only — does NOT touch the app-wide `useTranslation` / `CountryConfigContext` (those drive the live HMS product in en/ar/ur).

### 2. Language toggle in the deck toolbar
- Add an EN / ع pill toggle next to the existing Print / Download buttons in `ExecutivePresentation.tsx`.
- Wrap the slides container in `<div dir={dir} className={lang==='ar' ? 'font-arabic' : ''}>` so RTL flips layout automatically.
- Toolbar itself stays LTR for predictability.

### 3. Per-slide translation
For each of the 35 slide components:
- Import `useExecLang`.
- Replace hard-coded English strings with `t('English text', 'النص العربي')` inline.
- Numbers/SAR figures stay as-is. Labels, headings, body copy, bullet points, CTAs get translated.
- For grid/flex layouts that have implicit direction (arrows, "→"), swap the icon or use logical CSS (`ms-`/`me-`, `start`/`end`) where needed. Most slides already use `gap` + `grid` so they flip cleanly under `dir="rtl"`.

### 4. Arabic typography
- Add a webfont (Noto Naskh Arabic or IBM Plex Sans Arabic via Google Fonts `<link>` in `index.html`).
- Tailwind utility `font-arabic` mapped in `tailwind.config.ts`:
  ```ts
  fontFamily: { arabic: ['"Noto Naskh Arabic"', 'system-ui', 'sans-serif'] }
  ```

### 5. PDF / PNG / PPTX export
- Existing export logic in `ExecutivePresentation.tsx` captures the live DOM via `html-to-image` → it will pick up whatever language is currently active. So "Download PDF" in Arabic mode produces an Arabic deck automatically. No export-pipeline changes needed beyond ensuring the Arabic font is loaded before capture.
- File names get a `-ar` suffix when `lang === 'ar'` (e.g. `Smart-HMS-Investor-Deck-ar.pdf`).

## Out of scope
- No changes to the live product UI translation system (`src/lib/i18n`).
- No Urdu version of the deck (can be added later by extending `t()` to a 3-arg form).
- No translation of charts/screenshots embedded as images.

## Technical notes
- All translation strings live next to the JSX they describe — easy to proof-read with the user slide-by-slide.
- Total touch surface: ~35 slide files + 1 new context + 1 toolbar edit + `tailwind.config.ts` + `index.html` font link.
- Arabic translation will be done by me; I'll deliver in one pass and we iterate on copy slide-by-slide if the user wants polishing.

## Deliverable order
1. Context + toolbar toggle + RTL wrapper + Arabic font (infra).
2. Translate the 20 core slides.
3. Translate the 14 appendix slides.
4. User reviews; we refine copy where needed.
