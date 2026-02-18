
# Language Switcher End-to-End Test Results & Remaining Fixes

## Test Results from Code Audit

### Step 1: Navigate to Settings > Country & Region
- Route is `/app/settings/country` (not `/country-region`)
- The Language card is now visible for ALL organizations — Arabic, Urdu, and English toggles show
- Status: WORKING

### Step 2: Enable Arabic
- Toggle the Arabic switch ON → adds `"ar"` to `supportedLanguages` local state
- Click "Set Default" on Arabic → sets `defaultLanguage = "ar"` local state
- Click "Save Language Settings" → calls `supabase.rpc("set_org_language", { p_language: "ar", p_supported_languages: ["en", "ur", "ar"] })`
- The RPC function exists in the database and is `SECURITY DEFINER` — it should work
- Status: SHOULD WORK, but untested for the actual save because the app requires auth

### Step 3: Use Navbar Dropdown
- After save, `queryClient.invalidateQueries(["country-config", org_id])` fires
- `CountryConfigContext` re-fetches from `organizations` table
- `LanguageSwitcher` receives updated `supported_languages: ['en', 'ur', 'ar']` and `default_language: 'ar'`
- The dropdown should now show all 3 languages with Arabic checked
- Status: SHOULD WORK

### Step 4: RTL Layout
- `RTLDirectionSetter` in App.tsx: `const dir = default_language === 'ar' ? 'rtl' : 'ltr'`
- Applies `document.documentElement.dir = 'rtl'` and `document.documentElement.lang = 'ar'`
- Status: WORKS for Arabic

---

## Bugs Found

### Bug 1 — Urdu does NOT trigger RTL (minor but wrong)

**Current code in `App.tsx` line 488:**
```ts
const dir = default_language === 'ar' ? 'rtl' : 'ltr';
```
Urdu is also RTL but this only checks for Arabic. If someone sets Urdu as default, the layout stays LTR while displaying Urdu text — broken.

**Fix:** 
```ts
const dir = ['ar', 'ur'].includes(default_language) ? 'rtl' : 'ltr';
```

### Bug 2 — `useDirection()` in `src/lib/i18n/index.ts` also only checks Arabic

**Current code:**
```ts
export function useDirection(): "ltr" | "rtl" {
  const { default_language } = useCountryConfig();
  return default_language === "ar" ? "rtl" : "ltr";
}
```
Same issue — Urdu would get LTR direction. Any component using `useDirection()` or `useIsRTL()` would behave incorrectly for Urdu.

**Fix:**
```ts
return ['ar', 'ur'].includes(default_language) ? 'rtl' : 'ltr';
```

### Bug 3 — Query invalidation after language switch may not force re-render fast enough

After `switchLanguage()` in `LanguageSwitcher.tsx`, the code invalidates the `country-config` query. However, `CountryConfigContext` has `staleTime: 5 * 60 * 1000` (5 minutes). `invalidateQueries` does override stale time and triggers a background refetch, but the UI won't update until the fetch completes. This is correct behavior — no bug, just a ~200ms delay before the layout flips.

---

## Files to Fix

| File | Change |
|------|--------|
| `src/App.tsx` | Line 488: check `['ar', 'ur']` for RTL, not just `'ar'` |
| `src/lib/i18n/index.ts` | `useDirection()`: check `['ar', 'ur']` for RTL |

These are 2-line changes that make Urdu behave correctly as an RTL language, matching the description in the Settings page ("Right-to-left (RTL) layout").

---

## Overall Verdict

The Arabic language switch end-to-end flow is correctly wired:
1. Settings page shows Language card for all orgs
2. Toggle Arabic + Set Default + Save calls the correct RPC
3. RPC function exists and has `SECURITY DEFINER` to bypass RLS
4. Query invalidation triggers CountryConfigContext refresh
5. `RTLDirectionSetter` flips `document.documentElement.dir` to `rtl` for Arabic
6. `LanguageSwitcher` dropdown updates to show all enabled languages

The only gaps are the Urdu RTL issues (2 lines) which are easy to fix.
