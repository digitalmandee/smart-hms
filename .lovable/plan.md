# Pause Wave 2 — ship a true native mobile build

## Goal
After `git pull` + `npm install` + `npm run build` + `npx cap sync`, the user can run `npx cap run android` (or open in Android Studio) and get a **real native APK** — not a web wrapper pointing at the Lovable preview URL. Doctors, nurses, staff, and patients each get a role-aware native shell with proper mobile UX.

## Current state (audit findings)

| Area | Status | Issue |
|---|---|---|
| `capacitor.config.ts` | Hot-reload mode | `server.url` points to `lovableproject.com` → APK loads web, not local bundle |
| Capacitor plugins | Installed | All 14 core plugins already in `package.json` |
| `src/lib/native/index.ts` | Wrappers exist | Missing: haptics, status bar, splash control, app state, deep links, push registration |
| Mobile layouts | Partial | `MobileLayout` + role dashboards exist (`PatientMobile`, `DoctorMobile`, `NurseMobile`, `StaffMobile`) but not entered by default on native |
| Routing on native | Web parity | Native build should auto-route to `/mobile/*` based on role, not show full desktop UI |
| Safe-area insets | Missing | No `env(safe-area-inset-*)` handling → notch/home-indicator overlap |
| Biometric login | WebAuthn only | No true Face ID / fingerprint — need `@aparajita/capacitor-biometric-auth` |
| Splash / icons | Default | No branded `icon.png` / `splash.png` generated for Android/iOS |
| Push notifications | Hook exists | Token registration not wired into `device_registrations` on native boot |
| Offline sync | Works on web | Needs `App` listener to flush outbox on resume |
| Deep links / OAuth return | Not configured | `appUrlOpen` not handled → payments/Nafath can't return to app |

## Chunk plan (12 chunks, ship in 1 push)

```text
N1  [DONE] Switch to production bundle mode (remove server.url, add dev profile)
N2  [DONE] Native boot orchestrator (splash, status bar, locale, role-routing)
N3  [DONE] Safe-area + viewport CSS (notch, gesture bar, keyboard avoidance)
N4  [DONE] Native shell routing (auto-redirect to /mobile/* on native by role)
N5  [DONE] Biometric login (Face ID / fingerprint) + secure-storage session
N6  [DONE] Push notifications wiring (FCM/APNs token → push_device_tokens)
N7  [DONE] Deep-link handler (payments, Nafath, magic links → /~oauth)
N8  [DONE] Haptics + native gestures (back button, pull-to-refresh, swipe)
N9  [DONE] Offline sync resume hook (App resume → flush sync_outbox)
N10 [DONE] Branded app icon + splash (1024 source → all Android/iOS densities)
N11 Android/iOS native config (permissions manifest, ATS, gradle bumps)
N12 Build & QA scripts (build:mobile:prod, doctor on Android emulator)
```

## Technical details

### N1 — Two build profiles
- `capacitor.config.ts` → split into `capacitor.config.ts` (production, no `server.url`) + `capacitor.config.dev.ts` (with hot-reload URL).
- Add `npm run cap:dev` script that copies dev config before sync.
- Production APK will load `dist/` from inside the app — works fully offline once auth token is cached.

### N2 — `src/lib/native/boot.ts`
Single entry called from `main.tsx` when `Capacitor.isNativePlatform()`:
1. Hide splash after first paint (`SplashScreen.hide()`)
2. Set status bar style per theme (`StatusBar.setStyle`, `setBackgroundColor`)
3. Lock orientation to portrait on phone (`ScreenOrientation`)
4. Restore locale from `Preferences` (EN/AR/UR) → apply RTL on AR
5. Register push token + device → `device_registrations` table
6. Wire `App.addListener('appStateChange', ...)` for sync resume
7. Wire `App.addListener('appUrlOpen', ...)` for deep links
8. Wire hardware back button on Android (`App.addListener('backButton', ...)`)

### N3 — Safe-area CSS
- Add to `index.css`: `--safe-top`, `--safe-bottom`, `--safe-left`, `--safe-right` from `env(safe-area-inset-*)`.
- `MobileHeader` → `padding-top: max(env(safe-area-inset-top), 12px)`.
- `BottomNavigation` → `padding-bottom: env(safe-area-inset-bottom)`.
- Keyboard avoidance via `@capacitor/keyboard` `resize: 'native'`.

