## Goals
1. Make the launch splash feel native — branded HealthOS logo, no white flash, smooth handoff to the app.
2. When the device loses internet, never show the Android/iOS WebView "Webpage not available" error. Instead show a native-feel offline banner + toast, and auto-recover when the network returns.

## Findings

### Splash
- `capacitor.config.ts` uses `launchShowDuration: 1500`, `launchAutoHide: false`, and relies on `resources/splash.png` — but **no `@capacitor/assets` run** has generated the per-density Android `drawable-*/splash.png` + `mipmap-*/ic_launcher_*.png` from the brand logo. Result: Android falls back to the default Capacitor splash / a stretched image, and the icon shown isn't the HealthOS 24 logo.
- Status bar config says `style: 'dark'` but `boot.ts` sets `Style.Light` — text colour flickers on first paint.
- The 3 s safety timeout in `boot.ts` hides the splash even when the app is still mounting, causing a brief white flash before the first React paint.

### Offline
- No network-loss UI exists. `boot.ts` only flushes the outbox when `networkStatusChange` reports connected; there's no banner, toast, or interceptor for the disconnected state.
- The infamous "Webpage not available" is rendered by the native WebView when `server.url` is unreachable. The **production** config has no `server.url`, so the prod build only fails on network requests — but those requests (Supabase, edge functions) currently throw raw errors with no friendly UX. Dev config (`capacitor.config.dev.ts`) does point at the sandbox URL and will show the WebView error if the device drops Wi-Fi while running a dev build.

## Plan

### 1. Branded splash + icon
- Add a small script entry `npm run native:assets` that runs `npx @capacitor/assets generate --iconBackgroundColor "#0891b2" --splashBackgroundColor "#0891b2"` against `resources/icon.png` + `resources/splash.png`. Document in `scripts/qa-mobile-checklist.md` that the user runs it once per logo change, then `npx cap sync`.
- Replace `resources/splash.png` source with a centred HealthOS 24 logo on a 2732×2732 brand-cyan background (generated via `imagegen` — premium for crisp text) and `resources/icon.png` with a 1024×1024 logo mark on the same background.
- Tune `capacitor.config.ts` SplashScreen plugin:
  - `launchShowDuration: 2500` (gives JS time to mount on cold start)
  - `launchAutoHide: false` (kept — boot orchestrator hides manually)
  - `androidScaleType: 'CENTER_CROP'` → `'CENTER_INSIDE'` so the logo isn't cropped on tall phones
  - `useDialog: false`, `androidSplashResourceName: 'splash'`
  - `showSpinner: true`, `spinnerColor: '#ffffff'`
- Align status bar: change `boot.ts` to `Style.Dark` to match config (white icons on cyan background — matches "dark" style in Capacitor's enum, which is light-on-dark).
- In `main.tsx`, hide the splash **after the first React commit** (inside a `useEffect` in `App.tsx` root or `requestAnimationFrame` after `createRoot.render` returns), not on a blind 3 s timer. Keep the 5 s safety net as a last-resort fallback only.

### 2. Native-style offline UX
- New file `src/lib/native/network.ts`:
  - `useOnlineStatus()` hook combining `navigator.onLine`, `window` online/offline events, and `@capacitor/network` `networkStatusChange` listener.
  - Exports a singleton `getOnlineStatus()` for non-React callers.
- New component `src/components/mobile/OfflineBanner.tsx`:
  - Sticky top bar (under the safe-area header) that slides in when offline: WiFi-off icon + localised text "You're offline — changes will sync when you reconnect".
  - Hidden on `/auth/*` and `/mobile/login` so it doesn't clutter the login screen.
  - Mounted once inside `MobileLayout` (and also `DashboardLayout` for the PWA web view, so the same UX works in the browser).
- Toasts (sonner) on transition only — single toast per state change, debounced 1 s to avoid flicker on flaky networks:
  - online → offline: `toast.error("You're offline")` with description "We'll keep working with cached data."
  - offline → online: `toast.success("Back online")` with description if `outboxCounts().pending > 0`: "Syncing your changes…"
- i18n strings in **English, Urdu, Arabic** under keys `mobile.offline.*`.

### 3. Prevent WebView "Webpage not available"
- Production: confirmed safe — no `server.url`, assets bundle is local. Add a runtime guard: in `boot.ts`, on `networkStatusChange` → `disconnected`, set a flag and have a global `fetch` wrapper short-circuit Supabase calls to a rejected promise with a typed `OfflineError` so callers don't trigger native error pages from XHR redirects.
- Dev (`capacitor.config.dev.ts`): add `server.errorPath` pointing at a tiny `public/offline.html` so even the dev hot-reload build shows a branded offline page instead of the OEM WebView error. Document this in the dev config header comment.
- Add `errorPath` only to dev config — production already loads locally and never hits this path.

### 4. i18n keys (en / ur / ar)
```
mobile.offline.banner       "You're offline — changes will sync when you reconnect"
mobile.offline.toastTitle   "You're offline"
mobile.offline.toastBody    "We'll keep working with your cached data."
mobile.online.toastTitle    "Back online"
mobile.online.toastBody     "Syncing your changes…"
```

### 5. QA checklist additions (`scripts/qa-mobile-checklist.md`)
- Cold-start launch shows HealthOS logo on cyan splash, status bar icons stay white, no white flash before first paint.
- Toggle Airplane Mode mid-session → offline banner appears within ~1 s, sonner toast fires once, no WebView error page.
- Disable Airplane Mode → "Back online" toast, banner hides, outbox flushes.
- Verify in all 3 languages.

## Technical notes
- No backend, schema, or RLS changes.
- All native imports stay guarded by `Capacitor.isNativePlatform()` so the web build is unaffected.
- The splash logo regeneration step requires the user to run `npm run native:assets` once locally (it can't be done from the Lovable sandbox because the generator writes into `android/` / `ios/` native projects). The plan will include clear instructions.

## Out of scope
- Building a full offline-first mode for new pages (queueing every mutation). Existing offline-sync outbox is reused; no new offline workflows.
- iOS launch-screen storyboard customisation beyond what `@capacitor/assets` produces.