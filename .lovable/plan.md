# Pause Wave 2 — Native mobile build (COMPLETE)

## Chunk status

```text
N1  [DONE] Production bundle mode (no server.url) + dev profile
N2  [DONE] Native boot orchestrator (splash, status bar, locale, role-routing)
N3  [DONE] Safe-area + viewport CSS (notch, gesture bar, keyboard)
N4  [DONE] Native shell routing (auto-redirect by role)
N5  [DONE] Biometric login (Face ID / fingerprint) + secure-storage session
N6  [DONE] Push notifications wiring (FCM/APNs → device_registrations)
N7  [DONE] Deep-link handler (payments, Nafath, magic links → /~oauth)
N8  [DONE] Haptics + native gestures (back button, pull-to-refresh)
N9  [DONE] Offline sync resume hook (App resume → flush sync_outbox)
N10 [DONE] Branded app icon + splash (1024 source → all densities)
N11 [DONE] Android/iOS native config (permissions, ATS, gradle bumps)
N12 [DONE] Build & QA scripts + QA checklist
```

## Wave-2 deliverable status (final)

| # | Chunk | Evidence |
|---|---|---|
| N1 | Prod / dev config split | `capacitor.config.ts` (no `server.url`) + `capacitor.config.dev.ts` |
| N2 | Boot orchestrator | `src/lib/native/boot.ts` invoked from `src/main.tsx` |
| N3 | Safe-area + viewport CSS | `index.css` tokens + `safe-area-*` classes on `BottomNavigation` |
| N4 | Role-based routing | `src/components/native/NativeRouteGuard.tsx` mounted in `App.tsx` |
| N5 | Biometric login | `src/lib/native/biometric.ts` + login-page integration |
| N6 | Push notifications | `usePushNotifications` registers token + upserts `device_registrations` |
| N7 | Deep-link handler | `src/lib/native/deep-links.ts` + `App.appUrlOpen` in boot |
| N8 | Haptics + back button | `useHaptics`, `useBackButton`, single shared boot listener |
| N9 | Offline sync resume | `flushOnResume` in boot, toast surfaces synced count |
| N10 | Branded icon + splash | `resources/icon.png`, `resources/splash.png`, `npm run assets:generate` |
| N11 | Native config | Documented in `scripts/build-mobile.md` (manifests are post-`cap add`) |
| N12 | Build + QA scripts | `package.json` mobile scripts + `scripts/qa-mobile-checklist.md` |

## Native-optimized modules

Role-aware native shells exist for **Patient, Doctor, Nurse, Staff/Reception, Pharmacist, Lab technician** (via `BottomNavigation` filter + `NativeRouteGuard`). Native pages: Dashboard, Appointments, Tasks, Pharmacy, Lab, Notifications, Profile, More.

Modules that intentionally use the responsive desktop layout inside the WebView (Wave-2 scope decision — no dedicated mobile twin): Finance reports, HR admin, Warehouse WMS, Surgery OT board, Super-admin. A "Switch to desktop view" toggle in profile lets power users opt in everywhere.

## Branding completeness

- Brand color `#0891b2` (teal-cyan) wired into: SplashScreen plugin, StatusBar, Android `backgroundColor`, iOS `backgroundColor`, generated icon background, splash background.
- Source assets in `resources/icon.png` (1024²) and `resources/splash.png` (1920²).
- Per-density Android / iOS PNGs produced by `npm run assets:generate` after the user runs `npx cap add android/ios` locally.
- App display name: `smart-hms` in `capacitor.config.ts` — rename here if the public name should differ.

## What ships in this push vs. what the user runs locally

| Done in sandbox | User runs locally after `git pull` |
|---|---|
| All TS/CSS/config/docs/assets | `npm install` |
| `package.json` mobile scripts | `npx cap add android` (and/or `ios`) |
| `scripts/qa-mobile-checklist.md` | `npm run assets:generate` |
| `scripts/build-mobile.md` release section | `npm run build:mobile:android` |
| i18n strings (EN/AR/UR) | Walk QA checklist on real device |

## Out of scope (deferred to Wave 3)

- App Store / Play Store submission (signing keys, screenshots, listing copy)
- CodePush / over-the-air updates
- Background sync (WorkManager / BGTaskScheduler)
- In-app purchase (Apple/Google billing)
- Dedicated mobile twins for Finance / HR / Warehouse / Surgery / Super-admin

---

**Wave 2 closed.** Run `git pull` → `npm install` → `npx cap add android` → `npm run assets:generate` → `npm run build:mobile:android` to produce the APK, then walk `scripts/qa-mobile-checklist.md`.
