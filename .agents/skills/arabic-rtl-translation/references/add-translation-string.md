# Adding a New Translation String

## Executive deck (runtime translator)

The deck translator matches on text node content. To add or fix a translation:

1. Find the English string as rendered in the slide component (e.g. `ExecTractionSlide.tsx`).
2. Open `src/components/executive/i18n/ar.json`.
3. Add an entry where the **key is the exact English string** (trimmed) and the **value is the Arabic translation**:

```json
{
  "Meet the Founders": "تعرّف على المؤسسين",
  "The Team": "الفريق",
  "Builders shipping clinical software for hospitals across MENA & South Asia.":
    "بنّاؤون يطلقون برامج سريرية للمستشفيات في الشرق الأوسط وجنوب آسيا."
}
```

4. No component code changes needed — the `MutationObserver` in `ExecLangBoundary` picks it up automatically on next language toggle.

### Rules

- **Exact match.** The matcher uses `node.nodeValue.trim()`. Trailing/leading whitespace inside the string matters; whitespace at the very edges is trimmed.
- **One string per text node.** If a sentence is split across `<span>`s in JSX, each span is a separate key.
- **Skip numbers, currency, dates.** Leave "SAR 1,500" or "35+" in English/Latin form unless the user explicitly wants Arabic-Indic digits.
- **Don't translate brand names.** "HealthOS 24", "Lovable Cloud", "Supabase", "ZATCA", "NPHIES" stay in English even in Arabic mode.

## Main app (react-i18next)

For non-deck UI (settings pages, clinical forms, etc.):

1. Open `src/lib/i18n/` and find the relevant namespace file.
2. Add the key in `en.json`, `ar.json`, and `ur.json` (when Urdu is set up).
3. Use `const { t } = useTranslation()` and call `t("namespace.key")`.

Do **not** mix the two systems — deck strings go in `src/components/executive/i18n/`, app strings go in `src/lib/i18n/`.
