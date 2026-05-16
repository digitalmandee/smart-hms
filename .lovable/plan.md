# Chunk N12 — Build & QA Scripts + Final Native-Readiness Audit

Final chunk. Two parts: (1) ship the missing build/QA tooling, (2) audit every prior chunk against the codebase and produce a pass/fail matrix so we can honestly answer *"is everything native-optimized and branded?"*.

## Part A — Build & QA tooling (the only code work left)

1. **`package.json` scripts** — add convenience commands:
   - `cap:sync:dev` — copy `capacitor.config.dev.ts` → `capacitor.config.ts`, then `cap sync`
   - `cap:sync:prod` — restore production config from git, then `cap sync`
   - `build:mobile` — `npm run build && npx cap sync`
   - `build:mobile:android` — full prod APK pipeline (build + sync + gradle assembleRelease) documented (gradle step runs locally, not in sandbox)
   - `assets:generate` — already added in N10, verify intact

2. **`scripts/qa-mobile-checklist.md`** (new) — manual QA matrix the tester walks through on a real device:
   - Cold launch < 3 s, branded splash visible
   - Offline launch works after first login (auth cached)
   - Biometric enrol + re-login (Face ID / fingerprint)
   - Push token registered → row appears in `device_registrations`
   - Deep link: open `app.lovable.<id>://~oauth?code=...` from another app → routes correctly
   - Payment return: HyperPay sandbox → redirects back into app
   - Hardware back button on Android: pops route, prompts on root
   - Pull-to-refresh on Dashboard / Appointments / Tasks
   - Safe-area: no notch overlap, no home-indicator overlap, keyboard does not cover inputs
   - Role routing: doctor → `/mobile/doctor`, nurse → `/mobile/nurse`, staff → `/mobile/staff`, patient → `/portal/dashboard`
   - i18n: switch to Arabic → RTL flips, switch to Urdu → strings translated
   - Outbox flush on resume: airplane-mode an edit → restore network → toast "Synced N pending changes"

3. **`scripts/build-mobile.md`** — append a final "Release checklist" section linking to the QA file and listing keystore / provisioning-profile prerequisites.

4. **`.lovable/plan.md`** — mark N12 `[DONE]`, add a "Wave-2 deliverable status" summary at the bottom.

## Part B — Audit matrix (read-only, included in plan response after approval)

Each prior chunk re-verified against actual files. Expected findings:

| # | Chunk | Code present | Notes |
|---|---|---|---|
| N1 | Prod config split | `capacitor.config.ts` (no server.url) + `capacitor.config.dev.ts` | PASS |
| N2 | Boot orchestrator | `src/lib/native/boot.ts` invoked from `main.tsx` | PASS |
| N3 | Safe-area CSS | `index.css` tokens + `mobile-bottom-nav`/`safe-area-*` classes used in `BottomNavigation` | PASS |
| N4 | Native role routing | `NativeRouteGuard` mounted in App router | verify |
| N5 | Biometric | `src/lib/native/biometric.ts` + login-page integration | PASS |
| N6 | Push registration | `usePushNotifications` registers + upserts `device_registrations` | verify table name (`push_device_tokens` vs `device_registrations`) |
| N7 | Deep links | `src/lib/native/deep-links.ts` + `App.appUrlOpen` in boot | PASS |
| N8 | Haptics + back btn | `useHaptics`, `useBackButton`, single boot listener | PASS |
| N9 | Resume sync | `flushOnResume` in boot, toast surfaced | PASS |
| N10 | Icon + splash | `resources/icon.png`, `resources/splash.png`, `assets:generate` script | PASS |
| N11 | Native config | Documented in `scripts/build-mobile.md` (manifests are generated post-`cap add`) | PASS — docs only, as designed |

**Native modules optimized?** — Every page that has a `/mobile/*` twin is reachable via `NativeRouteGuard`. Modules without a dedicated mobile screen (Finance reports, HR admin, Warehouse WMS, Surgery OT board) intentionally fall back to the responsive desktop layout inside the WebView — this is by design (Wave 2 scope), not a gap. Will call this out explicitly in the deliverable summary so it isn't mistaken for a bug.

**Branding completed?** — Brand assets (`#0891b2` teal-cyan, HealthOS24 logo) wired into: splash plugin config, status bar, Android `backgroundColor`, iOS `backgroundColor`, generated icon + splash sources. The actual per-density PNGs are produced by `npm run assets:generate` after `npx cap add android/ios` runs locally — that's a one-command step in the user's terminal, not something we can ship from the sandbox.

## What this chunk does NOT do

- Cannot run `gradlew assembleRelease` from sandbox (no Android SDK / JDK)
- Cannot execute `npx cap add android/ios` from sandbox (generates platform folders the user must commit)
- Cannot test on a real device

These are user-side steps documented in the QA checklist.

## Files touched

- **edit**: `package.json` (scripts only)
- **edit**: `scripts/build-mobile.md` (append release checklist)
- **edit**: `.lovable/plan.md` (mark N12 done + Wave-2 status)
- **new**: `scripts/qa-mobile-checklist.md`

Approve to ship N12 and close out Wave 2.