### N4 — Native shell routing
- New `src/components/NativeRouteGuard.tsx`: on native, if user role is `doctor` → redirect `/` to `/mobile/doctor`; nurse → `/mobile/nurse`; staff → `/mobile/staff`; patient → `/portal/dashboard` (already mobile-friendly).
- Desktop web behavior unchanged.
- Add native-only "Switch to desktop view" toggle (Preferences-stored) for power users.

### N5 — Biometric login
- Install `@aparajita/capacitor-biometric-auth`.
- New `useBiometricLogin` hook: after first successful password login on native, prompt to enable biometric. Store Supabase refresh token in `@capacitor/preferences` with biometric gate.
- Login page on native shows "Sign in with Face ID / Fingerprint" if previously enrolled.

### N6 — Push notifications
- Extend existing `usePushNotifications` to call `PushNotifications.register()` on native boot.
- On `registration` event → upsert `device_registrations` (token, platform, user_id, app_version).
- Foreground handler routes notification taps to the right screen (appointment, lab result, message).
- Reuse existing `send-push-notification` edge function (no backend changes).

### N7 — Deep links
- Configure `App.appUrlOpen` to parse `app.lovable.0eeac6953ca245ba87e8f046d5957181://` URLs.
- Whitelist paths: `/~oauth`, `/portal/invoices/:id`, `/app/appointments/:id`.
- Update `payment-create` to use the custom scheme as `returnUrl` when called from native (detect via `X-Native-Platform` header).
- Update Android `AndroidManifest.xml` + iOS `Info.plist` `CFBundleURLTypes` with the scheme.

### N8 — Haptics + gestures
- Existing `useHaptics` hook wired to button taps on mobile screens (light impact on nav, medium on submit, success/warning on toasts).
- Android hardware back: pop route stack; if at root, prompt exit.
- Pull-to-refresh on `MobileDashboard`, `MobileAppointmentsPage`, `MobileTasksPage` via Capacitor-friendly wrapper.

### N9 — Offline sync resume
- On `App.addListener('appStateChange', { isActive })` → if active and online, call `flushOutbox()` from `src/lib/offline-sync/sync-engine.ts`.
- On `Network.addListener('networkStatusChange')` → same flush trigger.

### N10 — Icon + splash
- Generate branded 1024×1024 `icon.png` (HealthOS24 logo on `#0891b2`) + 2732×2732 `splash.png`.
- Add `@capacitor/assets` dev dep + `npx capacitor-assets generate` step in `scripts/build-mobile.md`.
- Output goes into `android/app/src/main/res/` and `ios/App/App/Assets.xcassets/` after first `cap add`.

### N11 — Native config
- **Android** — `android/app/src/main/AndroidManifest.xml` additions documented in `scripts/build-mobile.md` (since `android/` is generated post-pull):
  - Permissions: `INTERNET`, `ACCESS_NETWORK_STATE`, `CAMERA`, `ACCESS_FINE_LOCATION`, `POST_NOTIFICATIONS`, `USE_BIOMETRIC`, `VIBRATE`.
  - Deep link intent filter for custom scheme.
  - `targetSdkVersion 34`, `minSdkVersion 23`.
- **iOS** — `ios/App/App/Info.plist` snippets documented:
  - `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSLocationWhenInUseUsageDescription`, `NSFaceIDUsageDescription`, `NSMicrophoneUsageDescription`.
  - `CFBundleURLTypes` for deep links.
  - ATS exception only for development.

### N12 — Build scripts + QA
Update `scripts/build-mobile.md` with:
```bash
# Production APK (no remote URL)
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```
Add `scripts/build-mobile-dev.md` for hot-reload workflow (kept separate).
QA checklist: install APK → verify offline launch, biometric prompt, push token registration, role-based home, RTL on Arabic, deep-link return from HyperPay sandbox.

## i18n
All new native UI strings (biometric prompts, "Switch to desktop", deep-link errors, push permission rationale) added to EN/AR/UR — per project rule.

## Out of scope (kept for Wave 2)
- App Store / Play Store submission (signing keys, screenshots, store listing copy)
- Codepush / over-the-air updates
- Background sync (WorkManager / BGTaskScheduler)
- In-app purchase (Apple/Google billing)

## Deliverable
After 12 chunks: a `git pull` → `npm i` → `npx cap add android` → `npm run build` → `npx cap sync` → `cd android && ./gradlew assembleRelease` produces a signed-debug APK that **runs fully native, no Lovable URL embedded**, with role-aware native shells for every user type.

---

**Approve to start Chunk N1 — Production bundle mode.** Reply "next chunk" between each.
