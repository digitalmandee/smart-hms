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

## Deep-link configuration (Chunk N7)

Custom URL scheme: `app.lovable.0eeac6953ca245ba87e8f046d5957181`

The native shell registers this scheme so external services (HyperPay, Tap,
STC Pay, Stripe, Nafath, Supabase magic-link) can redirect users back into
the installed app. All incoming URLs are routed through
`src/lib/native/deep-links.ts` → `resolveDeepLink()` → React Router.

In the frontend, build a callback URL with `getNativeReturnUrl(path)`:

```ts
import { getNativeReturnUrl } from "@/lib/native/deep-links";

// Native → "app.lovable.0eeac6953ca245ba87e8f046d5957181://portal/invoices/123/return"
// Web    → "https://smart-hms.lovable.app/portal/invoices/123/return"
const returnUrl = getNativeReturnUrl(`/portal/invoices/${invoiceId}/return`);
```

### Android — `android/app/src/main/AndroidManifest.xml`

Add inside the main `<activity>` tag:

```xml
<intent-filter android:autoVerify="false">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="app.lovable.0eeac6953ca245ba87e8f046d5957181" />
</intent-filter>
```

### iOS — `ios/App/App/Info.plist`

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>app.lovable.healthos24</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>app.lovable.0eeac6953ca245ba87e8f046d5957181</string>
    </array>
  </dict>
</array>
```

### Supported callback paths

| Path                                   | Purpose                              |
|----------------------------------------|--------------------------------------|
| `/~oauth`                              | Supabase magic-link / OAuth return   |
| `/portal/invoices/:id/return`          | Payment gateway success/fail return  |
| `/app/settings/ksa/nafath`             | Nafath identity verification callback|
| `/portal/dashboard`, `/mobile/dashboard` | Generic open-app deep links        |

## Branded icon + splash (Chunk N10)

Source artwork lives in `resources/` (`icon.png` 1024², `splash.png` 1920²,
brand color `#0891b2`). After `npx cap add android` / `npx cap add ios`,
generate every density in one shot:

```bash
npm run assets:generate
```

This wraps `npx capacitor-assets generate` and writes Android mipmaps +
drawables and iOS `AppIcon.appiconset` / `Splash.imageset`. Commit the
generated files; subsequent `npx cap sync` will copy them into the native
projects automatically.

Re-run whenever `resources/icon.png` or `resources/splash.png` changes.

## Native platform config (Chunk N11)

The `android/` and `ios/` folders are generated by `npx cap add` after you
pull the repo — they are intentionally **not** committed. After your first
`cap add`, apply the patches below once and commit them in your fork.

### Android — `android/app/src/main/AndroidManifest.xml`

Add these permissions just inside the root `<manifest>` element (alongside
the default `INTERNET`):

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.location.gps" android:required="false" />
<uses-feature android:name="android.hardware.fingerprint" android:required="false" />
```

Inside the main `<application>` tag, ensure cleartext is **disabled** for
production (it already is via `capacitor.config.ts > android.allowMixedContent: false`):

```xml
<application
    android:usesCleartextTraffic="false"
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

Create `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

The deep-link intent filter from Chunk N7 also lives in this manifest — see
the **Deep-link configuration** section above.

### Android — `android/variables.gradle`

```gradle
ext {
    minSdkVersion = 23
    compileSdkVersion = 34
    targetSdkVersion = 34
    androidxActivityVersion = '1.8.0'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.12.0'
    androidxFragmentVersion = '1.6.2'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.9.0'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
}
```

`minSdkVersion = 23` is required for `@aparajita/capacitor-biometric-auth`
(Android 6.0+, `BiometricPrompt` API).
`targetSdkVersion = 34` keeps the app Play-Store-eligible (Aug 2024 cutoff).

### iOS — `ios/App/App/Info.plist`

Add inside the root `<dict>`:

```xml
<key>NSCameraUsageDescription</key>
<string>HealthOS24 needs camera access to capture patient photos, prescriptions, and ID documents.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>HealthOS24 needs photo library access to attach documents to patient records.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>HealthOS24 saves invoices and reports to your photo library.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>HealthOS24 uses your location to find the nearest branch and verify on-site attendance.</string>

<key>NSFaceIDUsageDescription</key>
<string>Sign in to HealthOS24 securely with Face ID.</string>

<key>NSMicrophoneUsageDescription</key>
<string>HealthOS24 uses the microphone for Tabeebi AI voice consultations and dictation.</string>

<key>NSContactsUsageDescription</key>
<string>HealthOS24 can add patient guardians from your contacts (optional).</string>

<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
    <string>fetch</string>
</array>

<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

The `CFBundleURLTypes` block from Chunk N7 also belongs here.

### iOS — App Transport Security

The default ATS (HTTPS-only) is correct for production. Do **not** add
`NSAllowsArbitraryLoads`. If you need cleartext for a local dev box, scope
it narrowly:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

`limitsNavigationsToAppBoundDomains: true` is already set in
`capacitor.config.ts` to harden the WKWebView against navigation to
third-party origins.

### iOS — `ios/App/Podfile`

Pin the iOS deployment target to **13.0** (required by Capacitor 6 and the
biometric plugin):

```ruby
platform :ios, '13.0'
```

After editing native files, run:

```bash
npx cap sync
cd ios/App && pod install     # iOS only
```
