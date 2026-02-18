
# Fix: Language Switcher — 3 Root Causes Found

## What's Wrong

### Issue 1 — Arabic Never Shows (All Orgs are PK)
All organizations in the database have `supported_languages: ['en', 'ur']` because they are on the Pakistan (`PK`) country preset. Arabic (`ar`) is only in the Saudi Arabia and UAE presets.

The `LanguageSwitcher` correctly reads `supported_languages` from the DB and shows only those languages — so it will only ever show English and Urdu for PK orgs.

**Fix**: The Language Settings card in `CountryRegionSettingsPage.tsx` (line 305) is also hidden for PK orgs because of this gate:
```ts
{COUNTRY_PRESETS[selectedCountry].supported_languages.includes("ar") && (
```
This means PK users can never even reach the Arabic option from Settings either.

The solution: Remove both gates and allow any org to manually add Arabic to their `supported_languages` independently of country preset — especially important for hospitals in Pakistan that serve Arabic-speaking expats or want an Arabic UI.

### Issue 2 — Language Selection Doesn't Persist
The `LanguageSwitcher` calls:
```ts
await supabase.from("organizations").update({ default_language: lang })
```
The network requests show no PATCH to `/rest/v1/organizations` happening when language is switched. This means the update is silently failing — likely **an RLS policy blocks regular users from updating the `organizations` table**. Only admins/owners can update org settings.

**Fix**: The language switch should go through a more permissive path, or alternatively use the existing `handleSaveLanguage` pattern that already works in Settings. The real fix is to check the RLS and either:
- Allow authenticated members of the org to update only `default_language` on their own org row, OR
- Add a dedicated DB function `set_org_language(lang text)` with `SECURITY DEFINER` that bypasses RLS for this one field

### Issue 3 — `handleSave` Still Overwrites Language (Line 93–94)
When any country settings are saved, the code resets `supported_languages` and `default_language` back to the preset defaults (lines 93–94):
```ts
supported_languages: preset.supported_languages,  // ['en', 'ur'] for PK
default_language: preset.default_language,         // always 'en'
```
So even if a user adds Arabic manually, saving country settings wipes it.

---

## The Fix — 3 Changes

### 1. Add a `set_org_language` DB Function (Security DEFINER)
Create a Postgres function that any authenticated org member can call to update `default_language` and `supported_languages` on their own organization — bypassing the RLS restriction that prevents regular updates.

```sql
CREATE OR REPLACE FUNCTION public.set_org_language(p_language text, p_supported_languages text[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE organizations
  SET default_language = p_language,
      supported_languages = p_supported_languages
  WHERE id = (SELECT organization_id FROM profiles WHERE id = auth.uid());
END;
$$;
```

### 2. Update `LanguageSwitcher.tsx`
Call the new RPC function instead of a direct `.update()`, and add Arabic as an always-available option that can be toggled on alongside the current country languages.

The dropdown will show all languages in `supported_languages`. If Arabic is not yet enabled, show a small "Add Arabic" option at the bottom that adds it.

Actually simpler: always show English + Arabic + the country's native language in the dropdown. Selecting one saves it. This avoids needing a separate "enable" step.

For the switcher: show all 3 languages (EN, AR, UR) but only show the ones in `supported_languages`. To enable Arabic for a PK org, go to Settings → Country & Region → Language section.

### 3. Fix `CountryRegionSettingsPage.tsx`

**3a.** Remove the Arabic gate (line 305) — show the Language card for ALL countries, not just SA/AE.

**3b.** Add Urdu as a language option in the Language card (for PK orgs).

**3c.** Remove `supported_languages` and `default_language` from `handleSave` payload (lines 93–94) so saving country settings no longer resets the language.

**3d.** In the Language card, allow selecting from all 3 languages: English, Arabic, Urdu — and also allow enabling multiple. Use the RPC function to save.

---

## Files Changed

| File | Change |
|------|--------|
| New migration | `set_org_language(lang, supported_langs)` SECURITY DEFINER RPC function |
| `src/components/LanguageSwitcher.tsx` | Use `supabase.rpc("set_org_language")` instead of direct `.update()` |
| `src/pages/app/settings/CountryRegionSettingsPage.tsx` | Remove Arabic gate; show all 3 language options; remove language fields from `handleSave`; use RPC to save |

---

## Result After Fix

- PK orgs can switch to Arabic UI by enabling it in Settings → Country & Region → Language
- KSA/UAE orgs can switch between English and Arabic directly from the navbar dropdown
- Language selection persists correctly (no more silent RLS failure)
- Saving country settings no longer resets the language preference
- The Language card in Settings shows all 3 options: English, العربية, اردو
