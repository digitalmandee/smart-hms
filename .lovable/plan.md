
# Fix: Language Switcher — Show All Available Languages

## Problem

The `LanguageSwitcher` component has two bugs making it invisible and non-functional:

**Bug 1 — Hard gate on Arabic (line 17):**
```ts
if (!supported_languages.includes("ar")) return null;
```
Pakistan orgs have `supported_languages: ['en', 'ur']`. Since `'ar'` is not in that list, the entire component returns `null` — the button never appears.

**Bug 2 — Binary EN↔AR toggle only (line 21):**
```ts
const newLang = default_language === "ar" ? "en" : "ar";
```
This only ever switches between English and Arabic. Urdu is ignored completely.

---

## The Fix

Replace the binary toggle button with a **dropdown menu** that lists every language in `supported_languages` and lets the user pick any of them. 

### Language Display Map
| Code | Label | Native Script |
|------|-------|---------------|
| `en` | English | EN |
| `ar` | Arabic | عربي |
| `ur` | Urdu | اردو |

### New Behavior
- **PK orgs** (`['en', 'ur']`): Dropdown shows "English" and "اردو"
- **SA/AE orgs** (`['en', 'ar']`): Dropdown shows "English" and "عربي"
- If only 1 language is supported → still hide the switcher (nothing to switch to)
- Currently active language is checked/highlighted in the dropdown
- Selecting a language saves it to `organizations.default_language` and invalidates the query (same Supabase update as before)
- Uses existing `DropdownMenu` from Radix UI (already installed)

### UI Design
A ghost button showing the current language label + globe/languages icon. On click, a dropdown opens listing all supported languages with a checkmark next to the active one.

```
[🌐 English ▾]
  ✓ English
    عربي
```

For Arabic active state:
```
[🌐 عربي ▾]
    English
  ✓ عربي
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/LanguageSwitcher.tsx` | Remove `"ar"` gate; replace binary toggle with dropdown over all `supported_languages`; add Urdu support |

No other files need changing — `DashboardLayout.tsx` already renders `<LanguageSwitcher />` in the top bar.

---

## Result

- Language switcher appears for **all organizations** with 2+ languages
- Pakistan users see EN / اردو options
- KSA/UAE users see English / عربي options
- Switching any language persists to DB and triggers RTL direction change for Arabic
