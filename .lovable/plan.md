# Rebrand Native App → HealthOS 24

## Goal
The installed Android/iOS build currently shows "smart-hms" under its launcher icon. Rename it to **HealthOS 24** and use the same gradient **"24" heartbeat mark** from the landing page (`HealthOS24Logo`) as the app icon and splash logo, so the phone home-screen matches the web brand.

## Changes

### 1. Capacitor app name
- `capacitor.config.ts` → `appName: 'HealthOS 24'`
- `capacitor.config.dev.ts` → `appName: 'HealthOS 24'`

(`appId` stays the same — changing it would orphan existing installs and break OAuth redirects.)

### 2. New icon source (1024×1024 PNG)
Generate `resources/icon.png` from the same visual as `HealthOS24Logo`:
- Rounded-square background, cyan gradient (`#0891b2 → #0e7490`)
- White bold **"24"** centered, tight letter-spacing
- White heartbeat line under the digits
- Subtle inner highlight stroke for the glass effect

Tool: `imagegen` (premium tier, transparent_background=false) at 1024×1024, saved to `resources/icon.png`. Overwrites the existing placeholder.

### 3. New splash source (1920×1920 PNG)
Generate `resources/splash.png`:
- Solid `#0891b2` background
- Centered "24" mark (~512px) — same gradient tile
- "HealthOS" wordmark under it in white

Saved to `resources/splash.png`.

### 4. QA + scripts text
- `scripts/qa-mobile-checklist.md` line 11 → update expected app name to **"HealthOS 24"**.
- Leave `scripts/build-mobile.md` deep-link example URL alone (it's the published web domain, unrelated to app name).

### 5. Regenerate native assets (user-side step, documented only)
After they `git pull` they must run:
```bash
npm install
npm run assets:generate   # rewrites mipmap-* + AppIcon.appiconset + Splash.imageset
npx cap sync
```
Then `npx cap run android` / `ios`. This is already covered by `resources/README.md`; no edit needed there.

## Out of scope (not touched in this pass)
- `SystemOverview.tsx`, `TestCasesPage.tsx`, FHIR `software.name`, CORS allowlist, `PrintableLabReport` QR URL, `super-admin` page description — these are internal/web copy or backend identifiers, not the installed app label. Happy to rename in a follow-up if you want a full sweep.
- `appId` — kept stable on purpose.
- Web favicon / `<title>` — not part of this request (native app only).

## Files changed
- `capacitor.config.ts`
- `capacitor.config.dev.ts`
- `resources/icon.png` (regenerated)
- `resources/splash.png` (regenerated)
- `scripts/qa-mobile-checklist.md`

## Verification
- `grep appName capacitor.config*.ts` → both show `HealthOS 24`.
- Open `resources/icon.png` preview → cyan-gradient "24" tile matches landing-page logo.
- After user runs `npm run assets:generate && npx cap sync && npx cap run android`, launcher shows **HealthOS 24** with the "24" icon.
