# Fix native mobile: keyboard breakage, login crash, wrong splash logo

Three separate native issues:

## 1. Keyboard pushes login UI off-screen (image-83)

**What's happening:** `MobileLayout` uses `h-screen overflow-hidden` and `capacitor.config.ts` has `Keyboard.resize: 'native'`. With `native` resize Android shrinks the WebView but the absolute-positioned gradient header on the login page + `min-h-screen` inner div collapses, leaving only the focused email input floating over a blank background.

**Fix:**
- Change Capacitor config: `Keyboard.resize: 'body'` (or `ionic`) on both `capacitor.config.ts` and `capacitor.config.dev.ts`. `body` is the safe default — resizes the document so flex layouts stay intact.
- In `src/pages/mobile/MobileLoginPage.tsx`, replace `min-h-screen flex flex-col` with a scrollable container (`flex min-h-screen flex-col overflow-y-auto`) and let the header shrink instead of using `pt-16 pb-12` absolute curve when keyboard is open. Specifically:
  - Wrap the page in `<div className="min-h-screen flex flex-col bg-background safe-area-all overflow-y-auto">`.
  - Add `flex-shrink-0` to the gradient header block.
- In `MobileLayout`, keep `h-screen overflow-hidden` for app pages but **bypass it on `/mobile/login`** — return a plain `<Outlet />` wrapper without the h-screen constraint when `isAuthPage` is true, so the form can scroll freely with the keyboard.

## 2. "Health OS 24 keeps stopping" crash on login (image-82)

**Likely root cause** (read of `MobileLoginPage` + `bootNative`): on successful sign-in, three things race:
- `signIn()` triggers `onAuthStateChange` → AuthContext refetches profile/roles
- `promptEnableBiometric()` reads the session and calls native `BiometricAuth`
- `bootNative`'s push registration listener fires `upsertDeviceToken` which awaits inside `onAuthStateChange` indirectly

On Android the native crash is almost always one of:
- (a) `Device.getId()` / `PushNotifications.register()` failing with an unhandled native exception after auth (no permission), OR
- (b) `signInWithBiometric` re-entering when there's no stored token, OR
- (c) An async throw in the AuthContext listener that bubbles past React error boundary.

**Fix:**
- Add a top-level `<NativeErrorBoundary>` around the mobile routes that catches and renders a "Something went wrong — restart" screen instead of letting Android kill the process.
- In `src/lib/native/boot.ts`, wrap **every** `PushNotifications.addListener` / `upsertDeviceToken` / `Device.getId` call in try/catch (some already are; audit the remaining ones in the push registration block — the tail of the file isn't visible yet but the visible code shows several unguarded `await`s in the listener callbacks).
- In `MobileLoginPage.onSubmit`, do **not** `await promptEnableBiometric` inside the submit handler — fire it after navigate, with try/catch, so a native biometric prompt failure can't break the post-login flow.
- In the same file, when `useEffect` runs `signInWithBiometric()` on mount it should bail early when running on web (or when Capacitor is not native) — biometric module import on web should be tree-shaken or no-op'd.
- Confirm `AuthContext.onAuthStateChange` does NOT `await` Supabase calls inside the listener body (deferred via `setTimeout` 0 if it does) — known Supabase deadlock pattern.

I'll need to read `src/contexts/AuthContext.tsx`, `src/lib/native/biometric.ts`, and the tail of `src/lib/native/boot.ts` while implementing to point fixes at the actual offenders.

**To prove the fix:** ask the user (after they rebuild and reinstall) to capture the Android logcat for the crash — `adb logcat *:E | grep -i healthos` — so we see the actual stack if it still happens. Without logcat we are guessing; the hardening above is defensive.

## 3. Splash logo is not the main logo

**What's happening:** Even after we updated `resources/splash.png` last turn, the user is still seeing the old splash because **native assets weren't regenerated**. Native Android reads `android/app/src/main/res/drawable-*/splash.png`, which is the file that was baked in before our update. `npx cap sync` alone does NOT rebuild these — `npm run assets:generate` (capacitor-assets) does.

Additionally, the splash we generated puts the "24" tile small in the center with a "HealthOS" wordmark below it. Android's splash uses `CENTER_CROP`, so on tall phones the wordmark may get cropped. Best practice: make the splash visual **just the large "24" tile centered on the cyan brand background** (no wordmark) so it survives any crop.

**Fix:**
- Regenerate `resources/splash.png` as a clean centered "24" mark (no "HealthOS" text), 1920×1920, cyan `#0891b2` background, large white "24" with heartbeat — matches what's now on the launcher icon.
- Update `resources/README.md` and `scripts/build-mobile.md` (if present) to make the regen step crystal clear:
  ```
  npm install
  npm run assets:generate    # MANDATORY after any resources/*.png change
  npx cap sync
  npx cap run android
  ```
- Add a one-line note to `scripts/qa-mobile-checklist.md` reminding QA to verify the splash shows the "24" mark, not the old "smart-hms" placeholder.

## Files I will change

- `capacitor.config.ts` — `Keyboard.resize: 'body'`
- `capacitor.config.dev.ts` — same
- `src/pages/mobile/MobileLoginPage.tsx` — scrollable layout, defer biometric prompt
- `src/layouts/MobileLayout.tsx` — bypass `h-screen overflow-hidden` on `/mobile/login`
- `src/lib/native/boot.ts` — harden push/device listeners with try/catch
- `src/contexts/AuthContext.tsx` — only if the read confirms in-listener `await`s; defer with `setTimeout(0)`
- `resources/splash.png` — regenerate, no wordmark
- `resources/README.md`, `scripts/qa-mobile-checklist.md` — clarify regen + QA step
- (Optional) new `src/components/native/NativeErrorBoundary.tsx` wrapping mobile routes

## Out of scope

- I can't run `npx cap sync` / `assets:generate` here — those run on your machine. After my edits land you must `git pull && npm install && npm run assets:generate && npx cap sync && npx cap run android` to see all three fixes.
- I won't touch the desktop login flow.

## Verification

- Crash: rebuild + reinstall, attempt login. If it still crashes, send `adb logcat *:E` output and I'll target the exact native exception.
- Keyboard: tap email field — full login form should remain visible and scroll, no blank background.
- Splash: relaunch — should show the cyan "24" heartbeat mark identical to the launcher icon.
