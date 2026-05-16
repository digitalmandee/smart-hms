# Mobile QA Checklist (Wave 2 — native build acceptance)

Walk through every row on a real Android device and (if available) a real iPhone before tagging a release. Mark Pass / Fail / N/A.

## Launch & branding

- [ ] Cold launch shows HealthOS24 teal splash (`#0891b2`) within < 1.5 s
- [ ] Splash dismisses cleanly into dashboard (no white flash)
- [ ] App icon on home screen matches `resources/icon.png` (rounded teal background, logo centered)
- [ ] Status bar tinted teal, content not clipped on notch devices
- [ ] App name reads "smart-hms" (or rebrand value configured in `capacitor.config.ts`)

## Offline / network

- [ ] First login online, then airplane-mode + relaunch → dashboard loads from cache
- [ ] Create/edit an OPD note while offline → "Saved offline" toast
- [ ] Disable airplane mode → toast "Synced N pending changes" appears
- [ ] Network drop mid-session does not crash the WebView

## Auth & biometric (N5)

- [ ] Email/password sign-in succeeds
- [ ] Prompt "Enable Face ID / fingerprint?" appears on first success
- [ ] After logout, biometric button visible on login screen
- [ ] Biometric prompt restores session without typing password
- [ ] Lockout (5 wrong attempts) wipes stored credentials, falls back to password

## Push notifications (N6)

- [ ] OS prompt for notification permission on first launch
- [ ] Granting permission inserts a row in `device_registrations` (token + platform + user_id)
- [ ] Sending a test push from `send-push-notification` edge function delivers within 30 s
- [ ] Tapping push opens the correct in-app route (appointment / lab result / message)

## Deep links (N7)

- [ ] `app.lovable.0eeac6953ca245ba87e8f046d5957181://~oauth?code=test` opens app and routes to `/~oauth`
- [ ] HyperPay sandbox payment → return URL deeplinks back to invoice page
- [ ] Nafath verification callback lands on `/app/settings/ksa/nafath`
- [ ] Magic-link from email opens app (not browser) on Android

## Native UX (N3, N8)

- [ ] No notch / camera-cutout overlap on header
- [ ] No home-indicator overlap on bottom nav (iPhone X+)
- [ ] Keyboard does not cover focused input
- [ ] Android hardware back button pops route stack
- [ ] At root, hardware back shows "Exit app?" prompt
- [ ] Haptic feedback fires on bottom-nav taps and form submits
- [ ] Pull-to-refresh works on Dashboard, Appointments, Tasks

## Role-aware routing (N4)

- [ ] Login as doctor → lands on `/mobile/doctor` (not desktop dashboard)
- [ ] Login as nurse → lands on `/mobile/nurse`
- [ ] Login as staff (reception/admin) → lands on `/mobile/staff`
- [ ] Login as patient → lands on `/portal/dashboard`
- [ ] "Switch to desktop view" toggle (in profile) works and persists across launches

## i18n (EN / AR / UR)

- [ ] Switch to Arabic → entire UI flips RTL, bottom nav mirrors, status bar text reads RTL
- [ ] Switch to Urdu → all strings translated (no English fallback visible on mobile screens)
- [ ] Biometric prompt text uses selected language
- [ ] Push notification body respects user locale

## Offline-sync resume (N9)

- [ ] App.appStateChange `isActive: true` triggers `flushOnResume("resume")`
- [ ] Network.networkStatusChange `connected: true` triggers `flushOnResume("online")`
- [ ] When outbox is empty, no toast appears (silent)
- [ ] When N > 0 items synced, toast surfaces with exact count

## Module accessibility (Wave-2 scope reminder)

These modules use the responsive desktop layout inside the WebView (no dedicated `/mobile/*` screen — by design):
- [ ] Finance reports load and scroll horizontally cleanly
- [ ] HR admin pages usable (forms scroll, dropdowns open)
- [ ] Warehouse WMS scannable workflows functional
- [ ] Surgery OT board readable

If any of these are unusable on phone, file a Wave-3 ticket for a dedicated mobile twin.

## Build artefacts

- [ ] `npm run build:mobile:android` produces `android/app/build/outputs/apk/release/app-release.apk`
- [ ] APK installs on a real device without "blocked by Play Protect"
- [ ] APK size < 30 MB (warn if larger)
- [ ] `npm run build:mobile:ios` produces a workspace openable in Xcode without errors

## Release prerequisites (one-time, per platform)

**Android**
- [ ] Keystore generated and referenced in `android/app/build.gradle` `signingConfigs.release`
- [ ] `versionCode` and `versionName` bumped
- [ ] Privacy policy URL configured in Play Console
- [ ] All declared permissions justified in Play Console data-safety form

**iOS**
- [ ] Apple Developer account active, App ID matches `appId` in `capacitor.config.ts`
- [ ] Provisioning profile + distribution cert installed in Xcode
- [ ] `CFBundleShortVersionString` and `CFBundleVersion` bumped
- [ ] App Privacy nutrition labels filled in App Store Connect
- [ ] Face ID / Camera / Location usage strings present in `Info.plist`

---

When every required row is Pass, the build is ship-ready. File any failures as blocker tickets before publishing.
