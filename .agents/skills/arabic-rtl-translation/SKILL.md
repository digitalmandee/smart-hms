---
name: arabic-rtl-translation
description: Trilingual (English / Arabic / Urdu) and RTL conventions for HealthOS 24 — covers the executive deck runtime translation system (ExecLangContext + ar.json MutationObserver), the app-wide i18n location, Radix RTL bypass via flex-row-reverse, the __none__ Select placeholder, Arabic/Urdu font families, and how to add a new language. Apply whenever editing UI copy, adding strings, working on RTL layout, or editing the executive presentation.
---

# Arabic / Urdu / RTL Conventions

**Project rule:** every user-facing surface must work in **English, Arabic, and Urdu**. Numbers, currency amounts, and ZATCA-style identifiers stay as-is.

## 1. Two translation systems — know which

| Surface | System | Files |
|---|---|---|
| Main app (settings, clinical, finance, HR…) | `react-i18next` style | `src/lib/i18n/` |
| Executive investor deck | Deck-local runtime translator | `src/components/executive/i18n/` |

Do not cross-wire them. The deck system runs a `MutationObserver` over the rendered DOM and hot-swaps English text nodes — adding deck strings to the app i18n won't translate the slides, and vice versa.

## 2. Executive deck — adding new copy

The deck uses an `ExecLangProvider` + `ExecLangBoundary` pattern. New English strings are auto-extractable: just add them to `ar.json` (and later `ur.json`).

See `references/add-translation-string.md` for the exact steps.

Key rules:
- Keep numbers/currency/SAR figures in source verbatim — don't translate them.
- Match the English source key **exactly** including punctuation and whitespace (the matcher uses `nodeValue.trim()`).
- Don't wrap deck slides with `t()` calls — the MutationObserver handles it.

## 3. RTL — bypass Radix `dir` bugs

Radix UI has long-standing bugs with the `dir` attribute (Select dropdowns flip wrong, popovers misalign). **Do not rely on `<div dir="rtl">` alone for layout** — use Tailwind logical utilities and explicit reversals:

```tsx
// ❌ Avoid relying on dir alone
<div dir={lang === "ar" ? "rtl" : "ltr"} className="flex">

// ✅ Explicit reversal + logical text alignment
<div className={cn("flex", isRtl && "flex-row-reverse text-end")}>
```

Use `ms-*` / `me-*` (margin-start/end) instead of `ml-*` / `mr-*`. Use `text-start` / `text-end` instead of `text-left` / `text-right`. Use `ps-*` / `pe-*` for padding.

Sidebar layout: the project's main sidebar uses `flex-row-reverse` + `text-end` explicitly — do not "fix" this back to `dir`.

## 4. Radix Select empty value pattern

Radix Select rejects `value=""`. Use the project-wide sentinel `"__none__"`:

```tsx
<Select
  value={form.doctor_id || "__none__"}
  onValueChange={(v) => setForm({ ...form, doctor_id: v === "__none__" ? "" : v })}
>
  <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="__none__">No doctor</SelectItem>
    {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
  </SelectContent>
</Select>
```

Then at the DB boundary, map `""` → `null` (see `supabase-patterns` skill).

## 5. Fonts

Loaded in `index.html` via Google Fonts and mapped in `tailwind.config.ts`:

| Language | Family | Tailwind class |
|---|---|---|
| English (default) | Inter / project default | `font-sans` |
| Arabic | Noto Naskh Arabic (body), Noto Sans Arabic (UI) | `font-arabic` |
| Urdu | Noto Nastaliq Urdu | `font-urdu` *(add when shipping Urdu)* |

Apply at the language boundary, not per-component:

```tsx
<div className={cn(lang === "ar" && "font-arabic", lang === "ur" && "font-urdu")}>
```

## 6. Adding Urdu — mirror the Arabic infra

The Arabic system is the template. To add Urdu to the deck:

1. Create `src/components/executive/i18n/ur.json` (same keys as `ar.json`, Urdu values).
2. Extend `ExecLangContext` `lang` type to `"en" | "ar" | "ur"` and load `ur.json` alongside `ar.json`.
3. Add "اردو" option to the toolbar pill (next to EN / عربي).
4. Add `font-urdu` class application in `ExecLangBoundary` for `lang === "ur"`.
5. Add Noto Nastaliq Urdu to `index.html` and `tailwind.config.ts`.
6. PDF/PNG export filename suffix: `-ur`.

For the main app, mirror whatever pattern `src/lib/i18n/` uses — read it first before extending.

## 7. RTL pitfalls checklist

See `references/rtl-layout-checklist.md` — arrows (`→` becomes `←`), gradient directions, chevrons, progress bars, and timeline components all need attention.
