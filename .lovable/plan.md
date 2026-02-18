
# Fix: Language Switcher — Show All 3 Languages Always

## Root Cause (Confirmed by Database)

The database confirms ALL organizations have `supported_languages: ['en', 'ur']`. Arabic is never in this array because:
- The PK country preset only includes `['en', 'ur']`
- Users must manually go to Settings > Country & Region, enable Arabic, and save — most users skip this step

The `LanguageSwitcher` renders only languages present in `supported_languages`, so Arabic never appears in the navbar.

## The Simple Fix

**Remove the dependency on `supported_languages` entirely from the navbar switcher.** Always show all 3 languages (English, Arabic, Urdu) in the dropdown. When a user picks one, automatically update both `default_language` AND `supported_languages` to include it.

This eliminates the two-step flow (Settings → enable → Save → then switch) and makes the feature work out of the box.

## Changes Required

### 1. `src/components/LanguageSwitcher.tsx`

- Always render all 3 languages: `['en', 'ar', 'ur']`
- Remove the `supported_languages.length <= 1` guard (replace with a simpler check or always show)
- When switching to a language, pass the merged array so it gets added to `supported_languages` automatically:
  ```ts
  const newSupported = supported_languages.includes(lang)
    ? supported_languages
    : [...supported_languages, lang];
  await supabase.rpc("set_org_language", {
    p_language: lang,
    p_supported_languages: newSupported,
  });
  ```
- After the RPC call, await the query refetch (not just invalidate) to ensure the UI updates immediately before the spinner stops

### 2. `src/contexts/CountryConfigContext.tsx`

- After `queryClient.invalidateQueries`, the context re-fetches, but there can be a timing issue where `isSwitching` becomes `false` before the new data arrives. To fix this, use `queryClient.refetchQueries` instead of `invalidateQueries` (refetch is synchronous — it waits for completion).

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/LanguageSwitcher.tsx` | Always show all 3 languages; auto-add to supported_languages when switching; use refetchQueries for immediate update |

## Result

- Arabic always visible in navbar dropdown (no need to go to Settings first)
- Clicking Arabic → saves `default_language: 'ar'`, adds `'ar'` to `supported_languages`, flips layout to RTL
- Clicking Urdu → saves `default_language: 'ur'`, adds `'ur'` to `supported_languages`, flips layout to RTL
- Clicking English → saves `default_language: 'en'`, flips layout back to LTR
- No more two-step process through Settings
