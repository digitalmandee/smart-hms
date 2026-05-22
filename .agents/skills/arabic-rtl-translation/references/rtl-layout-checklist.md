# RTL Layout Checklist

Run through this every time you build or audit a screen in Arabic/Urdu mode.

## Layout primitives

- [ ] Use `ms-*` / `me-*` instead of `ml-*` / `mr-*`.
- [ ] Use `ps-*` / `pe-*` instead of `pl-*` / `pr-*`.
- [ ] Use `text-start` / `text-end` instead of `text-left` / `text-right`.
- [ ] Use `start-0` / `end-0` instead of `left-0` / `right-0`.
- [ ] For flex rows that must visually reverse, apply `flex-row-reverse` explicitly when `lang === "ar"` — do not depend on Radix `dir`.

## Directional iconography

- [ ] Arrows (`→`, `←`, `ArrowRight`, `ArrowLeft`, `ChevronRight`, `ChevronLeft`) — mirror via `rtl:rotate-180` or swap the icon.
- [ ] "Next →" / "Previous ←" buttons — swap the icon side AND the arrow direction.
- [ ] Breadcrumb separators (`>`, `/`) — usually fine, but verify spacing.

## Gradients & decorative

- [ ] `bg-gradient-to-r` becomes visually flipped — use `bg-gradient-to-l` or `rtl:bg-gradient-to-l` when the gradient anchors a left-side accent.
- [ ] Border accents (`border-l-4` on a callout) become `border-e-4` semantically; use `ltr:border-l-4 rtl:border-r-4` or switch to logical `border-s-4`.

## Components

- [ ] **Radix Select**: never set `dir="rtl"` on the trigger — let the parent boundary handle direction, and use `__none__` placeholder pattern.
- [ ] **Radix Dialog/Popover**: alignment props (`align="start"`) flip correctly under `dir`, but `side="left"` does NOT — use `side="start"` semantics manually.
- [ ] **Tooltips**: positioning is usually OK but verify with long Arabic text.
- [ ] **Progress bars / timelines / steppers**: explicitly reverse with `flex-row-reverse` and check that filled state animates from the correct edge.

## Typography

- [ ] Apply `font-arabic` (Noto Naskh/Sans Arabic) at the language boundary, not per-element.
- [ ] Line-height often needs to be 1.6–1.8 for Arabic vs 1.4–1.5 for English — bump via `leading-relaxed` on Arabic body copy.
- [ ] Numbers stay LTR even inside Arabic paragraphs — wrap with `<span dir="ltr">` if a number renders backwards.

## Forms

- [ ] Currency input prefix/suffix (SAR, ر.س) swaps sides — use logical positioning.
- [ ] Date pickers — verify Hijri toggle still works in Arabic mode (see KSA localization memory).
- [ ] Phone number inputs — keep LTR for the number, RTL for the country label.

## Export & print

- [ ] PDF/PNG/PPTX exports capture the live DOM, so Arabic mode auto-produces Arabic deliverables.
- [ ] Append `-ar` (and later `-ur`) to filenames.
- [ ] Check that page-break rules don't split Arabic words mid-character.
