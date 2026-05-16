# Mobile build (Capacitor)

The Lovable web bundle is wrapped as a native iOS/Android app via Capacitor.

## Two build profiles

| File | Purpose | `server.url` |
|---|---|---|
| `capacitor.config.ts` | **Production** APK / IPA — bundled `dist/` loads inside the app | none (offline-capable) |
| `capacitor.config.dev.ts` | **Development** hot-reload against the Lovable sandbox | Lovable preview URL |

The production config is the default. Swap configs only when you want hot-reload on a physical device during development.

## One-time setup (after exporting to GitHub)

```bash
git pull
npm install
npx cap add android       # Android Studio required
npx cap add ios           # macOS + Xcode required (optional)
```

## Production build (ship-ready APK)

```bash
npm run build                  # produces dist/
npx cap sync android           # copies dist/ into android/
cd android
./gradlew assembleRelease      # → android/app/build/outputs/apk/release/app-release.apk
```

For a signed release APK you must configure a keystore in `android/app/build.gradle` (`signingConfigs.release`) — see Android docs. The `assembleDebug` task produces an unsigned debug APK without any extra setup.

## Development build (hot-reload from sandbox)

```bash
cp capacitor.config.dev.ts capacitor.config.ts   # swap to dev profile
npx cap sync android
npx cap run android                              # launches emulator / device
```

When done, restore the production config from git before committing:

```bash
git checkout capacitor.config.ts
```

## Native capabilities wired in this build

| Feature                | Web fallback                     | Native plugin              |
|------------------------|----------------------------------|----------------------------|
| Push notifications     | `Notification` API               | `@capacitor/push-notifications` |
| Local notifications    | `Notification` API               | `@capacitor/local-notifications` |
| Geolocation            | `navigator.geolocation`          | `@capacitor/geolocation`   |
| Camera / photo         | `<input type="file" capture>`    | `@capacitor/camera`        |
| In-app browser (pay)   | `window.open`                    | `@capacitor/browser`       |
| Device identity        | `crypto.randomUUID` + UA         | `@capacitor/device`        |
| Network status         | `navigator.onLine`               | `@capacitor/network`       |
| Haptics                | (no-op)                          | `@capacitor/haptics`       |
| Status bar / splash    | (no-op)                          | `@capacitor/status-bar`, `@capacitor/splash-screen` |
| App lifecycle / links  | (no-op)                          | `@capacitor/app`           |
| Secure preferences     | `localStorage`                   | `@capacitor/preferences`   |
| Biometric              | WebAuthn platform authenticator  | (Chunk N5 adds `@aparajita/capacitor-biometric-auth`) |

All wrappers live in `src/lib/native/` and degrade gracefully in the
browser, so no UI changes are needed for the deployed web app.

## In-app payments

Use `openExternal(checkoutUrl)` from `src/lib/native`. It pops the in-app
Safari/Chrome Custom Tab on device and a normal new tab on web. The hosted
checkout (HyperPay / STC Pay / Tap) returns to the app's custom URL scheme
(see deep-link config in Chunk N7), handled by `App.appUrlOpen`.
